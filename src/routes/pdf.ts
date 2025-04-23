import express,{ Request,Response } from "express";
import puppeteer from "puppeteer";

interface PDFRequest {
    url:string,
    fileName?:string
}

const router = express.Router();
router.get('/generate-pdf',(req,res)=>{
    res.status(200).json({message:"Alive"})

})
router.post('/generate-pdf',async (req:Request<{},{},PDFRequest>,res:Response)=>{
    const {url,fileName = 'document'} = req.body;
   const browser = await puppeteer.launch();
   const page = await browser.newPage();
   await page.evaluate((title:string)=>{
    document.title = title;
   },fileName)
   await page.emulateMediaType('screen');

   
   if(!url) return;
    await page.goto(url,{
    waitUntil:'networkidle2',
   });

   await page.addStyleTag({
    content: `
    hr.hr--small:nth-child(n+1),.back-to-collection,.social-sharing ,#my_centered_buttons_main,.product-single__quantity,.breadcrumb,footer,header ,a.glink,#rfq-btn-730{
        display: none !important;
      }
    `
  });
   await page.pdf({
    path:`${"../" + fileName+'.pdf'}`,
    printBackground:true,
     format:"LEDGER",
     landscape:true,
     width:"100%",
     height:"auto",
     margin:{
        top:"25px",
        bottom:'100px'
     },
     pageRanges:"1-1"
   })
   res.status(201).json({message:"created a PDF"})
});

export default router;