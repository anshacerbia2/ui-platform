# Scnehaux UI Platform

Navigation for the `@scnx/core-ui` and `@scnx/system` workspace.

## Architecture and delivery

There is one architecture authority: the
[Scnehaux Architecture repository](https://github.com/anshacerbia2/scnehaux-architecture).
Its GDC, EAD, PAD, SAD, ADR, STD, and Technology Radar records are authoritative
according to lifecycle state. A `draft` or `proposed` record is evidence of a
proposal, not an approved rule.

Use these documents in order:

- [SAD-003](https://github.com/anshacerbia2/scnehaux-architecture/blob/main/04-system/scnehaux-ui-platform/scnehaux-ui-platform.sad.md)
  — system architecture and document topology;
- [PLAN.md](PLAN.md) — ordered work, role accountability, and pass/fail
  acceptance;
- [ROADMAP.md](ROADMAP.md) — phase state, target dates, and exit gates;
- [five TDDs](docs/designs/) — component-level implementation contracts;
- [principal review records](docs/reviews/) — non-normative audit records split
  by review round.

No other Markdown is kept in this repository: each package has one
navigation-only README, and the documentation gate rejects any other file.
Source comments cannot override the central architecture, TDDs, PLAN, or
ROADMAP. Current delivery state belongs
only in ROADMAP; executable work and commands belong only in PLAN and the
applicable TDD; package boundaries and dependency direction belong only in
SAD-003.
