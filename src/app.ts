import express from "express";
import cors from "cors";
import pdfRoutes from './routes/pdf'


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({limit:'10mb'}));


app.use('/api',pdfRoutes);

app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`);
});