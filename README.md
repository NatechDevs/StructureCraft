# StructureCraft

A browser-local directory tree generator for READMEs, technical documentation, project handoffs, and folder scaffolding.

Licensed under the [MIT License](LICENSE). Bundled fonts retain their [separate license](THIRD_PARTY_NOTICES.md).

## Use the workspace

Open the workspace from the landing page, then select a folder or paste an existing directory tree. Adjust the output settings, then copy or download the result. File contents are never read or uploaded.

- **Three output views:** plain tree, fenced Markdown, and structured JSON.
- **ZIP scaffolding:** exports visible folders and empty placeholder files.
- **Filter presets:** Documentation, Complete project, and Directories only.
- **Path search:** case-insensitive relative-path matching that preserves ancestor folders.
- **Detailed controls:** root name, depth limit, hidden entries, wildcard exclusions, Unicode or ASCII branches.
- **Source editing:** load the complete source into the paste editor without losing excluded entries.
- **Focused preview:** expand the output workspace and press Escape to restore settings.
- **Accessible controls:** labeled fields, inline validation, keyboard tabs, visible focus, copy fallback, and reduced-motion support.
- **Light and dark modes:** follows system appearance initially and remembers a manual choice across pages and tabs.
- **Local typography:** Poppins is self-hosted under the SIL Open Font License.

## Start locally

Requires Node.js 22 or newer. No package installation is required.

```sh
npm start
```

Open http://localhost:8080. Changes to source files are available after refreshing. With XAMPP, the existing PHP entry serves the same application. Use an HTTP server rather than a `file://` URL because the app uses JavaScript modules.

## Test and build

```sh
npm test
npm run build
npm run preview
```

The production build is written to `dist/`. The preview serves it at http://localhost:8080 with production security headers. `npm start` and `npm run preview` use the same port; run one at a time or set `PORT`.

## Documentation

Open `docs.html` in the running app for the user guide. It covers folder imports, tree syntax, presets, filtering, exports, the JSON schema, keyboard controls, privacy, and troubleshooting.

- [Vercel deployment guide](docs/deployment.md)
- [Architecture and design conventions](docs/architecture.md)
- [Font license](assets/fonts/OFL.txt)

## Deploy to Vercel

Import the repository with framework preset **Other**, build command `npm run build`, and output directory `dist`. `vercel.json` provides those settings, legacy redirects, and response headers. No server functions, PHP runtime, environment variables, or database are needed. Only the production allowlist is deployed.

See the deployment guide before publishing. This repository is prepared for deployment; a successful local build does not mean a hosted deployment has been created or verified.

## Input example

```text
project/
├── config.d/
│   └── settings.json
├── src/
│   └── index.js
├── empty-directory/
└── LICENSE
```

Use one root and four characters per indentation level. A trailing slash or children identifies a directory; other entries are files. Plain indented trees, standard Unicode/ASCII branches, Unicode names, and fenced Markdown trees are supported.

## Export semantics

All outputs follow the current name, filters, and maximum depth. ZIP exports are scaffolds, **not backups**: every included file is empty. Folder counts include the root. Path search retains the root when no entries match. The pencil button edits the original full tree, not a filtered subset. JSON export is supported; JSON import is not.

## Privacy and limits

The page stores project paths and pasted content in memory only. Refreshing clears that state. There is no telemetry, backend processing, or third-party asset request. Only the light/dark appearance preference is saved in browser storage; project data is never persisted. Hosting providers may keep ordinary request logs. Clipboard and downloaded content are handled by the browser and operating system.

Browser folder selection may omit empty directories. Folder imports support up to 50,000 files and 100 nested directories. Pasted trees support up to 20,000 lines and 100 nested levels. ZIP supports up to 65,535 entries. Very large previews may be slow on mobile devices. Names may need adaptation for a different operating system before ZIP extraction.

## Contributing and support

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request. Use [GitHub Issues](https://github.com/NatechDevs/StructureCraft/issues) for ordinary bugs and feature requests. Report vulnerabilities through the private process in [SECURITY.md](SECURITY.md).

See [CHANGELOG.md](CHANGELOG.md) for project changes. The repository is open source; the npm package remains marked private to avoid accidental package publication.

## License and attribution

Original project code and documentation are licensed under the [MIT License](LICENSE), copyright 2026 NatechDevs. Preserve the copyright and permission notice when redistributing the code. Poppins is distributed under the SIL Open Font License 1.1; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the [font license](assets/fonts/OFL.txt).

The production build includes both project licensing notices and the font license. Third-party materials retain their own terms.

## Project structure

```text
StructureCraft/
├── assets/
│   ├── fonts/           # Poppins weights and OFL license
│   ├── app.mjs          # UI state, controls, and browser exports
│   ├── tree.mjs         # Pure model, parser, filtering, JSON, ZIP
│   ├── styles.css       # Shared design system and responsive layouts
│   ├── icons.svg        # Original SVG symbol set
│   └── favicon.svg
├── docs/                # Development and deployment notes
├── scripts/
│   ├── build.mjs        # Explicit public build allowlist
│   └── serve.mjs        # Local source/production preview server
├── tests/tree.test.mjs
├── index.html           # Product landing page
├── workspace.html       # Directory tree workspace
├── docs.html
├── 404.html
├── index.php            # Local XAMPP compatibility only
├── aaindex.html         # Legacy redirect
├── package.json
└── vercel.json
```

Built by [NatechDevs](https://github.com/NatechDevs/StructureCraft).
