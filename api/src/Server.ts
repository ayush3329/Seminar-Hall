import express from 'express'
import dotenv from 'dotenv'
import { dbConnect } from './config/dbConnect';
import router from './routes/apiroutes';
import cors from 'cors'
import cookieParser = require('cookie-parser');



dotenv.config();
const app = express();
const PORT:number = parseInt(process.env.PORT || '8888', 10) 

//adding middlewares
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}))
app.use(cookieParser())

app.get('/', (req, res)=>{
    res.send("Default API route")
})

app.use("/api/v1", router)

dbConnect();

app.listen(PORT, ()=>{
    console.log(`server started sucessfully at PORT  ${PORT}`);
})