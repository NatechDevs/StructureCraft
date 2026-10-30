export function validateName(name) {
  if (!name || name === '.' || name === '..' || /[\\/\x00-\x1f\x7f]/.test(name)) throw new Error('Use a name without slashes, control characters, or dot-only paths.');
  return name;
}
export function folder(name) { return { name: validateName(name), children: new Map() }; }
export function fromPaths(paths) {
  let root;
  for (const path of paths) {
    const parts = path.split('/');
    if (parts.length > 102) throw new Error('Folder import supports up to 100 nested directories.');
    parts.forEach(validateName);
    if (!root) root = folder(parts[0]);
    if (parts[0] !== root.name) throw new Error('Please choose one project folder.');
    let node = root;
    parts.slice(1).forEach((name, i, rest) => {
      const isFolder = i < rest.length - 1;
      if (!node.children.has(name)) node.children.set(name, isFolder ? folder(name) : { name, children: null });
      node = node.children.get(name);
      if (isFolder && !node.children) throw new Error('A file and folder have the same path.');
    });
  }
  return root || null;
}
export function parseTree(source) {
  let lines = source.replace(/\r/g, '').trim().split('\n');
  if (lines[0]?.trim().startsWith('```')) {
    if (!lines.at(-1).trim().startsWith('```')) throw new Error('Close the Markdown code block first.');
    lines = lines.slice(1, -1);
  }
  if (lines.length > 20000) throw new Error('Please use a tree with fewer than 20,000 lines.');
  const entries = lines.filter(line => line.trim()).map(line => {
    const branch = line.match(/^((?:│   |\|   |    )*)(?:├── |└── |\|-- |`-- |\+-- )(.+)$/);
    const indent = line.match(/^( *)(\S.*)$/);
    let depth, name;
    if (branch) { depth = branch[1].length / 4 + 1; name = branch[2].trim(); }
    else if (indent && indent[1].length % 4 === 0) { depth = indent[1].length / 4; name = indent[2].trim(); }
    else throw new Error('Use four spaces per level and standard tree branches.');
    const explicit = name.endsWith('/');
    if (explicit) name = name.slice(0, -1);
    validateName(name);
    return { depth, name, explicit };
  });
  if (!entries.length) throw new Error('Paste a directory tree first.');
  const offset = entries[0].depth;
  const stack = [];
  let root;
  entries.forEach((entry, i) => {
    const depth = entry.depth - offset;
    if (depth < 0 || depth > stack.length || depth > 100) throw new Error(`Invalid indentation on entry ${i + 1}.`);
    const isFolder = entry.explicit || (entries[i + 1]?.depth > entry.depth) || i === 0;
    const node = isFolder ? folder(entry.name) : { name: entry.name, children: null };
    if (depth === 0) {
      if (root) throw new Error('Use a single root folder above all other entries.');
      root = node;
    } else {
      const parent = stack[depth - 1];
      if (!parent?.children) throw new Error('A file cannot contain child entries.');
      if (parent.children.has(node.name)) throw new Error(`Duplicate entry: ${node.name}`);
      parent.children.set(node.name, node);
    }
    stack.length = depth;
    stack.push(node);
  });
  return root;
}
export function visibleTree(root, options = {}) {
  if (!root) return null;
  const rootName = validateName(options.name?.trim() || root.name);
  const query = (options.query || '').trim().toLocaleLowerCase();
  const patterns = (options.ignore || '').split(',').map(s => s.trim()).filter(Boolean).map(s => new RegExp('^' + s.split('*').map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$', 'i'));
  function visit(node, depth, path) {
    if (!node.children) return { ...node };
    const copy = folder(node.name);
    if (options.depth && depth >= options.depth) return copy;
    [...node.children.values()].sort((a, b) => Number(!!b.children) - Number(!!a.children) || a.name.localeCompare(b.name, 'en', { numeric: true })).forEach(child => {
      if (options.foldersOnly && !child.children || !options.hidden && child.name.startsWith('.') || patterns.some(p => p.test(child.name))) return;
      const childPath = path + '/' + child.name;
      const visible = visit(child, depth + 1, childPath);
      if (query && !childPath.toLocaleLowerCase().includes(query) && (!visible.children || !visible.children.size)) return;
      copy.children.set(child.name, visible);
    });
    return copy;
  }
  const result = visit(root, 0, rootName);
  result.name = rootName;
  return result;
}
export function treeToJSON(node) {
  if (!node) return null;
  if (!node.children) return { name: node.name, type: 'file' };
  return { name: node.name, type: 'directory', children: [...node.children.values()].map(treeToJSON) };
}
export function renderTree(root, style = 'unicode') {
  if (!root) return { text: '', rows: [], files: 0, folders: 0, paths: [] };
  const ascii = style === 'ascii';
  const rows = [{ prefix: '', name: root.name + '/', folder: true }];
  const paths = [{ name: root.name + '/', folder: true }];
  let files = 0, folders = 1;
  function walk(node, prefix, path) {
    [...node.children.values()].forEach((child, i, all) => {
      const last = i === all.length - 1, isFolder = !!child.children;
      const name = child.name + (isFolder ? '/' : '');
      rows.push({ prefix: prefix + (ascii ? (last ? '`-- ' : '|-- ') : (last ? '└── ' : '├── ')), name, folder: isFolder });
      paths.push({ name: path + '/' + name, folder: isFolder });
      if (isFolder) { folders++; walk(child, prefix + (last ? '    ' : ascii ? '|   ' : '│   '), path + '/' + child.name); }
      else files++;
    });
  }
  walk(root, '', root.name);
  return { text: rows.map(r => r.prefix + r.name).join('\n'), rows, files, folders, paths };
}
// ZIP STORE format. Empty scaffold files need no compression or external library.
export function createZip(paths) {
  if (paths.length > 65535) throw new Error('ZIP export supports up to 65,535 entries.');
  const encoder = new TextEncoder(), locals = [], central = [];
  let offset = 0, centralSize = 0;
  paths.forEach(path => {
    path.name.split('/').filter(Boolean).forEach(validateName);
    const name = encoder.encode(path.name);
    if (name.length > 65535) throw new Error('A path is too long to export.');
    const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x800, true); lv.setUint16(12, 33, true); lv.setUint16(26, name.length, true); local.set(name, 30);
    const entry = new Uint8Array(46 + name.length), cv = new DataView(entry.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true); cv.setUint16(14, 33, true); cv.setUint16(28, name.length, true); cv.setUint32(38, path.folder ? 16 : 0, true); cv.setUint32(42, offset, true); entry.set(name, 46);
    locals.push(local); central.push(entry); offset += local.length; centralSize += entry.length;
  });
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, paths.length, true); ev.setUint16(10, paths.length, true); ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
  return new Blob([...locals, ...central, end], { type: 'application/zip' });
}
