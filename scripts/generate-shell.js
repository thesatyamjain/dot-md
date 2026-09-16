const fs = require('fs');
const path = require('path');
const { renderTemplate } = require('../lib/template');

const shellHtml = renderTemplate({
  markdown: '',
  filename: 'dot md',
  isLive: false,
});

const outputPath = path.resolve(__dirname, '..', 'template.html');
fs.writeFileSync(outputPath, shellHtml, 'utf8');
console.log('✔ template.html generated successfully (' + shellHtml.length + ' bytes).');
