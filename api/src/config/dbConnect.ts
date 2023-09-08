import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config();

const URL:string = process.env.DBURL || '';

export async function dbConnect() {
    mongoose.connect(URL,{
        serverSelectionTimeoutMS: 5000
    }).then(()=>{
        console.log("Sucessfully connected with db");
    }).catch((e:Error)=>{
        console.log("Unable to connect with db");
        console.log(e);
    })
}