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

const distDir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
fs.writeFileSync(path.join(distDir, 'index.html'), shellHtml, 'utf8');

const rootDir = path.resolve(__dirname, '..');
for (const icon of ['favicon.ico', 'favicon.svg']) {
  const src = path.join(rootDir, icon);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, icon));
  }
}

console.log('✔ template.html & dist/index.html generated successfully (' + shellHtml.length + ' bytes).');
