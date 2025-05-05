import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()


let URI = process.env.MONGO_DB_URL;
const password = process.env.MONGO_DB_PASSWORD as string;
if (URI?.includes('password')) {
    console.log("Password",password);
    URI = URI.replace("<db_password>",password)
    mongoose.connect(URI)
    .then(()=>{
        console.log('connnected  a db..');
        
    })
    .catch((error)=>{
        throw new Error(error);
        
    })
    
}else{
    console.log("isanusi");
    
}