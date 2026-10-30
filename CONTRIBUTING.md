# Contributing to StructureCraft

Bug reports, documentation fixes, accessibility improvements, and focused code changes are welcome. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

Search existing [issues](https://github.com/NatechDevs/StructureCraft/issues) before opening a new one. For a larger feature or architecture change, describe the problem and proposed behavior in an issue first. Small fixes can go directly to a pull request.

For security concerns, follow [SECURITY.md](SECURITY.md). Do not publish sensitive details in a normal issue or pull request.

## Development setup

Use Node.js 22 or newer. No dependency installation is required.

```sh
git clone https://github.com/NatechDevs/StructureCraft.git
cd StructureCraft
npm start
```

Open the address printed by the server. Fork the repository and create a topic branch in your fork when you do not have write access. Use a separate branch for each change.

## Scope and conventions

- Keep processing local to the browser. Do not introduce uploads, analytics, external font requests, or project-data persistence without discussion.
- Prefer small, readable JavaScript modules and native browser APIs. Explain the need before adding a dependency.
- Keep tree operations in `assets/tree.mjs` separate from UI state in `assets/app.mjs` and the landing demo in `assets/landing.mjs`.
- Preserve text-node rendering for filenames. Do not render imported names as HTML.
- Preserve keyboard navigation, visible focus, reduced-motion support, mobile layouts, and both color themes.
- Use the established Poppins wordmark, glass surfaces, spacing, and restrained accent colors.
- Update relevant documentation when behavior changes. Public `docs.html` explains the product; deployment and development notes belong in `docs/`.
- Preserve third-party licenses and attribution. New assets must have a documented source and redistribution terms.

See [the architecture guide](docs/architecture.md) for the model, UI boundaries, and design conventions.

## Verification

For application changes, run:

```sh
npm test
npm run build
npm run preview
```

Check the relevant pages and workflows in the production preview. Include meaningful tests when changing parsing, filtering, serialization, or archive behavior. For interface changes, check a narrow screen, light and dark modes, and keyboard operation. Stop `npm start` before running the preview on the same port.

For documentation-only changes, check links, examples, and consistency; a full application test run is generally unnecessary. Build if the edited file is part of the public website or production packaging.

Do not commit generated `dist/`, `.vercel/`, dependencies, logs, credentials, or unrelated projects.

## Pull requests

Describe the problem, resulting behavior, and relevant verification. Keep changes focused and include before/after screenshots for visible changes when useful. A maintainer may request revisions; opening a pull request does not guarantee acceptance or a particular review time.

## Licensing

By contributing original code or documentation to this repository, you agree to make that contribution available under its [MIT License](LICENSE). Only submit material you have the right to contribute. Third-party assets retain their documented licenses.
