import express from "express";
import {Login, RecentChatsUser, SearchUser, Signup, createGroup, createOrdinarChat, getGroupInfo, jwtt, ordinaryChat, UpdateSequence} from '../controller/apiController'

const router = express.Router();

router.post("/login", Login)
router.post("/signup", Signup)
router.post("/jwt", jwtt)
router.post("/search/:username", SearchUser)
router.post("/createGroup", createGroup)
router.post("/ordinaryChat", ordinaryChat)
router.post("/RecentChatsUser", RecentChatsUser)
router.post("/getGroupInfo", getGroupInfo)
router.post("/createOrdinarChat", createOrdinarChat)
router.put("/updateSequence", UpdateSequence);



export default router;