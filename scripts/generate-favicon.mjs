import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceLogo = path.join(__dirname, '../public/legacy-logo.png');
const faviconPath = path.join(__dirname, '../public/favicon.png');

async function generateFavicon() {
  try {
    // Check if source logo exists
    if (!fs.existsSync(sourceLogo)) {
      console.error(`Source logo not found at: ${sourceLogo}`);
      process.exit(1);
    }

    console.log('Generating favicon.png from legacy-logo.png...\n');

    // Generate favicon.png (modern browsers support PNG favicons)
    // We'll use PNG since sharp doesn't support ICO format
    await sharp(sourceLogo)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);
    
    console.log(`✓ Generated favicon.png`);
    console.log(`Favicon saved to: ${faviconPath}`);
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();

