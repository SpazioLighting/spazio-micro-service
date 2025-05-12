import express,{ Request,Response } from "express";
import CountModelSchema from "../models/count.model";

const router = express.Router();
console.log("outside !!!");

router.get('/count-files',(req,res)=>{
   res.send("aweya")
    
})
router.post('/count-files',async(req:Request,res:Response)=>{
    try {
       const stat = CountModelSchema.findOneAndUpdate(
           {name:'global'},
           {$inc:{count:1}},
           {upsert:true,new:true}
       );

       res.status(200).json({
           message:'Global download count incremented',
           count:(await stat).count
       })
    } catch (error) {
       res.status(500).json({message:'Server error'});
       throw new Error(`Error updating global download count ${error as string}`);
       
       
    }
});



export  = router;