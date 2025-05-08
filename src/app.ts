import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import pdfRoutes from './routes/pdf'
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin:'https://www.spazio.co.za',
    credentials:true
}));
app.use(express.json({limit:'10mb'}));

app.get('/',(req,res)=>{
    res.json({
        message:"aowa!!"
    })
    
})
app.use('/api',pdfRoutes);

app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`);
});