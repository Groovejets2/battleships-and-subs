# Documentation Directory

This directory contains all project documentation organized by type and purpose.

## Structure

```
doc/
├── input/              # Reference materials and requirements (inputs to development)
├── output/             # Generated documentation (outputs from development sessions)
│   ├── project-specs/  # Core project specifications (GAME_RULES, REQUIREMENTS, DELIVERY_PLAN)
│   ├── analysis/       # Technical analysis and investigation documents
│   ├── sessions/       # Session state snapshots and breakthrough summaries
│   └── testing/        # Test plans and testing documentation
└── README.md           # This file
```

## Directory Details

### `input/`
Reference materials provided as input to the project.
- Currently empty - may contain design docs, stakeholder requirements, etc.

### `output/project-specs/`
**Core project specifications** - definitive source of truth for game design and implementation.

| Document | Description | Version | Last Updated |
|----------|-------------|---------|--------------|
| GAME_RULES.md | Complete game mechanics, fleet composition, combat rules, AI levels | ~25 pages | 2025-10-27 |
| REQUIREMENTS.md | Technical requirements (Functional, Non-Functional, Technical) | ~40 pages | 2025-10-27 |
| DELIVERY_PLAN.md | 10-week delivery plan with sprints, phases, resources, risks | ~50 pages | 2025-10-27 |

### `output/analysis/`
**Technical analysis documents** from initial investigation phase (Week 1-2).

| Document | Description | Date |
|----------|-------------|------|
| Documentation-Assessment_Sonnet-4.5_v1.0_2026-02-14.md | Initial codebase and documentation review | 2026-02-14 |
| Dynamic-UI-Resolution-Analysis_Sonnet-4.5_v1.0_2026-02-14.md | Responsive layout strategy analysis | 2026-02-14 |
| Testing-Strategy_Sonnet-4.5_v1.0_2026-02-14.md | Test infrastructure planning | 2026-02-14 |
| Accelerated-Delivery-Plan_Sonnet-4.5_v1.0_2026-02-14.md | Revised delivery timeline | 2026-02-14 |

### `output/sessions/`
**Session state snapshots** - detailed summaries of major development breakthroughs.

| Document | Description | Date |
|----------|-------------|------|
| Automated-Testing-Breakthrough_Sonnet-4.5_2026-02-15.md | Playwright automation implementation | 2026-02-15 |
| GameScene-Rotation-Fix-Summary_Sonnet-4.5_2026-02-15.md | Chrome DevTools rotation solution | 2026-02-15 |
| Session-State-Automated-Testing-Success_Sonnet-4.5_2026-02-15.md | Comprehensive testing success summary | 2026-02-15 |
| Session-State-Responsive-Fixes_Sonnet-4.5_2026-02-14.md | Initial responsive layout fixes | 2026-02-14 |
| Session-State-Rotation-Fixes_Sonnet-4.5_2026-02-15.md | Complete rotation fix documentation | 2026-02-15 |

**Purpose:** Enable context restoration when switching between LLMs or resuming after token limits.

### `output/testing/`
**Test plans and testing documentation**.

| Document | Description | Status |
|----------|-------------|--------|
| MANUAL-TEST-PLAN.md | Manual testing checklist for all scenes | Active |

**Note:** Automated test documentation is in `/tests/README.md`

### `output/` (root level)
**Cross-cutting documentation** that doesn't fit specific categories.

| Document | Description | Date |
|----------|-------------|------|
| Development-Workflow-Protocol_Sonnet-4.5_v1.0_2026-02-14.md | Model roles and handoff procedures | 2026-02-14 |

---

## Document Naming Convention

Format: `{Title}_{Model}_{Version}_{Date}.md`

- **Title:** Descriptive name in PascalCase with hyphens
- **Model:** AI model used (e.g., Sonnet-4.5, Opus-3, etc.)
- **Version:** Optional version number (e.g., v1.0)
- **Date:** ISO format YYYY-MM-DD

Examples:
- `Testing-Strategy_Sonnet-4.5_v1.0_2026-02-14.md`
- `GameScene-Rotation-Fix-Summary_Sonnet-4.5_2026-02-15.md`

---

## Maintenance

- **Project specs** are stable - only update when requirements change
- **Analysis docs** are historical - archive, don't update
- **Session docs** are append-only - create new files for new sessions
- **Testing docs** are living documents - update as testing evolves

---

**Last Updated:** 2026-02-15
**Structure Version:** 1.0
