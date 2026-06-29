# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-29

### Changed

- **BREAKING:** Renamed `issues` module to `contentGroup` across DB, API, routes (`/content-group`), RBAC (`modules.contentGroup.*`), and uploads (`content-group/`).

## [0.1.0] - 2026-06-28

### Added

- Monorepo split with npm workspaces (`@nextgen-cms/*` packages)
- `apps/pelak` unified deploy app (public site + Studio admin)
- `apps/site` and `apps/studio-app` for independent CI builds
- Package boundaries: contract, core, config, site-data, studio, seed
- Root `lib/*` deprecation shims for one release cycle
- `docker/Dockerfile` and package-aware entrypoint
- Developer onboarding and migration policy docs

[0.1.0]: https://github.com/example/nextgen-cms/releases/tag/v0.1.0
