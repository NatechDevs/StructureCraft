import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
// Never remove a directory outside this project's exact production target.
if (dirname(output) !== root || output !== resolve(root, 'dist')) throw new Error('Invalid output directory.');
const files = ['index.html', 'workspace.html', 'docs.html', '404.html', 'robots.txt', 'LICENSE', 'THIRD_PARTY_NOTICES.md'];
for (const file of [...files, 'assets/app.mjs', 'assets/theme.js', 'assets/navigation.js', 'assets/tree.mjs', 'assets/styles.css', 'assets/fonts/Poppins-Regular.ttf', 'assets/fonts/Poppins-Medium.ttf', 'assets/fonts/Poppins-SemiBold.ttf', 'assets/fonts/OFL.txt']) await stat(join(root, file));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) await cp(join(root, file), join(output, file));
await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });
console.log('Built dist/: application, documentation, icons, and local fonts.');
