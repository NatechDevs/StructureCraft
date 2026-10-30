import test from 'node:test';
import assert from 'node:assert/strict';
import { fromPaths, parseTree, visibleTree, renderTree, treeToJSON, createZip } from '../assets/tree.mjs';
test('file paths support prototype-like names and sort folders first', () => {
  const root = fromPaths(['app/README', 'app/__proto__/file.js', 'app/src/index.js', 'app/.git/config']);
  const result = renderTree(visibleTree(root, { hidden: true, ignore: '.git' }));
  assert.equal(result.files, 3); assert.equal(result.folders, 3);
  assert.equal(result.rows[1].name, '__proto__/'); assert.ok(!result.text.includes('.git'));
});
test('render and parse preserve dotted folders, extensionless files, and Unicode', () => {
  const source = '项目/\n├── config.d/\n│   └── LICENSE\n├── empty/\n└── файл.txt';
  const first = renderTree(parseTree(source));
  assert.equal(first.text, source); assert.equal(first.files, 2); assert.equal(first.folders, 3);
  assert.equal(renderTree(parseTree(renderTree(parseTree(source), 'ascii').text)).text, source);
});
test('filters apply to whole subtrees and depth', () => {
  const root = fromPaths(['app/src/a.js', 'app/node_modules/pkg/a.js', 'app/.env', 'app/debug.log']);
  const result = renderTree(visibleTree(root, { ignore: 'node_modules, *.log', hidden: false, depth: 1 }));
  assert.equal(result.text, 'app/\n└── src/');
  assert.equal(renderTree(visibleTree(root, { hidden: true, foldersOnly: true })).files, 0);
});
test('parser rejects traversal, duplicates, bad indentation and multiple roots', () => {
  for (const source of ['app/\n└── ../', 'app/\n└── a/b', 'app/\n  bad', 'a/\nb/', 'app/\n├── a\n└── a', 'app/\n        skip']) assert.throws(() => parseTree(source));
});
test('parses fenced Markdown trees', () => {
  assert.equal(renderTree(parseTree('```text\napp/\n└── README\n```')).files, 1);
});
test('ZIP contains UTF-8 empty files and directory entries', async () => {
  const paths = renderTree(parseTree('项目/\n├── empty/\n└── LICENSE')).paths;
  const bytes = new Uint8Array(await createZip(paths).arrayBuffer()), view = new DataView(bytes.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint16(6, true), 0x800);
  const end = bytes.length - 22; assert.equal(view.getUint32(end, true), 0x06054b50); assert.equal(view.getUint16(end + 10, true), 3);
  assert.equal(view.getUint32(end + 12, true) + view.getUint32(end + 16, true), end);
  assert.ok(new TextDecoder().decode(bytes).includes('LICENSE'));
});
test('path search retains ancestors, prunes unrelated siblings, and follows exclusions', () => {
  const root = fromPaths(['app/src/components/Button.tsx', 'app/src/styles/base.css', 'app/README.md', 'app/node_modules/button/index.js']);
  const result = renderTree(visibleTree(root, { hidden: true, ignore: 'node_modules', query: 'BUTTON' }));
  assert.equal(result.text, 'app/\n└── src/\n    └── components/\n        └── Button.tsx');
  const folderMatch = renderTree(visibleTree(root, { hidden: true, query: 'src/' }));
  assert.equal(folderMatch.files, 2);
  assert.equal(renderTree(visibleTree(root, { query: 'missing' })).rows.length, 1);
});
test('query uses renamed root paths and respects maximum depth', () => {
  const root = fromPaths(['app/src/nested/code.js', 'app/README.md']);
  assert.equal(renderTree(visibleTree(root, { name: 'renamed', query: 'renamed/src' })).files, 1);
  assert.equal(renderTree(visibleTree(root, { query: 'code', depth: 1 })).rows.length, 1);
});
test('JSON preserves empty directories and explicit file types after filtering', () => {
  const tree = parseTree('app/\n├── empty/\n├── config.d/\n│   └── LICENSE\n└── private.log');
  const data = treeToJSON(visibleTree(tree, { ignore: '*.log', hidden: true }));
  assert.deepEqual(data.children.find(node => node.name === 'empty'), { name: 'empty', type: 'directory', children: [] });
  assert.deepEqual(data.children.find(node => node.name === 'config.d').children[0], { name: 'LICENSE', type: 'file' });
  assert.equal(data.children.length, 2);
  assert.equal(treeToJSON(null), null);
});
test('filtering never mutates the complete source tree', () => {
  const tree = fromPaths(['app/src/a.js', 'app/node_modules/pkg/index.js']);
  const original = renderTree(tree).text;
  visibleTree(tree, { name: 'other', foldersOnly: true, ignore: 'node_modules', query: 'src' });
  assert.equal(renderTree(tree).text, original);
});
test('deep file imports fail before rendering exceeds the supported depth', () => {
  assert.throws(() => fromPaths(['app/' + 'nested/'.repeat(101) + 'file.js']), /100 nested/);
});
