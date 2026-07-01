import fs from 'fs';
import path from 'path';

const srcIcon = path.join(process.cwd(), 'src', 'assets', 'images', 'ain_tebournok_pwa_icon_1782296799339.jpg');
const publicDir = path.join(process.cwd(), 'public');
const destIcon = path.join(publicDir, 'icon.jpg');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

try {
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, destIcon);
    console.log(`Successfully copied ${srcIcon} to ${destIcon}`);
  } else {
    console.error(`Source icon not found at: ${srcIcon}`);
  }

  // Copy all assets from src/assets/images to public/images
  const srcImagesDir = path.join(process.cwd(), 'src', 'assets', 'images');
  const destImagesDir = path.join(publicDir, 'images');

  if (!fs.existsSync(destImagesDir)) {
    fs.mkdirSync(destImagesDir, { recursive: true });
  }

  if (fs.existsSync(srcImagesDir)) {
    const files = fs.readdirSync(srcImagesDir);
    for (const file of files) {
      const srcFile = path.join(srcImagesDir, file);
      const destFile = path.join(destImagesDir, file);
      fs.copyFileSync(srcFile, destFile);
    }
    console.log(`Successfully copied ${files.length} images to ${destImagesDir}`);
  }
} catch (err) {
  console.error('Error copying assets:', err);
}

