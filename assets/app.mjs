import { fromPaths, parseTree, visibleTree, renderTree, treeToJSON, createZip } from './tree.mjs';

const $ = id => document.getElementById(id);
const DEFAULT_IGNORE = 'node_modules, .git, dist, build, .next, coverage';
const SAMPLE = `structurecraft/
├── assets/
│   ├── fonts/
│   │   └── Poppins-Regular.ttf
│   ├── app.mjs
│   ├── styles.css
│   └── tree.mjs
├── docs/
│   └── deployment.md
├── tests/
│   └── tree.test.mjs
├── index.html
├── docs.html
├── README.md
└── vercel.json`;

let root = parseTree(SAMPLE);
let example = true;
let format = 'plain';
let output = renderTree(null);
let exportText = '';
let toastTimer;
let searchTimer;

function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500);
}

function setError(id, message) {
  $(id).textContent = message;
  $(id).hidden = !message;
}

function enableExports(enabled) {
  for (const id of ['copyBtn', 'downloadBtn', 'zipBtn', 'editBtn']) $(id).disabled = !enabled;
}

function markdown(text) {
  let length = 3;
  for (const match of text.matchAll(/`+/g)) length = Math.max(length, match[0].length + 1);
  const fence = '`'.repeat(length);
  return `${fence}text\n${text}\n${fence}`;
}

function renderPreview() {
  const pre = $('treeOutput');
  pre.replaceChildren();
  if (!root) {
    pre.textContent = 'No project loaded.\nSelect a local folder or paste a directory tree.';
    return;
  }
  if (format !== 'plain') {
    pre.textContent = exportText;
    return;
  }
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
  pre.append(fragment);
}

function refresh() {
  try {
    const tree = visibleTree(root, {
      name: $('rootName').value,
      hidden: $('showHidden').checked,
      foldersOnly: $('foldersOnly').checked,
      depth: Number($('maxDepth').value),
      ignore: $('ignorePatterns').value,
      query: $('searchPaths').value,
    });
    output = renderTree(tree, $('treeStyle').value);
    exportText = output.text;
    if (exportText && format === 'markdown') exportText = markdown(output.text);
    if (exportText && format === 'json') exportText = JSON.stringify(treeToJSON(tree), null, 2);
    renderPreview();

    const count = $('treeOutput').textContent.split('\n').length;
    $('lineNumbers').textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
    $('lineCount').textContent = `${root ? count.toLocaleString() : 0} lines`;
    $('folderCount').textContent = output.folders.toLocaleString();
    $('fileCount').textContent = output.files.toLocaleString();
    $('previewFilename').textContent = tree ? `${tree.name} /` : 'untitled /';
    const filtered = !!$('searchPaths').value.trim();
    $('previewStatus').textContent = !root ? 'Waiting for a project' : filtered && output.rows.length === 1 ? 'No matching entries — root only' : filtered ? 'Path filter applied' : example ? 'Example project' : 'Ready to export';
    $('exampleTag').hidden = !example || !root;
    $('searchHint').textContent = filtered ? 'FILTERED' : 'PATH FILTER';
    enableExports(!!output.text);
    setError('settingsError', '');
    $('rootName').removeAttribute('aria-invalid');
  } catch (error) {
    exportText = '';
    enableExports(false);
    setError('settingsError', error.message);
    $('rootName').setAttribute('aria-invalid', 'true');
    $('previewStatus').textContent = 'Resolve the input error to export';
  }
}

function activateTab(button) {
  const group = button.closest('[role=tablist]');
  for (const tab of group.querySelectorAll('[role=tab]')) {
    const selected = tab === button;
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
    if (group.classList.contains('input-tabs')) $(tab.getAttribute('aria-controls')).hidden = !selected;
  }
  if (button.dataset.format) {
    format = button.dataset.format;
    $('preview').setAttribute('aria-labelledby', button.id);
    refresh();
  }
}

function setFocusMode(enabled) {
  $('workspace').classList.toggle('focus-mode', enabled);
  $('focusBtn').setAttribute('aria-pressed', enabled);
  $('focusBtn').setAttribute('aria-label', enabled ? 'Exit focused preview' : 'Focus preview');
  $('focusBtn').title = enabled ? 'Exit focused preview (Esc)' : 'Focus preview';
}

function applyPreset(value) {
  if (value === 'custom') return;
  $('ignorePatterns').value = value === 'complete' ? '' : DEFAULT_IGNORE;
  $('foldersOnly').checked = value === 'directories';
  $('showHidden').checked = true;
  $('maxDepth').value = '0';
}

function download(blob, extension) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const name = (output.rows[0]?.name.slice(0, -1) || 'structure').replace(/[<>:"/\\|?*\x00-\x1f]/g, '-');
  link.href = url;
  link.download = `${name}${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Tabs use roving focus and standard left/right/home/end navigation.
for (const group of document.querySelectorAll('[role=tablist]')) {
  group.addEventListener('click', event => {
    const button = event.target.closest('[role=tab]');
    if (button) activateTab(button);
  });
  group.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...group.querySelectorAll('[role=tab]')];
    const index = tabs.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    activateTab(tabs[next]);
  });
}

$('chooseFolder').onclick = () => $('folderInput').click();
$('folderInput').onchange = () => {
  try {
    const files = [...$('folderInput').files];
    if (!files.length) return;
    if (files.length > 50000) throw new Error('Select a project with no more than 50,000 files.');
    const next = fromPaths(files.map(file => file.webkitRelativePath || file.name));
    root = next;
    example = false;
    $('rootName').value = root.name;
    $('searchPaths').value = '';
    setError('parseError', '');
    refresh();
    notify(`Loaded ${files.length.toLocaleString()} file paths. File contents were not read.`);
  } catch (error) {
    notify(error.message);
  } finally {
    // Allow selecting the same directory again after files change.
    $('folderInput').value = '';
  }
};

for (const id of ['rootName', 'treeStyle', 'maxDepth', 'foldersOnly', 'showHidden', 'ignorePatterns']) {
  $(id).addEventListener('input', () => {
    if (['maxDepth', 'foldersOnly', 'showHidden', 'ignorePatterns'].includes(id)) $('preset').value = 'custom';
    refresh();
  });
}
$('preset').onchange = () => { applyPreset($('preset').value); refresh(); };
$('searchPaths').oninput = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(refresh, 120);
};
// Flush a pending path filter before an export or edit action.
for (const id of ['copyBtn', 'downloadBtn', 'zipBtn', 'editBtn']) $(id).addEventListener('pointerdown', () => { clearTimeout(searchTimer); refresh(); });

$('parseTree').onclick = () => {
  try {
    const next = parseTree($('asciiInput').value);
    root = next;
    example = false;
    $('rootName').value = root.name;
    $('searchPaths').value = '';
    setError('parseError', '');
    $('asciiInput').removeAttribute('aria-invalid');
    refresh();
    notify('Tree applied. Output settings also apply to pasted structures.');
  } catch (error) {
    setError('parseError', error.message);
    $('asciiInput').setAttribute('aria-invalid', 'true');
  }
};

$('loadSample').onclick = () => {
  root = parseTree(SAMPLE);
  example = true;
  $('rootName').value = root.name;
  $('preset').value = 'documentation';
  applyPreset('documentation');
  $('searchPaths').value = '';
  $('asciiInput').value = SAMPLE;
  setError('parseError', '');
  $('asciiInput').removeAttribute('aria-invalid');
  refresh();
  notify('Example project loaded.');
};

$('editBtn').onclick = () => {
  if (!root) return;
  setFocusMode(false);
  // Edit the complete source so filters never silently delete source entries.
  $('asciiInput').value = renderTree(root).text;
  activateTab($('pasteTab'));
  setError('parseError', '');
  $('asciiInput').removeAttribute('aria-invalid');
  $('asciiInput').focus();
  notify('Editing the complete source tree. Apply your changes to update the preview.');
};
$('editBtn').title = 'Edit complete source tree';
$('editBtn').setAttribute('aria-label', 'Edit complete source tree');
$('focusBtn').onclick = () => setFocusMode(!$('workspace').classList.contains('focus-mode'));
window.addEventListener('keydown', event => { if (event.key === 'Escape') setFocusMode(false); });

$('resetBtn').onclick = () => {
  root = null;
  example = false;
  $('folderInput').value = '';
  $('asciiInput').value = '';
  $('rootName').value = '';
  $('searchPaths').value = '';
  setError('parseError', '');
  $('asciiInput').removeAttribute('aria-invalid');
  refresh();
  notify('Workspace cleared.');
};

$('downloadBtn').onclick = () => {
  clearTimeout(searchTimer);
  refresh();
  if (!exportText) return;
  const type = format === 'json' ? 'application/json' : 'text/plain';
  const extension = format === 'json' ? '.json' : format === 'markdown' ? '.md' : '.txt';
  download(new Blob([exportText + '\n'], { type: `${type};charset=utf-8` }), extension);
  notify('Output downloaded.');
};
$('zipBtn').onclick = () => {
  try {
    clearTimeout(searchTimer);
    refresh();
    if (!exportText || !output.paths.length) return;
    download(createZip(output.paths), '.zip');
    notify('ZIP scaffold exported. All included files are empty placeholders.');
  } catch (error) { notify(error.message); }
};
$('copyBtn').onclick = async () => {
  clearTimeout(searchTimer);
  refresh();
  if (!exportText) return;
  try {
    await navigator.clipboard.writeText(exportText);
    notify('Output copied to clipboard.');
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents($('treeOutput'));
    selection.removeAllRanges();
    selection.addRange(range);
    notify('Clipboard access is unavailable. Press Ctrl+C or ⌘C to copy the selected output.');
  }
};
refresh();
