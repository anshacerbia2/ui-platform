# Source copy record

Date: 2026-09-28.

The repository was initialized from an empty GitHub repository. `packages/core-ui` and `packages/design-system` were copied from the existing local microfrontend workspace. The source workspace was read and copied, never edited. The package copy contains **465 files**. A SHA-256 comparison of each copied file against its source matched with **zero mismatches**.

The local copy excludes `node_modules`, `dist`, editor state, build logs, and TypeScript build cache. Of the 465 copied package files, **141** are Panda-generated files under `src/styled-system`; the inherited package `.gitignore` excludes them from version control. Thus **324 package files** are staged for this repository. Package manifests and source files were copied as-is. The two package README files were then rewritten in the new repository because the inherited text claimed production readiness and showed import paths that do not match the package exports. Workspace scaffolding and architecture/planning documents were also added. Generated assets are rebuilt in the new workspace.

This provenance check proves copy fidelity for included files; it does not prove that the baseline builds, tests, publishes, or meets accessibility and security requirements. The extraction intentionally preserves known defects so P0 can fix them with reproducible tests in this repository.

The original microfrontend repository remains a separate project. Subsequent changes to this UI Platform repository do not flow back to it automatically.
