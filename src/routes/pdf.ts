import express,{ Request,Response } from "express";
import puppeteer from "puppeteer";
import os from 'os'
import path  from "path";
import { statSync } from "fs";
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
    const filePath = path.join(os.tmpdir(),`${fileName}.pdf`);
   
   const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
    executablePath:puppeteer.executablePath(),
    headless:true,
    args:[
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-zygote',
      '--disable-dev-shm-usage'
    ]
   });
   const page = await browser.newPage();
   await Promise.all([
     page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36)"),
     page.evaluate((title:string)=>{
     document.title = title;
    },fileName),
     page.emulateMediaType('screen'),
     page.addStyleTag({
      content: `
      hr.hr--small:nth-child(n+1),.back-to-collection,.social-sharing ,#my_centered_buttons_main,.product-single__quantity,.breadcrumb,footer,header ,a.glink,#rfq-btn-730{
          display: none !important;
        }
      `
    }),
   page.setRequestInterception(true),
    page.on('request',(req)=>{
     const url = req.url();
     const resourceType = req.resourceType();
     if (
       url.includes('google-analytics')||
       url.includes('facebook')||
       url.includes('hotjar')||
       url.includes('doubleclick')||
       url.includes('googletagmanager')||
       url.includes('cdn.shopify.com/s/javascript')||
       resourceType === 'media'||
       resourceType === 'prefetch'
     ) {
       req.abort();
     } else {
       req.continue();
     }
    })
 
    
   ])


   
   if(!url) return;
    await page.goto(url,{
    waitUntil:'domcontentloaded',
    timeout:60000
   });

  await page.pdf({
    path:filePath,
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
   const stats = statSync(filePath);
   if (stats.size === 0) {
    console.error('Generated PDF is empty')
   }
   res.download(filePath,fileName,err =>{
    if(err){
      console.error('Error Sending PDF:',err);
      res.status(500).json({message:'Internal server error during PDF generation'});
    }
   });
 browser.close();
});

export default router;