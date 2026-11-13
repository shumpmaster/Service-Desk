// Lets `node --test tests/acceptance/` run every *.test.mjs file under tests/acceptance/: Node 22
// resolves a directory argument as a module, and package.json's "main" points here. Stdlib only.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function find(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return find(p);
    return /\.test\.(mjs|cjs|js)$/.test(d.name) ? [p] : [];
  });
}

(async () => {
  for (const f of find(__dirname).sort()) await import(pathToFileURL(f).href);
})();
