// Improved generate-docs.js: Recursively scan, exclude thumbnails, and update docs.json correctly

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting docs.json generation...');

const basePath = path.join(__dirname, 'assets');
const output = [];
const thumbnailFolderName = 'thumbnails';

const fileTypesExt = {
  pdf: ['.pdf'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
  audio: ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac'],
  video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
};

// Main recursive scanner, skipping the thumbnails directory everywhere
function scanDir(type) {
  const folder = path.join(basePath, type + 's');

  if (!fs.existsSync(folder)) {
    console.log(`⚠️  Folder ${folder} does not exist, skipping...`);
    return;
  }

  function walk(currentPath) {
    const filesOrDirs = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of filesOrDirs) {
      if (entry.isDirectory()) {
        if (entry.name.toLowerCase() === thumbnailFolderName) continue; // skip all thumbnails dirs
        walk(path.join(currentPath, entry.name));
      } else if (entry.isFile()) {
        const fileLower = entry.name.toLowerCase();
        // Exclude thumbnail files by name (e.g., thumb-pdf.jpg)
        if (fileLower.startsWith('thumb-')) continue;

        // Only accept correct extension
        if (!fileTypesExt[type].some(ext => fileLower.endsWith(ext))) continue;

        const resourcePath = path.relative(__dirname, path.join(currentPath, entry.name)).replace(/\\/g, '/');
        const title = entry.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');

        // Thumbnail strategy: always point to assets/thumbnails/
        let thumbnail = '';
        if (type === 'pdf') {
          thumbnail = `assets/${thumbnailFolderName}/thumb-pdf.jpg`;
        } else if (type === 'audio') {
          thumbnail = `assets/${thumbnailFolderName}/thumb-audio.jpg`;
        } else if (type === 'video') {
          thumbnail = `assets/${thumbnailFolderName}/thumb-video.jpg`;
        } else if (type === 'image') {
          thumbnail = resourcePath;
        }

        output.push({
          title,
          category: type,
          type,
          file: resourcePath,
          thumbnail
        });
        console.log(`✅ Indexed: ${title} (${type})`);
      }
    }
  }

  walk(folder);
}

// Run scan for each type
['pdf', 'image', 'audio', 'video'].forEach(type => scanDir(type));

// Sort results: first by category, then by title
output.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.title.localeCompare(b.title);
});

// Save to data/docs.json
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('📂 Created data directory');
}

try {
  fs.writeFileSync(
    path.join(dataDir, 'docs.json'),
    JSON.stringify(output, null, 2)
  );
  console.log(`✨ docs.json generated successfully!`);
  console.log(`📊 Total resources: ${output.length}`);
  const countByType = output.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  console.log('📈 Resources by type:', JSON.stringify(countByType, null, 2));
} catch (error) {
  console.error('❌ Error writing docs.json:', error);
  process.exit(1);
}
