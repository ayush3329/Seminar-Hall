/* eslint-disable turbo/no-undeclared-env-vars */
import { User } from "../Schema/UserDetail";
import { Request, Response, response } from 'express';
import { Post } from "../Schema/Posts";
import { Message } from '../Schema/Message';
import bcrypt from "bcrypt";
import jwt, { JsonWebTokenError, JwtPayload, Secret, TokenExpiredError, VerifyOptions } from 'jsonwebtoken'
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { z } from 'zod'
import { LoginReturnType, LoginRequestType } from "@ayush/ui"
import { Genz, SearchUserType, GroupType, Peer2PeerChatType, Rookie, RecentChatsType, ChatsType } from "@ayush/ui/dest/ApiControllerTypes"
import { zRecentChatsUser } from "./Types";

dotenv.config();


//login
export async function Login(req: Request, res: Response<z.infer<typeof LoginReturnType>>) {
  console.log("Login");

  const { username, password } = req.body;
  console.log(username, password);

  if (!username || !password) {
    return res.status(500).json({
      success: false,
      msg: "Please fill all the details before submitting",
    });
  }

  const ZODobj = LoginRequestType.safeParse({ username, password });
  console.log("z-> ", ZODobj);
  if (!ZODobj.success) {
    // console.log("object");
    return (
      res.status(500).json({
        success: false,
        msg: "Zod error"
      })
    )
  }

  try {



    const SearchUser = await User.findOne({ username: username });
    if (!SearchUser) {
      return res.status(404).json({
        success: false,
        msg: "User does not exist",
      });
    }

    const comparePassword = await bcrypt.compare(password, SearchUser.password);
    if (!comparePassword) {
      console.log("Incorrect password");
      return res.status(401).json({
        success: false,
        msg: "Incorrect password, please double check before submitting",
      });
    }

    const payload = {
      username: username,
      email: SearchUser.email,
    };

    console.log(payload);

    const options = {
      expiresIn: "1m",
    };
    const jwtSecret: string = process.env.jwtSecret || '';

    let jwt_TOKEN = jwt.sign(payload, jwtSecret, options);

    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // Date constructor will take time in millisecond and create the Date object out of it

    const cookieOptions = {
      expires: expirationDate,
      sameSite: "none" as const,
      secure: true,
      httpOnly: true,
    };


    return res.cookie("LoginCookie", jwt_TOKEN, cookieOptions).json({
      success: true,
      msg: "Successfully Logged in",
      fullname: SearchUser.fullname,
      profile: SearchUser.profile,
      followers: SearchUser.followers.length,
      following: SearchUser.following.length,
      jwt: jwt_TOKEN
    });
  } catch (e) {
    console.log("Server error, ", e);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
    });
  }
}


//signUP
export async function Signup(req: Request, res: Response) {
  console.log("Signup");
  const { username, fullname, email, password } = req.body;
  console.log(username, fullname, email, password);

  if (!username || !fullname || !email || !password) {
    console.log("not avail");
    return res.status(500).json({
      success: false,
      msg: "Please fill all the details before submitting",
    });
  }
  console.log("Search User Started ", username);
  const SearchUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  console.log(SearchUser);
  if (SearchUser) {
    console.log("exist");
    return res.status(500).json({
      success: false,
      msg:
        SearchUser.email === email
          ? "Email already register"
          : "username already taken",
    });
  }

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);
    const NewUser = await User.create({
      username,
      password: encryptedPassword,
      email,
      fullname,
    });
    console.log("NewUser: ", NewUser);
    return res.status(200).json({
      success: true,
      msg: "Successfully created account",
    });
  } catch (e) {
    console.log("Server Error, ", e);
    return res.status(500).json({
      success: false,
      msg: "Server errro",
    });
  }
}


export async function jwtt(req: Request, res: Response, next: () => void) {
  const { token } = req.body;
  const jwtSecret: Secret = process.env.jwtSecret || '';
  // console.log(token, "\n \n");

  const options: VerifyOptions & { complete: true } = {
    complete: true // This option makes the function return a decoded JWT object with header and payload
  };
  try {
    const resp: JwtPayload = jwt.verify(token, jwtSecret, options)
    console.log(resp.payload.username);
    next();

  } catch (e) {
    if (e instanceof TokenExpiredError) {
      res.send("Token has been expired, please login again to get a new TOKEN")
      return;
    } else if (e instanceof JsonWebTokenError) {
      res.send("Token has beem tampered")
      return;
    } else {
      console.log(e);
      res.send("Something went wrong on server")
      return;
    }
  }

}


export async function SearchUser(req: Request, res: Response<SearchUserType>) {

  console.log("search");
  const { username } = req.params;
  console.log("user-> ", username);

  try {

    const SearchUser = await User.find({
      username: { $regex: `^${username}`, $options: "i" },
    });

    console.log(SearchUser);

    if (SearchUser.length == 0) {

      return res.status(404).json({
        success: false,
        msg: "user does not exist",
      });
    }

    var helper: Genz[] = [];

    for (let i = 0; i < SearchUser.length; i++) {
      var user = SearchUser[i]
      const obj: Genz = { username: user.username, fullname: user.fullname, profile: user.profile };
      helper.push(obj);
    }

    // console.log("helper \n\n");
    // console.log(helper);

    return res.status(200).json({
      success: true,
      msg: "User Found",
      user: helper
    });


  } catch (e) {
    return res.status(401).json({
      success: false,
      msg: "Server error",
    });
  }
}

export async function createGroup(req: Request, res: Response<GroupType>) {

  const { admin, participant } = req.body;
  console.log(admin);
  console.log(participant);

  try {

    const Group = await Message.create({ users: participant, groupChat: true, mainAdmin: admin });

    for (let i = 0; i < participant.length; i++) {
      const save = participant[i];
      const Update = await User.findOneAndUpdate(
        { fullname: save },
        {
          $push: {
            chat: {
              $each: [{ name: Group.id, useen: 0, chatType: "gc" }],
              $position: 0 // This specifies the position to insert (0 means at the beginning)
            }
          }
        }
      );
    }

    console.log("New Group Detail ", Group);

    const participantDetails: Genz[] = []

    for (let i = 0; i < participant.length; i++) {
      const user = participant[i];
      const Detail = await User.findOne({ fullname: user });
      participantDetails.push({ username: Detail.username, fullname: Detail.fullname, profile: Detail.profile })
    }


    return (
      res.status(200).json({
        success: true,
        msg: "Successfull",
        groupDetail: { name: Group.groupName, profile: Group.groupProfile, messages: [], groupChat: true, parti: participantDetails},
        id: Group._id 
      })
    )


  } catch (e) {

    console.log(e);
    return (
      res.status(411).json({
        success: false,
        msg: "Something went wrong"
      })
    )

  }

}

export async function ordinaryChat(req: Request, res: Response<Peer2PeerChatType>) {

  console.log("*** Ordinary Chat Api *** \n");
  const { participant, chatPresent } = req.body;
  console.log(participant, chatPresent);

  try {
    var findChat = null

    if (chatPresent) { //if true -> Chat Exist otherwise there is no chat history with this user
      findChat = await Message.findOne({ users: { $all: participant }, groupChat: false });
    }

    var updateUnseenCount = await User.findOne({ fullname: participant[1] });
    var chats = updateUnseenCount.chat;
    for (let i = 0; i < chats.length; i++) {
      if (chats[i].name === participant[0]) {
        chats[i].unseen = 0;
        break;
      }
    }
    updateUnseenCount = await User.findOneAndUpdate({ fullname: participant[1] }, { chat: chats });

    const findParticipant = await User.findOne({ fullname: participant[0] });


    // console.log("Findchat ", findChat);

    type T1 = { sender: string, receiver: string, message: string, id: string }
    type T2 = { sender: string, receiver: string, message: string, _id: string, createdAt: Date, updatedAt: Date }

    var messageContent: T1[] = [];

    if (findChat?.content !== undefined) {
      for (let i = 0; i < findChat?.content.length; i++) {
        var ptr: T2 = findChat.content[i] as T2;
        var obj: T1 = { sender: ptr.sender, receiver: ptr.receiver, message: ptr.message, id: ptr._id };
        messageContent.push(obj);
      }
    } else {
      console.log("Chat does not exist");
    }

    // console.log('MESSAGE\n\n\n');
    // console.log(messageContent);

    const detail: Rookie = {
      name: findParticipant.username,
      profile: findParticipant.profile,
      messages: messageContent,
      groupChat: false,
      parti: [{ username: findParticipant.username, fullname: findParticipant.fullname, profile: findParticipant.profile }]
    }

    console.log("Detail");
    console.log(detail);

    res.status(200).json({
      success: true,
      msg: "Success",
      detail: detail
    })


  } catch (e) {
    res.status(411).json({
      success: false,
      msg: "Something went wrong"
    })
  }

}

export async function RecentChatsUser(req: Request, res: Response<RecentChatsType>) {
  console.log("RCU");
  console.log(req.body);
  const { fullname } = req.body;

  try {

    console.log(fullname);
    const validInput = zRecentChatsUser.safeParse({ fullname })

    if (!validInput.success) {
      console.log("Invalid");
      return (
        res.status(411).json({
          success: false,
          msg: validInput.error
        })
      )
    }


    const findUser = await User.findOne({ fullname: fullname });

    if (!findUser) {
      return (
        res.status(411).json({
          success: false,
          msg: "User does not exist"
        })
      )
    }
    console.log(findUser);

    const chatLog = findUser.chat;

    console.log("chats ", chatLog);



    var chatHistory: ChatsType[] = []

    for (let i = 0; i < chatLog.length; i++) {
      var user = chatLog[i];
      let find;

      if (user.chatType === "gc") {
        find = await Message.findOne({ _id: user.name });
        console.log(find?.users);
      } else {
        find = await User.findOne({ fullname: user.name });
        console.log(find.fullname);
      }


      chatHistory.push({
        name: user.chatType === "gc" ? find.groupName : find.fullname,
        profile: user.chatType === "gc" ? find.groupProfile : find.profile,
        type: user.chatType === "gc" ? "gc" : "oc",
        gid: user.chatType === "gc" ? find._id : find.fullname,
        useenCount: user.unseen
      })

    }

    console.log("ChatHistory ", chatHistory);

    return (
      res.status(200).json({
        success: true,
        msg: "Successfull",
        chatHistory: chatHistory,
      })
    )
  } catch (e) {
    console.log("Error");
    console.log(e);
    return (
      res.status(500).json({
        success: false,
        msg: "Something went wrong"
      })
    )
  }

}

export async function getGroupInfo(req: Request, res: Response<GroupType>) {
  const { gid } = req.body;
  console.log(gid);

  try {

    const findGroup = await Message.findById({ _id: gid });

    if (!findGroup) {
      console.log(`Group associated with id:${gid} does not exist`);
      return (
        res.status(411).json({
          success: false,
          msg: `Group associated with id:${gid} does not exist`
        })
      )
    }

    console.log(findGroup);

    var participantDetails: Genz[] = [];

    for (let i = 0; i < findGroup.users.length; i++) {
      let ptr = findGroup.users[i];
      let find = await User.findOne({ fullname: ptr });
      participantDetails.push({
        username: find.username,
        fullname: find.fullname,
        profile: find.profile
      })
    }

    const wrapper: Rookie = {
      name: findGroup.groupName,
      profile: findGroup.groupProfile,
      messages: [],
      groupChat: true,
      parti: participantDetails
    }

    return (
      res.status(200).json({
        success: true,
        msg: "Successfull",
        groupDetail: wrapper,
        id: findGroup._id
      })
    )


  } catch (e) {
    console.log(e);
    return (
      res.status(411).json({
        success: false,
        msg: "Something went wrong"
      })
    )
  }

}


type T = {
  success: boolean,
  msg: string
}


export async function createOrdinarChat(req: Request, res: Response<T>) {
  console.log("createOrdinarChat");
  const { participant } = req.body;
  console.log(participant);
  try {
    const createChat = await Message.create({ users: participant, groupChat: false });
    if (!createChat) {
      return (
        res.status(411).json({
          success: false,
          msg: "Unable to create entry"
        })
      )
    }
    let index = 1;
    for (let i = 0; i < participant.length; i++) {
      const update = await User.findOneAndUpdate({ fullname: participant[i] }, { $push: { chat: { name: participant[i + index], unseen: 0, chatType: "oc" } } }, { new: true })
      console.log("Update ", update);
      index = -1;
    }

    return (
      res.status(200).json({
        success: true,
        msg: "Successfull creation"
      })
    )



  } catch (e) {
    console.log("Something went wrong");
    return (
      res.status(411).json({
        success: false,
        msg: "Something went wrong"
      })
    )

  }
}


// Under dev
export async function UpdateSequence(req: Request, res: Response) {
  console.log("Update Sequence");
  const { myFullname, update, increaseUnseenCount } = req.body;

  try {

    var myDetails = await User.findOne({ fullname: myFullname });
    var chats: { name: string, unseen: number, id: Object }[] = myDetails.chat;
    console.log("My chats ", chats);

    var flag = false, index = 0;
    for (let i = 0; i < chats.length; i++) {
      const selected = chats[i];
      if (selected.name === update) {
        index = i;
        flag = true;
        break;
      }
    }

    if (!flag) {

      // Agr code ka flow yha aya hai to iska mtlb hai user ne chats delete kr de hai aur humko fir se add krna hai uski chatHistory me
      console.log("Not Found");
      myDetails = await User.findOneAndUpdate({ fullname: myFullname }, { $push: { chat: { name: update, unseen: 1, chatType: "oc" } } }, { new: true });
      chats = myDetails.chat

    } else {

      const selected = chats[index];
      if (increaseUnseenCount) {
        selected.unseen++;
      }
      console.log("Found ", chats.length, " ", index);
      chats.unshift(selected);
      chats = chats.splice(index + 1, 1);
      console.log("sliced ", chats);

    }


    myDetails = await User.findOneAndUpdate({ fullname: myFullname }, { chat: chats }, { new: true });
    console.log("Updated ", myDetails);
    const chatLog = myDetails.chat;

    var chatHistory: ChatsType[] = []

    for (let i = 0; i < chatLog.length; i++) {
      var user = chatLog[i];
      let find;

      if (user.chatType === "gc") {
        find = await Message.findOne({ _id: user.name });
        console.log(find?.users);
      } else {
        find = await User.findOne({ fullname: user.name });
        console.log(find.fullname);

      }


      chatHistory.push({
        name: user.chatType === "gc" ? find.groupName : find.fullname,
        profile: user.chatType === "gc" ? find.groupProfile : find.profile,
        type: user.chatType === "gc" ? "gc" : "oc",
        gid: user.chatType === "gc" ? find._id : find.fullname,
        useenCount: user.unseen
      })

    }





    return (
      res.status(200).json({
        success: true,
        msg: "Successfull",
        chatHistory: chatHistory,
      })
    )

  } catch (e) {
    console.log("Something went wrong");
    return (
      res.status(411).json({
        sucess: false,
        msg: "Something went wrong"
      })
    )
  }


}
