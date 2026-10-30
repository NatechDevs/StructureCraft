# Deploying StructureCraft to Vercel

StructureCraft deploys as a static website. PHP is used only as a compatibility entry for XAMPP. The build never copies PHP to production.

## Prerequisites

- A Git repository containing this project.
- A Vercel account connected to your Git provider.
- Node.js 22 or newer for local verification. No third-party npm packages are required.

## Verify locally

```sh
npm test
npm run build
npm run preview
```

Open http://localhost:8080. This serves `dist/` with the global security headers in `vercel.json`. If port 8080 is occupied, set the `PORT` environment variable. Stop the preview before starting another server on the same port.

The build checks required public files, clears only the project's `dist/` directory, and copies the application, documentation, icons, fonts and their license, robots.txt, and 404 page. It excludes PHP, tests, development tools, Git metadata, and deployment configuration.

## Import into Vercel

1. Push the completed project to your Git provider.
2. In Vercel, add a new project and import the repository.
3. Use the repository root as Root Directory.
4. Select the **Other** framework preset. `vercel.json` sets `framework` to `null`.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. No environment variables are needed. The default install step can complete without installing packages because this project has no dependencies.
8. Deploy. Verify the preview deployment before promoting it or changing your production domain.

Vercel reads `vercel.json` for clean URLs, legacy redirects, response headers, and caching. `/docs` serves the documentation page and `/workspace` serves the tool. Legacy `/index.php` and `/aaindex.html` routes redirect to `/`.

Official references:

- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/builds/configure-a-build

## Production verification

- The home page and `/docs` load without console errors.
- Poppins fonts, SVG icons, CSS, and JavaScript modules load from your deployment origin.
- Folder import generates a tree; file contents are not transmitted.
- Presets, exclusions, path search, depth limits, and hidden-entry switches update the preview.
- Plain text, Markdown, and JSON copying/downloading work.
- ZIPs extract into the expected structure with empty files and empty directories.
- A malformed pasted tree shows an inline error and preserves the previous preview.
- Focus mode can be entered and exited; Escape restores the settings panel.
- The mobile layout does not overflow horizontally.
- Unknown routes return the custom 404 page.
- Legacy PHP and HTML routes redirect as expected.

## Security headers and caching

The Content Security Policy permits scripts, CSS, fonts, and images from the same origin. It blocks network connections initiated by the app, object embeds, form submissions, and framing. `nosniff` and explicit JavaScript module types prevent MIME ambiguity. Camera, microphone, and geolocation are disabled.

Assets use a one-hour cache with revalidation. Filenames are not content-hashed, so they deliberately do not use immutable caching. A returning browser may use cached assets for that period; verify changes in a fresh session after deployment. HTML uses Vercel's default static response behavior.

## Domains and metadata

Set a custom domain in Vercel when ready. A canonical URL and sitemap have not been hardcoded because the production hostname is not yet known. Add them once the final domain is established. Review any additional analytics or integrations before enabling them; the application's current privacy statements assume no tracking and no external API calls.

## Rollback

Use Vercel's deployment history to promote a previously verified deployment. No database migration, environment variable rollback, or persistent application data is involved. Keep the matching Git commit for every release.

## What has not been verified automatically

Local builds and browser checks do not establish a successful hosted deployment. The live Vercel deployment, edge redirects, clean URLs, deployment headers, custom domain, and production clipboard permissions must be checked on the deployed URL.
