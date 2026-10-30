import { fromPaths, visibleTree, renderTree, treeToJSON } from './tree.mjs';

// Keep existing workspace bookmarks useful after introducing the home page.
if (location.hash === '#workspace') location.replace('workspace.html#workspace');

const source = fromPaths([
  'field-notes/public/favicon.svg',
  'field-notes/src/components/Navigation.tsx',
  'field-notes/src/styles/global.css',
  'field-notes/src/index.tsx',
  'field-notes/package.json',
  'field-notes/README.md',
  'field-notes/node_modules/example-package/index.js',
]);
let format = 'plain';
const panel = document.getElementById('demoOutput');
const filter = document.getElementById('demoFilter');
const tabs = [...document.querySelectorAll('.demo-format-tabs [role=tab]')];

function render() {
  const tree = visibleTree(source, { hidden: true, ignore: filter.checked ? 'node_modules' : '' });
  const output = renderTree(tree);
  if (format === 'json') panel.textContent = JSON.stringify(treeToJSON(tree), null, 2);
  else if (format === 'markdown') panel.textContent = '```text\n' + output.text + '\n```';
  else {
    const fragment = document.createDocumentFragment();
    output.rows.forEach((row, index) => {
      const branch = document.createElement('span');
      branch.className = 'tree-branch';
      branch.textContent = row.prefix;
      const name = document.createElement('span');
      name.className = index === 0 ? 'tree-root' : row.folder ? 'tree-folder' : '';
      name.textContent = row.name;
      fragment.append(branch, name);
      if (index < output.rows.length - 1) fragment.append('\n');
    });
    panel.replaceChildren(fragment);
  }
  document.getElementById('demoCount').textContent = `${output.folders} folders · ${output.files} files`;
}

function activate(tab) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  format = tab.dataset.format;
  panel.setAttribute('aria-labelledby', tab.id);
  render();
}
tabs.forEach(tab => {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    activate(tabs[next]);
  });
});
filter.addEventListener('change', render);
render();
