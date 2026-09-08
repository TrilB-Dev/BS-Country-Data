const fs = require('fs');
const path = require('path');
const sass = require('sass');
const { minify } = require('terser');

const root = __dirname;
const jsonDir = path.join(root, 'json');
const jsSrcDir = path.join(root, 'js');
const scssDir = path.join(root, 'scss');
const distDir = path.join(root, 'dist');
const distJsDir = path.join(distDir, 'js');
const distCssDir = path.join(distDir, 'css');
const distJsonDir = path.join(distDir, 'json');

fs.mkdirSync(distJsDir, { recursive: true });
fs.mkdirSync(distCssDir, { recursive: true });
fs.mkdirSync(distJsonDir, { recursive: true });

for (const file of fs.readdirSync(jsonDir)) {
  if (file.endsWith('.json')) {
    fs.copyFileSync(path.join(jsonDir, file), path.join(distJsonDir, file));
  }
}

const sourceCode = fs.readFileSync(path.join(jsSrcDir, 'index.js'), 'utf8');
const jsOutputPath = path.join(distJsDir, 'bs-country-data.js');
const jsMinOutputPath = path.join(distJsDir, 'bs-country-data.min.js');

fs.writeFileSync(jsOutputPath, sourceCode, 'utf8');

(async () => {
  const minified = await minify(sourceCode, {
    compress: true,
    mangle: true,
    format: {
      comments: false,
    },
  });

  fs.writeFileSync(jsMinOutputPath, minified.code, 'utf8');

  const cssResult = sass.compile(path.join(scssDir, 'bs-country-data.scss'), {
    loadPaths: [path.join(root, 'node_modules')],
    style: 'expanded',
    sourceMap: false,
  });

  fs.writeFileSync(path.join(distCssDir, 'bs-country-data.css'), cssResult.css, 'utf8');
  const minCss = cssResult.css
    .replace(/\/\*[^]*?\*\//g, '')
    .replace(/\n+/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s+([>+~])\s+/g, '$1');

  fs.writeFileSync(path.join(distCssDir, 'bs-country-data.min.css'), minCss, 'utf8');

  console.log('Build complete:');
  console.log(' - ' + jsOutputPath);
  console.log(' - ' + jsMinOutputPath);
  console.log(' - ' + path.join(distCssDir, 'bs-country-data.css'));
  console.log(' - ' + path.join(distCssDir, 'bs-country-data.min.css'));
})();
