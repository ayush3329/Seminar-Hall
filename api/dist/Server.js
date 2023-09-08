"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnect_1 = require("./config/dbConnect");
const apiroutes_1 = __importDefault(require("./routes/apiroutes"));
const cors_1 = __importDefault(require("cors"));
const cookieParser = require("cookie-parser");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '8888', 10);
//adding middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send("Default API route");
});
app.use("/api/v1", apiroutes_1.default);
(0, dbConnect_1.dbConnect)();
app.listen(PORT, () => {
    console.log(`server started sucessfully at PORT  ${PORT}`);
});
