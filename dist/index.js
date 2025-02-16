"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("readline/promises"));
const reader = promises_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
async function main() {
    /**
     * Get the app name
     */
    let appName = process.argv[2];
    if (!appName) {
        appName = await reader.question('package name: ');
    }
    /**
     * Get the app path
     */
    const appPath = path_1.default.isAbsolute(appName)
        ? appName
        : path_1.default.join(process.cwd(), appName);
    if (fs_1.default.existsSync(appPath) && fs_1.default.readdirSync(appPath).length > 0) {
        console.error('Error: the folder is not empty.');
        process.exit(1);
    }
    appName = path_1.default.basename(appPath);
    console.log(`creating the app "${appName}" (${appPath})`);
    process.chdir(path_1.default.dirname(appPath));
    /**
     * Create the Next.js app
     */
    console.log('creating next.js app...');
    (0, child_process_1.execSync)(`bunx create-next-app@latest --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" ${appPath}`, {
        stdio: 'inherit',
    });
    // Go in
    process.chdir(appPath);
    /**
     * Prepare cypress
     */
    console.log('installing cypress...');
    (0, child_process_1.execSync)('bun add -d cypress');
    console.log('config cypress scripts');
    const packageJsonPath = path_1.default.join(appPath, 'package.json');
    const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts = {
        ...packageJson.scripts,
        'cy:open': 'cypress open',
    };
    fs_1.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    /**
     * Prepare storybook
     */
    console.log('installing storybook');
    (0, child_process_1.execSync)('bunx storybook@latest init --no-dev');
}
main().finally(() => {
    process.exit();
});
