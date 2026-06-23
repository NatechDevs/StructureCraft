# StructureCraft

> Browser-based ASCII file & folder architecture visualizer. Upload a folder, get an instant ASCII tree.

![status](https://img.shields.io/badge/source-private-lightgrey) ![stack](https://img.shields.io/badge/stack-PHP%20%7C%20JavaScript%20%7C%20HTML%20%7C%20CSS-orange)

## What this is

StructureCraft turns any project folder into a clean ASCII directory tree that you can copy, download, or even reverse back into a folder structure. Built for developers who want professional-looking architecture diagrams for READMEs, documentation, code reviews, or client hand-offs — without ever sending files to a server.

## Key features

- **Instant ASCII tree** — Upload any folder via browser and see the full directory structure rendered with box-drawing characters
- **Copy & download** — One-click copy to clipboard or download as `.txt` file
- **Reverse export** — Paste an existing ASCII tree and convert it back into a real folder structure as a ZIP file
- **Privacy by design** — Everything runs locally in your browser. No uploads, no storage, no tracking
- **Source code protection** — Right-click, DevTools, and keyboard shortcuts are disabled to deter casual source viewing

## Tech stack

| Layer | Tools |
|---|---|
| Backend | PHP (output buffering, source obfuscation) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Libraries | particles.js, JSZip, Font Awesome 6, Google Fonts (Poppins) |
| Security | Client-side protection (frame-busting, DevTools detection, keyboard block) |

## Screenshots

| Screen | Preview |
|---|---|
| Hero section | ![hero](./screenshots/hero.png) |
| Tool with ASCII output | ![tool](./screenshots/tool.png) |

## How it works (high level)

- Files are read entirely in the browser using the native folder picker API — nothing leaves your machine
- Each file path is parsed into a nested object tree, then a recursive renderer walks the tree and produces an ASCII diagram using Unicode box-drawing characters
- The reverse flow takes the visual ASCII tree, measures indentation depth to reconstruct the original hierarchy, and generates a ZIP archive with the same folder/file layout

## What I built

The core challenge was the two-way conversion: first from a flat list of file paths to a structured tree, then back from a visual ASCII string to real files. The ASCII parser had to infer depth from prefix indentation and distinguish folders from files by the presence of a file extension — a simple but effective heuristic. I also added a multi-layered client-side protection system (right-click, keyboard, DevTools, frame-busting, console wipe) to explore what's possible with browser-based source guarding.

## Source code

This repository is private. Source code is available for review on request — happy to walk through the codebase directly in a call, or grant temporary read-only access for serious inquiries.

## Contact

NatechDevs · natechdevs@users.noreply.github.com · https://github.com/NatechDevs
