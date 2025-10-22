import express, { Request, Response, RequestHandler } from 'express';
import { chromium, Browser, Page } from 'playwright';

interface PDFRequest {
  url: string;
  fileName?: string;
}
type PDFResponse = Buffer | { message: string };
const router = express.Router();

// Health check
router.get('/generate-pdf', (req, res) => {
  res.status(200).json({ message: 'Alive' });
});

let browser: Browser | null = null;
let page: Page | null = null;

// Launch browser once and reuse
async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    console.log('Launching new browser instance...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

// Launch a persistent page for reuse
async function getPage(): Promise<Page> {
  if (!page) {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
    });

    page = await context.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Block only tracking scripts
    await page.route('**/*', (route) => {
      const request = route.request();
      const url = request.url();
      if (
        url.includes('google-analytics') ||
        url.includes('facebook') ||
        url.includes('hotjar') ||
        url.includes('doubleclick') ||
        url.includes('googletagmanager')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }
  return page;
}

const generatePDF: RequestHandler<{}, PDFResponse, PDFRequest> = async (
  req,
  res
) => {
  const { url, fileName = 'document' } = req.body;
  if (!url) {
    res.status(400).json({ message: 'URL is required' });
    return;
  }

  try {
    const page = await getPage();

    // Navigate to the page
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait only for the main product container
    await page.waitForSelector('.product-single'); // adjust selector

    // Apply custom CSS
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        hr.hr--small:nth-child(n+1),
        .back-to-collection,
        .social-sharing,
        #my_centered_buttons_main,
        .product-single__quantity,
        .breadcrumb,
        footer,
        header,
        a.glink,
        #rfq-btn-730 {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Emulate screen media
    await page.emulateMedia({ media: 'screen' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      printBackground: true,
      format: 'Ledger',
      landscape: true,
      margin: { top: '25px', bottom: '100px' },
      pageRanges: '1-1',
    });

    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res
      .status(500)
      .json({ message: 'Internal server error during PDF generation' });
  }
};

// Route
router.post('/generate-pdf', generatePDF);

// Close browser gracefully
process.on('exit', async () => {
  if (browser) await browser.close();
});

export default router;
