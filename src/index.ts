import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import readline from 'readline/promises'

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

/**
 * Get the app name
 */
let appName = process.argv[2]
if (!appName) {
  appName = await reader.question('package name: ')
}

/**
 * Get the app path
 */
const appPath = path.isAbsolute(appName)
  ? appName
  : path.join(process.cwd(), appName)

if (fs.existsSync(appPath) && fs.readdirSync(appPath).length > 0) {
  console.error('Error: the folder is not empty.')
  process.exit(1)
}

appName = path.basename(appPath)
console.log(`creating the app "${appName}" (${appPath})`)
process.chdir(path.dirname(appPath))

/**
 * Create the Next.js app
 */
console.log('creating next.js app...')
execSync(
  `bunx create-next-app@latest --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" ${appPath}`,
  {
    stdio: 'inherit',
  },
)

// Go in
process.chdir(appPath)

/**
 * Prepare cypress
 */
console.log('installing cypress...')
execSync('bun add -d cypress')

console.log('config cypress scripts')
const packageJsonPath = path.join(appPath, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
packageJson.scripts = {
  ...packageJson.scripts,
  'cy:open': 'cypress open',
}
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

/**
 * Prepare storybook
 */
console.log('installing storybook')
execSync('bunx storybook@latest init --no-dev')

process.exit()
