import mongoose, { Schema } from "mongoose";


const countDownload = new mongoose.Schema({
name:{type:Schema.Types.String,default:'global'},
count:{type:Schema.Types.Number,default:0}   
});


const Count = mongoose.model('Count',countDownload);

export default Count;