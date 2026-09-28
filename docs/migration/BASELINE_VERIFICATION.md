# Extracted baseline verification

Environment: Windows, pnpm 10.23.0; checked 2026-09-28. These are observations of the copied baseline, not release conformance.

| Check | Result |
| --- | --- |
| File fidelity | 465 copied package files matched their source SHA-256 hashes at extraction; zero mismatches |
| Dependency install | `pnpm install --ignore-scripts` passed and produced a standalone lockfile; peer warnings remain for `esbuild-plugin-preserve-directives` and `esbuild-sass-plugin` |
| Type check | `pnpm typecheck` passed for both packages |
| Source tests | `core-ui`: 2 test files, 10 tests passed; `design-system`: placeholder test script exits 1 |
| Build | `core-ui` JS/types completed; `design-system` CSS/JS emitted; declaration generation failed with Node heap out of memory under the default process limit |
| Secret scan | No credential-like filenames and no matches for common private-key/credential assignments in copied package text; publication still requires normal human review |
| Architecture governance | Canonical architecture linter returned `[]` after the review-draft edits |
| Downstream TDD governance | Current `scnehaux-lint --target docs/02-designs` rejects the path as outside its allowed artifact directories. The new TDDs are drafts; central-linter CI integration is P0 item 0. |
| Fresh-clone install | GitHub clone succeeded; `pnpm install` in a Windows TEMP folder stopped with `ENOSPC` on drive C before scripts ran. This is an environment-capacity limit, so clean-checkout install remains unverified. |

The package build shows ignored `"use client"` directive warnings in some bundled outputs. That warning and the heap failure belong in P0 verification. The generated CSS/JS is insufficient evidence for published export, computed style, CSP, RSC, or federation claims.

The source microfrontend project was not modified by these commands.
