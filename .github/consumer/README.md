# Release install check

The `install` job in [`release.yml`](../workflows/release.yml) copies this folder to a temporary directory on Ubuntu, macOS and Windows, adds `@kb.ui/react` from the new release's tarball URL, then runs `tsc` on `app.tsx` and `bun smoke.ts`. It is not part of the workspace.
