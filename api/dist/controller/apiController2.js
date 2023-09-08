"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserDetail_1 = require("../Schema/UserDetail");
const Posts_1 = require("../Schema/Posts");
const Message_1 = require("../Schema/Message");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = __importDefault(require("cloudinary"));
dotenv_1.default.config();
// const jwtSecret = "jai shree ram"
//login
function Login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Login");
        const { username, password } = req.body;
        console.log(username, password);
        if (!username || !password) {
            return res.status(500).json({
                success: false,
                msg: "Please fill all the details before submitting",
            });
        }
        try {
            if (username === "admin" && password === "admin@123") {
                console.log("admin granted");
                return res.status(200).json({
                    msg: "adminPage",
                });
            }
            else {
                console.log("Not admin");
            }
            const SearchUser = yield UserDetail_1.User.findOne({ username: username });
            if (!SearchUser) {
                return res.status(404).json({
                    success: false,
                    msg: "User does not exist",
                });
            }
            const comparePassword = yield bcrypt_1.default.compare(password, SearchUser.password);
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
            const options = {
                expiresIn: "60m",
            };
            const jwtSecret = process.env.jwtSecret || '';
            let jwt_TOKEN = jsonwebtoken_1.default.sign(payload, jwtSecret, options);
            console.log("password matched");
            console.log(SearchUser);
            const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const cookieOptions = {
                expires: expirationDate,
                sameSite: "none",
                secure: true,
                httpOnly: true,
            };
            // const cookieValue = {
            //   token: jwt_TOKEN,
            //   expires: expirationDate.toUTCString(), // Store the expiration date as a string
            // };
            return res.cookie("LoginCookie", jwt_TOKEN, cookieOptions).json({
                success: true,
                msg: "Successfully Logged in",
                fullname: SearchUser.fullname,
                profile: SearchUser.profile,
                followers: SearchUser.followers.length,
                following: SearchUser.following.length,
                jwt: jwt_TOKEN
            });
        }
        catch (e) {
            console.log("Server error, ", e);
            return res.status(500).json({
                success: false,
                msg: "Server Error",
            });
        }
    });
}
//signUP
function Signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const SearchUser = yield UserDetail_1.User.findOne({
            $or: [{ username: username }, { email: email }],
        });
        console.log(SearchUser);
        if (SearchUser) {
            console.log("exist");
            return res.status(500).json({
                success: false,
                msg: SearchUser.email === email
                    ? "Email already register"
                    : "username already taken",
            });
        }
        try {
            const encryptedPassword = yield bcrypt_1.default.hash(password, 10);
            const NewUser = yield UserDetail_1.User.create({
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
        }
        catch (e) {
            console.log("Server Error, ", e);
            return res.status(500).json({
                success: false,
                msg: "Server errro",
            });
        }
    });
}
//search User
function SearchUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("search");
        const { username } = req.params;
        console.log("user-> ", username);
        try {
            const SearchUser = yield UserDetail_1.User.find({
                username: { $regex: `^${username}`, $options: "i" },
            });
            console.log(SearchUser);
            if (SearchUser.length == 0) {
                return res.status(404).json({
                    success: false,
                    msg: "user does not exist",
                });
            }
            return res.status(200).json({
                success: true,
                user: SearchUser,
                msg: "User Found",
            });
            // .clearCookie('LoginCookie')
        }
        catch (e) {
            return res.status(401).json({
                success: false,
                msg: "Server error",
            });
        }
    });
}
function previous_Searched_user(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username } = req.body;
        var searchUser = yield UserDetail_1.User.findOne({ username: username });
        console.log("user-> ", searchUser);
        searchUser = searchUser.searches;
        console.log("Searched-> ", searchUser);
        const data = [];
        for (let i = searchUser.length - 1; i >= 0; i--) {
            console.log("user-> ", searchUser[i]);
            const single = yield UserDetail_1.User.findOne({ _id: searchUser[i] });
            console.log("single-> ", single);
            data.push(single);
        }
        return res.status(200).json({ success: true, user: data });
    });
}
//check whether user is logged in or not
function isLoggedin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("is logged in");
        const loginCookie = yield req.cookies.LoginCookie;
        console.log("loginCookie", loginCookie);
        console.log("res cookies", req.cookies);
        if (loginCookie) {
            res.status(200).json({
                success: true,
                msg: "Valid Cookie",
            });
        }
        else {
            // Cookie does not exist
            res.status(401).json({
                success: false,
                isCookie: false,
            });
        }
    });
}
function fileSupported(profiletype, supportedType) {
    return supportedType.includes(profiletype);
}
function uploadFileToCLoudinary(profilePhoto, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = { folder };
        console.log("temppaths ", profilePhoto.tempFilePath);
        try {
            const response = yield cloudinary_1.default.v2.uploader.upload(profilePhoto.tempFilePath, options);
            console.log("resp-> ", response);
            return response;
        }
        catch (error) {
            console.log("err-> ", error);
            return false;
        }
    });
}
//change profile pic
function profileChange(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // const { username } = req.body;
        // console.log("username-> ", username);
        // const { profilePhoto } = req.files;
        // console.log("profile name-> ", profilePhoto);
        // const suppoertedTypes = ["jpeg", "jpg", "png"];
        // const extension = profilePhoto.name.split(".");
        // const profileType = extension[extension.length - 1];
        // // const tempPath = __dirname + "/files/" + Date.now() + `.${extension[extension.length -1]}`;
        // // const tempPath = __dirname + "/files/" + Date.now() + `.${extension[extension.length -1]}`;
        // // await profilePhoto.mv(tempPath) //Uploaded the profile pic at the server (profile is not uploaded at cloudinary or at mongoDB)
        // if (!fileSupported(profileType, suppoertedTypes)) {
        //   console.log("File format not supported");
        //   return res.status(500).json({
        //     success: false,
        //     msg: "File type not supported",
        //   });
        // }
        // const response = await uploadFileToCLoudinary(profilePhoto, "profilepics");
        // console.log("resp=> ", response);
        // if (!response) {
        //   return res.status(500).json({
        //     success: false,
        //     msg: "unable to uplaod",
        //   });
        // }
        // console.log("username-> ", username, response.secure_url);
        // const updatedUser = await User.findOneAndUpdate(
        //   { username: username }, //first object will contain the field on the basis on which it will search in db
        //   { profile: response.secure_url }, // second object will contain all tht feild which need to be updated
        //   { new: true } // this means, the function will return the updated user
        // );
        // console.log("updateduser", updatedUser);
        // // updatedUser = updatedUser.toJSON();
        // // updatedUser.password = null;
        // res.status(200).json({
        //   success: true,
        //   msg: "Succesfully upload profile",
        //   profilepic: updatedUser.profile,
        // });
    });
}
function getUserInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var doIFollowThisGuy = false;
        console.log("get user info");
        const { username, myUsername } = req.body;
        console.log("Username", req.body);
        try {
            const SearchUser = yield UserDetail_1.User.findOne({ username });
            //addToSet operator will only push new value of "searches" array if the new value is not present in that array
            const myDetail = yield UserDetail_1.User.findOneAndUpdate({ username: myUsername }, { $addToSet: { searches: SearchUser._id } }, { new: true });
            console.log("SearchUser", SearchUser);
            console.log("myDetail ", myDetail);
            console.log(myDetail.following);
            for (let i = 0; i < myDetail.following.length; i++) {
                // console.log(i, " ", SearchUser._id);
                var v1 = SearchUser._id, v2 = myDetail.following[i];
                console.log(v1, " ", v2);
                if (v1.equals(v2)) {
                    console.log("Yes i follow");
                    doIFollowThisGuy = true;
                    break;
                }
            }
            res.json({
                success: true,
                username: SearchUser.username,
                fullname: SearchUser.fullname,
                profile: SearchUser.profile,
                doIfollow: doIFollowThisGuy,
            });
        }
        catch (e) {
            return res.json({
                success: false,
            });
        }
    });
}
function getMyDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Get My Details");
        const { fullname } = req.body;
        try {
            const searchUser = yield UserDetail_1.User.findOne({ fullname: fullname }).populate("posts");
            console.log("searched user-> ", searchUser);
            const myPosts = [];
            for (let i = 0; i < searchUser.posts.length; i++) {
                const id = searchUser.posts[i];
                const single_post = yield Posts_1.Post.findOne({ _id: id });
                const pair = [];
                pair.push(single_post.postURL);
                pair.push(single_post.like);
                myPosts.push(pair);
            }
            // console.log("Total Post URL-> ", myPosts);
            res.json({
                success: true,
                followers: searchUser.followers.length,
                following: searchUser.following.length,
                post: myPosts.length,
                postURL: myPosts,
                bio: searchUser.bio,
                gender: searchUser.gender,
            });
        }
        catch (e) {
            res.json({
                success: false,
            });
        }
    });
}
function followUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Follow User");
        const { myUsername, wantToFollowUser } = req.body;
        var myDetail = yield UserDetail_1.User.findOne({ username: myUsername });
        var wantToFollow = yield UserDetail_1.User.findOne({ username: wantToFollowUser });
        console.log("myDetail ", myDetail);
        console.log("wantToFollow ", wantToFollow);
        const followingList = myDetail.following;
        followingList.push(wantToFollow._id);
        const followerList = wantToFollow.followers;
        followerList.push(myDetail._id);
        myDetail = yield UserDetail_1.User.findOneAndUpdate({ username: myUsername }, { $set: { following: followingList } }, {
            new: true,
        });
        wantToFollow = yield UserDetail_1.User.findOneAndUpdate({ username: wantToFollowUser }, { $set: { followers: followerList } }, {
            new: true,
        });
        myDetail = myDetail.toObject();
        wantToFollow = wantToFollow.toObject();
        console.log("My Detail ", myDetail);
        console.log("Second ", wantToFollow);
        res.json({
            success: true,
        });
    });
}
function unfollowUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Follow User");
        const { myUsername, wantToUnfollowUser } = req.body;
        var myDetail = yield UserDetail_1.User.findOne({ username: myUsername }); //remove from my following list
        var unfollowUser = yield UserDetail_1.User.findOne({ username: wantToUnfollowUser }); // remove from followers list
        var myFollowingList = myDetail.following;
        var unfollowUserFollowerList = unfollowUser.followers;
        var newList = [];
        var fixed = unfollowUser._id;
        for (let i = 0; i < myFollowingList.length; i++) {
            var searched = myFollowingList[i];
            if (fixed.equals(searched)) {
                continue;
            }
            else {
                newList.push(searched);
            }
        }
        myDetail = yield UserDetail_1.User.findOneAndUpdate({ username: myUsername }, { following: newList }, { new: true });
        console.log("my detail", myDetail);
        newList = [];
        fixed = myDetail._id;
        for (let i = 0; i < unfollowUserFollowerList.length; i++) {
            var searched = unfollowUserFollowerList[i];
            if (fixed.equals(searched)) {
                continue;
            }
            else {
                newList.push(searched);
            }
        }
        unfollowUser = yield UserDetail_1.User.findOneAndUpdate({ username: wantToUnfollowUser }, { followers: newList }, { new: true });
        console.log("dest user ", unfollowUser);
        res.json({
            success: true,
        });
    });
}
function post_upload(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log("Post Upload backend");
        // try {
        //   const myUsername = req.body.username;
        //   const { post } = req.files;
        //   console.log("myUsername-> ", myUsername);
        //   const allowedType = ["jpg", "jpeg", "mp3", "mp4", "png"];
        //   const extension = post.name.split(".");
        //   if (!fileSupported(extension[extension.length - 1], allowedType)) {
        //     console.log("File type not supported");
        //     res.status(401).json({
        //       success: false,
        //       message: "File type not supported",
        //     });
        //     return;
        //   }
        //   console.log("post-> ", post);
        //   var response = await uploadFileToCLoudinary(post, "Posts");
        //   if (!response) {
        //     console.log("Unable to upload to Cloudinary");
        //     return res.status(401).json({
        //       success: false,
        //       message: "Unable to uplaod to Cloudinary",
        //     });
        //   }
        //   console.log("Suceessfully Uploaded-> ", response);
        //   var postedBY = await User.findOne({ username: myUsername });
        //   const createPost = await Post.create({
        //     username: postedBY._id,
        //     postURL: response.secure_url,
        //   });
        //   console.log("Post-> ", createPost);
        //   const postArray = postedBY.posts;
        //   postArray.push(createPost._id);
        //   postedBY = await User.findOneAndUpdate(
        //     { username: myUsername },
        //     { $set: { posts: postArray } }
        //   );
        //   console.log("posted by-> ", postedBY);
        //   return res.status(200).json({
        //     success: true,
        //     message: "Successfully uplaoded post",
        //   });
        // } catch (e) {
        //   console.log("err-> ", e);
        //   res.status(500).json({
        //     success: false,
        //     message: "Something went wrong",
        //   });
        // }
    });
}
function admin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Admin");
        try {
            // const up = await User.updateMany({}, { $set: {searches: []}}, {new: true});
            // console.log("up-> ", up);
            const getAll = yield UserDetail_1.User.find();
            return res.status(200).json({
                detail: getAll,
                success: true,
            });
        }
        catch (e) {
            console.log("err-> ", e);
            return res.status(500).json({
                success: false,
                msg: "Something went wrong",
            });
        }
    });
}
function promotion_status(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Promotion Status", req.body);
        const username = req.body.username;
        try {
            var search = yield UserDetail_1.User.findOne({ username: username });
            search = yield UserDetail_1.User.findOneAndUpdate({ username: username }, { promoted: !search.promoted }, { new: true });
            console.log("search-> ", search);
            res.status(200).json({
                success: true,
            });
        }
        catch (e) {
            return res.status(500).json({
                success: false,
            });
        }
    });
}
function Submit_Details(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.body);
        const { username, bio, gender } = req.body;
        console.log(username, bio, gender);
        try {
            if (!username) {
                return res.json(401).json({
                    success: false,
                    msg: "Username empty",
                });
            }
            const search = yield UserDetail_1.User.findOneAndUpdate({ username: username }, { bio: bio, gender: gender }, { new: true });
            console.log("Searchuser-> ", search);
            return res.status(200).json({
                success: true,
            });
        }
        catch (e) {
            console.log("error-> ", e);
            res.status(500).json({
                success: false,
            });
        }
    });
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function getPosts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username } = req.body;
        try {
            const searchUser = yield UserDetail_1.User.findOne({ username: username });
            const myFollowingList = searchUser.following;
            const Posts = yield Posts_1.Post.find({ username: { $in: myFollowingList } });
            // console.log("posts->", Posts, Posts.length);
            const arr = [];
            for (let i = 0; i < Posts.length; i++) {
                const pair = [Posts[i].postURL];
                const findThis = yield UserDetail_1.User.findOne({ _id: Posts[i].username });
                pair.push(findThis.profile);
                pair.push(findThis.username);
                pair.push(Posts[i].like);
                if (Posts[i].liked_BY.includes(searchUser._id)) {
                    pair.push(true);
                }
                else {
                    pair.push(false);
                }
                arr.push(pair);
            }
            const promotedUser = yield UserDetail_1.User.find({ promoted: true });
            // console.log("promoted ", promotedUser);
            for (let i = 0; i < promotedUser.length; i++) {
                const promotedPost = promotedUser[i].posts;
                const promUser = promotedUser[i].username;
                const promProfile = promotedUser[i].profile;
                for (let j = 0; j < promotedPost.length; j++) {
                    const singlePost = yield Posts_1.Post.findOne({ _id: promotedPost[j] });
                    console.log(singlePost);
                    var pair = [];
                    pair.push(singlePost.postURL);
                    pair.push(promProfile);
                    pair.push(promUser);
                    pair.push(singlePost.like);
                    if (singlePost.liked_BY.includes(searchUser._id)) {
                        pair.push(true);
                    }
                    else {
                        pair.push(false);
                    }
                    arr.push(pair);
                }
                console.log("-> ", promUser, promotedPost);
            }
            console.log("outside");
            shuffleArray(arr);
            return res.status(200).json({
                success: true,
                msg: "Successfull",
                data: arr,
            });
        }
        catch (e) {
            console.log("err-> ", e);
            return res.status(500).json({
                success: false,
                msg: "Something went wrong",
            });
        }
    });
}
//Incomplete
function RecentChatsUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // const { fullname } = req.body;
        // console.log(fullname);
        // try {
        //   var searchUser = await User.findOne({ fullname: fullname });
        //   console.log(searchUser);
        //   if (searchUser) {
        //     var ordinaryChats = searchUser.chat;
        //     var groupChats = searchUser.groups;
        //     console.log(ordinaryChats);
        //     var ocChatMsg = [];
        //     var gcChatMsg = [];
        //   //   const obj = { name: allChats[i][0], profile: allChats[i][1], type: allChats[i][2], gid: allChats[i][3]};
        //     for(let i = 0; i<ordinaryChats.length; i++){
        //       var arr = [searchUser.fullname, ordinaryChats[i]]
        //       const helper = await User.findOne({fullname: ordinaryChats[i]})
        //       var obj = [helper.fullname, helper.profile, "oc", helper.fullname]
        //       ocChatMsg.push(obj)
        //     }
        //   //   for(let i=0; i<groupChats.length; i++){
        //   //     const helper = await Message.findById({id: groupChats[i]});
        //   //     // console.log(helper);
        //   //   }
        //   return(
        //       res.status(200).json({
        //           success: true,
        //           ChatHistory: ocChatMsg,
        //           GroupHistory: gcChatMsg
        //       })
        //   )
        //   } else {
        //     new Error("searchUser is empty");
        //   }
        // } catch (e) {
        //   console.log(e);
        //   res.status(500).json({
        //     success: false,
        //     msg: "Something went wrong",
        //   });
        // }
    });
}
function ordinaryChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user } = req.body;
        try {
            const ReceiverDetail = yield UserDetail_1.User.findOne({ fullname: user[0] });
            const MessageHistory = yield Message_1.Message.findOne({ users: { $all: user }, groupChat: false });
            console.log(MessageHistory);
            return (res.status(200).json({
                success: true,
                name: ReceiverDetail.username,
                profile: ReceiverDetail.profile,
                participant: ReceiverDetail.fullname
            }));
        }
        catch (e) {
            console.log(e);
            return (res.status(500)
                .json({
                success: false,
                msg: 'Something went wrong'
            }));
        }
    });
}
module.exports = {
    Login,
    Signup,
    SearchUser,
    profileChange,
    isLoggedin,
    getUserInfo,
    followUser,
    unfollowUser,
    getMyDetails,
    post_upload,
    admin,
    promotion_status,
    Submit_Details,
    getPosts,
    previous_Searched_user,
    RecentChatsUser,
    ordinaryChat
};
