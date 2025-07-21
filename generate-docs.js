// Enhanced generate-docs.js with better automation support
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting docs.json generation...');

const basePath = path.join(__dirname, 'assets');
const output = [];

function scanDir(type) {
  const folder = path.join(basePath, type + 's');
  
  if (!fs.existsSync(folder)) {
    console.log(`⚠️  Folder ${folder} does not exist, skipping...`);
    return;
  }

  console.log(`📁 Scanning ${folder}...`);
  const files = fs.readdirSync(folder);
  
  files.forEach(file => {
    // Enhanced file type checking
    const fileExtension = file.toLowerCase();
    let isValidFile = false;

    if (type === 'pdf' && fileExtension.endsWith('.pdf')) {
      isValidFile = true;
    } else if (type === 'image' && fileExtension.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
      isValidFile = true;
    } else if (type === 'audio' && fileExtension.match(/\.(mp3|wav|aac|m4a|ogg|flac)$/)) {
      isValidFile = true;
    } else if (type === 'video' && fileExtension.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
      isValidFile = true;
    }

    if (!isValidFile) {
      console.log(`⏭️  Skipping ${file} (unsupported format)`);
      return;
    }

    let filePath = `assets/${type}s/${file}`;
    let title = file.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');

    let thumbnail = '';
    if (type === 'pdf') {
      thumbnail = 'assets/images/thumb-pdf.jpg';
    } else if (type === 'image') {
      thumbnail = filePath; // Use the image itself as thumbnail
    } else if (type === 'audio') {
      thumbnail = 'assets/images/thumb-audio.jpg';
    } else if (type === 'video') {
      thumbnail = 'assets/images/thumb-video.jpg';
    }

    output.push({ 
      title, 
      category: type, 
      type, 
      file: filePath, 
      thumbnail 
    });

    console.log(`✅ Added: ${title} (${type})`);
  });
}

// Scan all asset types
['pdf', 'image', 'audio', 'video'].forEach(type => {
  scanDir(type);
});

// Sort output by category and then by title
output.sort((a, b) => {
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }
  return a.title.localeCompare(b.title);
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('📂 Created data directory');
}

// Write the JSON file
try {
  fs.writeFileSync(path.join(dataDir, 'docs.json'), JSON.stringify(output, null, 2));
  
  console.log(`✨ docs.json generated successfully!`);
  console.log(`📊 Total files: ${output.length}`);
  
  // Show breakdown by type
  const breakdown = output.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📈 Files by type:', JSON.stringify(breakdown, null, 2));
  
} catch (error) {
  console.error('❌ Error writing docs.json:', error);
  process.exit(1);
}
