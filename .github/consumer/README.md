# Consumer install check

Run `bun run build && bun run test:consumer` from the repository root to pack the current React package and install its tarball in a temporary consumer outside the workspace. The check runs the installed-version guard, typechecks `app.tsx`, and runs `smoke.ts`. Any failure stops the check; temporary files are removed on success or failure. PR CI runs this check in **Check: code**, after tarball content checks. It does not publish packages.

The `install` job in [`release.yml`](../workflows/release.yml) uses this fixture on Ubuntu, macOS and Windows with the uploaded release tarball URL. Real npm publishing remains in that release workflow, after all three consumer installs pass. This fixture is not part of the workspace.
