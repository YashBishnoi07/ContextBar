/**
 * scripts/copy-public.js
 * Run after `vite build` to copy extension static assets into dist/
 * so that dist/ is the complete, loadable unpacked extension.
 *
 * Files copied:
 *   public/manifest.json      → dist/manifest.json
 *   public/background.js      → dist/background.js
 *   public/content.js         → dist/content.js
 *   public/data/outlets.json  → dist/data/outlets.json
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const pub  = resolve(root, 'public')
const dist = resolve(root, 'dist')

function copy(src, dest) {
  const destDir = dirname(dest)
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
  copyFileSync(src, dest)
  console.log(`  ✓  ${src.replace(root, '')}  →  ${dest.replace(root, '')}`)
}

console.log('\n[ContextBar] Copying extension assets to dist/\n')

copy(resolve(pub, 'manifest.json'),    resolve(dist, 'manifest.json'))
copy(resolve(pub, 'background.js'),    resolve(dist, 'background.js'))
copy(resolve(pub, 'content.js'),       resolve(dist, 'content.js'))
copy(resolve(pub, 'data/outlets.json'),resolve(dist, 'data/outlets.json'))

// Copy icons if they exist
const iconSizes = [16, 48, 128]
for (const size of iconSizes) {
  const iconSrc = resolve(pub, `icons/icon${size}.png`)
  if (existsSync(iconSrc)) {
    copy(iconSrc, resolve(dist, `icons/icon${size}.png`))
  }
}

console.log('\n[ContextBar] ✅ dist/ is ready to load as an unpacked extension.\n')
