# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **BREAKING:** Content group redesign — `number`/`season`/`year`/`label`/`period` removed; fields are now `slug`, `title`, `status` (`draft`/`published`/`archived`), `publishedAt`, `cover`, `pdfSrc`. Public routes are slug-based (`/content-group/{slug}`). Article↔group is many-to-many via `article_content_groups`. Delete flow: archive → permanent delete. Migration: `0018_content_groups_redesign.sql`. Short links `m{id}` resolve by content group id.

## [1.0.0] - 2026-06-29

### Changed

- **BREAKING:** Renamed `issues` module to `contentGroup` across DB, API, routes (`/content-group`), RBAC (`modules.contentGroup.*`), and uploads (`content-group/`).
- Clarified deployment model as single deploy app: `apps/pelak` (site + `/admin`).

## [0.1.0] - 2026-06-28

### Added

- Monorepo split with npm workspaces (`@nextgen-cms/*` packages)
- `apps/pelak` unified deploy app (public site + Studio admin)
- Historical note: `apps/site` and `apps/studio-app` appeared in early repo history and are now removed.
- Package boundaries: contract, core, config, site-data, studio, seed
- Root `lib/*` deprecation shims for one release cycle
- `Dockerfile` (ریشه repo) and package-aware entrypoint
- Developer onboarding and migration policy docs

[0.1.0]: https://github.com/example/nextgen-cms/releases/tag/v0.1.0
