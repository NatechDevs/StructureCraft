# Security policy

## Scope

Security fixes are considered against the current `main` branch. There is no separate long-term support policy or guaranteed response time for older snapshots.

Relevant concerns include script injection through imported names, unsafe ZIP paths, unexpected transmission or persistence of project information, and deployment configuration that exposes non-public files.

## Report a vulnerability privately

Do not include exploit details, private file paths, credentials, or personal information in public issues or pull requests.

1. Open the repository's [Security page](https://github.com/NatechDevs/StructureCraft/security).
2. If **Report a vulnerability** is available, submit a private report there. This option depends on the repository's private reporting setting; this document does not enable it.
3. If private reporting is unavailable and no private maintainer contact is listed, open an issue titled **Private security contact requested** with no vulnerability details. Wait for a private reporting channel before sharing technical information.

In a private report, include the affected commit or version, browser and operating system, impact, and a minimal reproduction using synthetic filenames or data. Include a suggested fix if you have one. Coordinate with the maintainer before publishing an exploit.

## Safe verification

Test with your own files and accounts. Do not access other people's data, disrupt a hosted service, or scan unrelated systems. Repository access is not authorization to test third-party infrastructure.

## Known product boundaries

- Folder imports use file paths, not original file contents.
- ZIP downloads contain empty placeholder files and are not backups.
- Exclusions and path search are output filters, not a substitute for reviewing an export before sharing it.
- The appearance preference is stored locally; project paths and pasted trees are not persisted by the app.
- Hosting providers, the browser, and the operating system have their own security and privacy behavior.

These boundaries are also explained in the public product guide. Report behavior that violates the app's stated guarantees through the private process above.
