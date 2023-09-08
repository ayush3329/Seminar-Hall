"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiController_1 = require("../controller/apiController");
const router = express_1.default.Router();
router.post("/login", apiController_1.Login);
router.post("/signup", apiController_1.Signup);
router.post("/jwt", apiController_1.jwtt);
router.post("/search/:username", apiController_1.SearchUser);
router.post("/createGroup", apiController_1.createGroup);
router.post("/ordinaryChat", apiController_1.ordinaryChat);
router.post("/RecentChatsUser", apiController_1.RecentChatsUser);
router.post("/getGroupInfo", apiController_1.getGroupInfo);
router.post("/createOrdinarChat", apiController_1.createOrdinarChat);
router.put("/updateSequence", apiController_1.UpdateSequence);
exports.default = router;
