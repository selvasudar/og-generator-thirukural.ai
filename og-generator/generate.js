const fs = require('fs');
const path = require('path');

const kuralsPath = path.join(__dirname, 'kurals.json');
const kurals = JSON.parse(fs.readFileSync(kuralsPath, 'utf-8'));
const puppeteer = require('puppeteer');

const templatePath = path.join(__dirname, 'template.html');
const logoPath = path.resolve(__dirname, 'logo.png'); // Absolute path to logo.png
const valluvarPath = path.resolve(__dirname, 'valluvar.svg'); // Absolute path to valluvar.svg
// const valluvarUrl = `file://${valluvarPath}`; // Convert to file:// URL
// Read logo as base64
const logoBuffer = fs.readFileSync(logoPath);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`; // Convert to base64 ✅
const valluvarBuffer = fs.readFileSync(valluvarPath);
const valluvarBase64 = `data:image/svg+xml;base64,${valluvarBuffer.toString('base64')}`; // Base64 for valluvar.svg
const outputDir = path.join(__dirname, '../og-images');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

(async () => {
  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({ headless: false }); // Run with visible browser

  for (let i = 0; i < kurals.length; i++) {
    const kural = kurals[i];
    const id = i + 1;

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });

    // Prepare HTML with dynamic values
    const rawHtml = fs.readFileSync(templatePath, 'utf-8')
      .replace('__LOGO_PATH__', logoBase64) // Use base64-encoded image ✅
      .replace('__VALLUVAR_PATH__', valluvarBase64)
      .replace('__KURAL__', kural.Kural)
      .replace('__ADHIGARAM__', kural.Adhigaram || 'தெரியவில்லை')
      .replace('__ID__', id);

    await page.setContent(rawHtml, { waitUntil: 'networkidle0' });

    const outputFilePath = path.join(outputDir, `kural-${id}.png`);
    await page.screenshot({ path: outputFilePath });

    console.log(`✅ Generated OG image for Kural ${id}`);
    await page.close();
  }

  await browser.close();
})();