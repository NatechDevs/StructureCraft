# Architecture and design conventions

## Application boundary

This is a static application with no dependency install, bundler, backend, account system, or external API. `index.php` is a local XAMPP entry point only. The production build serves `index.html` as the product landing page, `workspace.html` as the tool, and `docs.html` as the public guide. The landing demo uses the same pure tree utilities as the workspace.

## Tree model

A node has a `name` and either a `Map` of `children` for directories or `null` for files. Maps avoid prototype-key collisions for names such as `__proto__`. The source model is kept intact. Filtering returns a new tree and never deletes source entries.

`assets/tree.mjs` exports:

- `validateName`: rejects separators, controls, and dot-only names.
- `folder`: creates a directory node.
- `fromPaths`: reconstructs a tree from browser-relative file paths.
- `parseTree`: reconstructs a tree from ASCII, Unicode, or indented text.
- `visibleTree`: applies exclusions, hidden-entry rules, directories-only mode, depth, root naming, path matching, and sorting.
- `renderTree`: produces display rows, plain text, counts, and ZIP paths.
- `treeToJSON`: converts a filtered tree into an explicit serializable node schema.
- `createZip`: writes ZIP STORE archives with empty files and UTF-8 names.

## UI state

`assets/app.mjs` owns the source model, sample-state indicator, selected output format, and current export text. Filters are read from labeled controls. `refresh()` computes the filtered model and updates preview and export state together. Invalid settings disable exports and show an inline error. A failed paste keeps the previous source and preview.

Path filtering is debounced by 120 milliseconds. Export actions flush pending filtering so downloads use the current query. Editing loads the complete source to avoid silently losing excluded entries. Focus mode changes layout only. No project paths or output settings are persisted. The shared theme script saves only the appearance preference and follows the operating system until a theme is explicitly chosen.

Output is rendered with DOM text nodes and `textContent`; filenames and pasted input never become HTML. Download URLs are revoked after use. Clipboard errors fall back to selected text for manual copying.

## Visual language

- Poppins 400, 500, and 600 for interface text. Files are self-hosted and licensed under SIL OFL.
- Monospace for directory output, paths, code examples, and small technical labels.
- Translucent neutral surfaces, restrained lavender accents, and a soft ambient background. Backdrop blur, subtle borders, and inset highlights create glass depth without reducing text contrast.
- A text-only Poppins wordmark with balanced weight and tracking, plus a consistent 24-unit SVG line-icon set; avoid decorative Unicode symbols as controls.
- Spacing uses a 4-pixel base, with 8/12/16/24/32-pixel groupings and a few deliberate optical adjustments.
- Main controls are at least 40 pixels tall on desktop and 44 pixels on narrow screens. Secondary compact icon controls have explicit accessible names.
- Technical copy describes behavior and export consequences directly. Avoid hype, fake counters, and marketing claims unrelated to the tool.
- The preview always uses monospace so branch alignment is preserved.

## Accessibility

Input and output tabs use roving tabindex with Arrow/Home/End navigation. Fields have explicit labels; error descriptions and invalid state are attached to inputs. The workspace is reachable by skip link. Icons are decorative where controls already have accessible names. Focus indicators are visible, and motion honors `prefers-reduced-motion`.

## Production packaging

`scripts/build.mjs` validates required inputs, checks its exact output path before clearing it, and copies a public allowlist to `dist/`. PHP, tests, deployment notes, and tooling stay outside that output. Vercel's configuration includes a same-origin CSP, anti-framing, MIME protection, feature restrictions, and conservative asset caching. The local production preview applies the global headers to help detect CSP issues before release.

## Verification

Run `npm test` for parser, filters, search, JSON, source immutability, depth limits, and ZIP checks. Run `npm run build` and inspect `npm run preview` after source changes. Browser QA should include complete and filtered exports, clipboard fallback, malformed input, focus mode, documentation links, and narrow-screen overflow. Actual Vercel routing and deployment state must be verified on the live deployment.
