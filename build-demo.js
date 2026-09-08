const fs = require('fs');
const path = require('path');

const root = __dirname;
const demoVendorDir = path.join(root, 'docs', 'demo', 'assets');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectory(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath));
  fs.rmSync(targetPath, { recursive: true, force: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true, force: true });
}

function copyAsset(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath));
  fs.rmSync(targetPath, { recursive: true, force: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true, force: true });
}

ensureDir(demoVendorDir);

copyAsset(path.join(root, 'node_modules', 'bootstrap', 'dist'), path.join(demoVendorDir, 'bootstrap'));
copyAsset(path.join(root, 'node_modules', '@crestapps', 'bootstrap-select', 'dist'), path.join(demoVendorDir, 'bootstrap-select'));
copyAsset(path.join(root, 'dist'), path.join(demoVendorDir, 'bs-country-data'));

const bsCountryDataDir = path.join(demoVendorDir, 'bs-country-data');
copyAsset(path.join(root, 'node_modules', 'flag-icons', 'flags'), path.join(bsCountryDataDir, 'images', 'flags'));

console.log('Demo assets refreshed at ' + demoVendorDir);
