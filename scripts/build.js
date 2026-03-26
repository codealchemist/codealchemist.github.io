import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

async function build() {
  const appVersion = process.env.npm_package_version || '0.0.0'

  await rm('build', { recursive: true, force: true })
  await mkdir('build', { recursive: true })

  const filesToCopy = [
    'src/index.html',
    'src/styles.css',
    'src/app.js',
    'src/favicon.svg',
    'src/bert.jpg',
    'CNAME'
  ]

  for (const file of filesToCopy) {
    await cp(file, `build/${file.split('/').pop()}`)
  }

  const buildIndexPath = 'build/index.html'
  const html = await readFile(buildIndexPath, 'utf8')
  const renderedHtml = html.replace(/__APP_VERSION__/g, appVersion)
  await writeFile(buildIndexPath, renderedHtml)
}

build().catch(error => {
  console.error(error)
  process.exit(1)
})
