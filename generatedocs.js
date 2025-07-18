
// This script scans the assets/ folder and generates a docs.json file.
const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'assets');
const output = [];

function scanDir(type, thumbName) {
  const folder = path.join(basePath, type + 's');
  if (!fs.existsSync(folder)) return;

  fs.readdirSync(folder).forEach(file => {
    if (!file.toLowerCase().endsWith('.pdf') &&
        !file.toLowerCase().match(/\.(jpg|jpeg|png|mp4|mp3)$/)) return;

    let filePath = `assets/${type}s/${file}`;
    let title = file.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');

    let thumbnail = '';
    if (type === 'pdf') {
      thumbnail = 'assets/images/thumb-pdf.jpg';
    } else if (type === 'image') {
      thumbnail = filePath;
    } else if (type === 'audio') {
      thumbnail = 'assets/images/thumb-audio.jpg';
    } else if (type === 'video') {
      thumbnail = 'assets/images/thumb-video.jpg';
    }

    output.push({ title, category: type, type, file: filePath, thumbnail });
  });
}

['pdf', 'image', 'audio', 'video'].forEach(type => scanDir(type, ''));

fs.writeFileSync(path.join(__dirname, 'data', 'docs.json'), JSON.stringify(output, null, 2));
console.log("docs.json generated.");
