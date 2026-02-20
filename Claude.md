# Claude.md - AI Context & Project Documentation Index

This file serves as a reference index for AI assistants working on this project.

**LINE LIMIT MANDATE:** Maximum 400 lines (token conservation). Move detailed content to `/doc/output` documents.

---

## RESUME INSTRUCTIONS — START HERE

**If Jon says "Read the CLAUDE.md" — do the following in order:**

1. Read this file (done)
2. Read the latest session state: `doc/output/sessions/Session-State_Sonnet-4.5_v1.4.1-planning_2026-02-17.md`
3. Run `git status` and `git log --oneline -3` to confirm clean state
4. Report to Jon: current branch, HEAD commit, and first pending task
5. Ask: "Ready to begin — shall I start [first pending task]?"

**DO NOT start coding until Jon confirms.**

---

## REQUIRED READING (All AI Agents)

**CRITICAL:** Both Kerry McGregor (Sonnet 4.5) and Tony Stark (Opus 4.5) MUST read:
1. This Claude.md file (always)
2. `doc/output/sessions/Session-State_Sonnet-4.5_v1.4.1-planning_2026-02-17.md` ← **LATEST SESSION STATE**
3. `/doc/output/Project-Vision_JH_v1.0_2026-02-17.md` (mission, pillars, graphics strategy, AI-first mandate)
4. `/doc/output/Development-Workflow-Protocol_Sonnet-4.5_v1.0_2026-02-14.md` (workflow, model roles)
5. `.claude/skills/gitflow/gitflow.md` (git operations)
6. `/doc/output/Arcade-Design-Philosophy_Sonnet-4.5_v1.0_2026-02-15.md` (UI/UX design standards)
7. `/doc/output/project-specs/` (GAME_RULES, REQUIREMENTS, DELIVERY_PLAN)

---

## Team Roles

**Jon (JH) — Project Manager:** Vision, priorities, approvals, play testing, feedback. Does NOT write code.
**Kerry McGregor (Sonnet 4.5) — Lead Developer:** All coding, docs, git, testing, implementation.
**Tony Stark (Opus 4.5) — Architectural Consultant:** Deep analysis, root cause investigation, strategic decisions.

### AI-First Mandate (CORE PROJECT RULE)

AI is the default and preferred solution for every problem. Manual human effort is the last resort.

- All code is written by Kerry McGregor (AI)
- All testing and automated tasks are managed by Kerry McGregor (AI)
- All documentation is authored and maintained by Kerry McGregor (AI)
- All git operations are performed by Kerry McGregor (AI)
- When any new problem arises: **ask "can AI solve this?" first**
- Jon reviews, approves, and provides direction — he does not write code

See Development-Workflow-Protocol document for complete handoff procedures and token management.

---

## Project Documentation

### Comprehensive Documentation Suite Created: 2025-10-27

**Location:** All project documentation in `/doc/output` with organised subfolders (Updated 2026-02-15)

**CRITICAL RULE:** ALL documentation MUST be placed in `/doc/output` folder or subfolders. Never create documentation in project root.

**Folder Structure:**
- `/doc/output/` - Workflow, protocol, and design philosophy documents
- `/doc/output/project-specs/` - Core project specifications (GAME_RULES, REQUIREMENTS, DELIVERY_PLAN)
- `/doc/output/analysis/` - Technical analysis and investigation reports
- `/doc/output/sessions/` - Session state snapshots and breakthrough summaries
- `/doc/output/testing/` - Testing documentation and manual test plans

**Design Standards:**
- `/doc/output/Arcade-Design-Philosophy_Sonnet-4.5_v1.0_2026-02-15.md` - Comprehensive arcade UI/UX design philosophy
  - Old-school arcade cabinet aesthetic
  - Top 5 / Limited display philosophy
  - White text philosophy and color palette
  - Big fonts and touch-friendly sizing
  - Fixed spacing and content-relative positioning
  - Arcade-style animations and timing standards
  - Scene-specific guidelines (HighScoresScene, TitleScene, GameScene, SettingsScene)

See `/doc/README.md` for complete documentation structure guide.

Three formal project documents:

#### 1. **GAME_RULES.md** (~25 pages) - `/doc/output/project-specs/GAME_RULES.md`
- Complete game rules and mechanics
- Fleet composition (5 ships with specifications)
- Placement rules (10×10 grid, 1-square spacing including diagonals)
- Combat mechanics (turn-based, hit/miss/sunk)
- Special abilities for each ship type (Nuclear Sub, Cruiser, Attack Sub)
- AI difficulty levels (Easy, Normal, Hard, Expert)
- Scoring system and win/loss conditions
- UI/UX guidelines and visual feedback rules
- Settings, audio, and customization options
- Technical requirements and platform support

#### 2. **REQUIREMENTS.md** (~40 pages) - `/doc/output/project-specs/REQUIREMENTS.md`
- Complete technical requirements specification
- Functional Requirements (FR) organized into 11 categories:
  - Game Initialization, Title Screen, Ship Placement, Combat Phase
  - AI Opponent, Special Abilities, Game End Conditions
  - Settings Management, High Scores, Responsive Design, Input Handling
- Non-Functional Requirements (Performance, Usability, Reliability, Maintainability)
- Technical Requirements (Tech stack: Phaser 3.90.0, ES6 JavaScript)
- Browser/device support specifications
- Data requirements and persistence (localStorage)
- Security, performance benchmarks, testing requirements
- Deployment and maintenance procedures
- All requirements prioritized (P0=Critical, P1=High, P2=Nice to Have)

#### 3. **DELIVERY_PLAN.md** (~50 pages) - `/doc/output/project-specs/DELIVERY_PLAN.md`
- Comprehensive 10-week project delivery plan
- Three-phase approach:
  - **Phase 1 (Weeks 1-4):** Core Gameplay - MVP with basic AI
  - **Phase 2 (Weeks 5-7):** Enhanced Features - Abilities, audio, polish
  - **Phase 3 (Weeks 8-10):** Production Release - Testing, docs, deployment
- Current status: Week 2-3 (Foundation ✅ complete, Combat system 🔄 in progress)
- Detailed sprint planning with 1-week iterations
- Resource allocation and team structure options
- Risk management with mitigation strategies
- Quality assurance and testing strategy
- Deployment strategy (GitHub Pages, Netlify, Vercel)
- Success metrics and KPIs
- Post-launch plan and version roadmap

---

## Claude Code Autonomy Directives

- Work autonomously without requesting permission for:
  - Code changes and refactoring
  - File creation/modification
  - Git operations (commits, branches per /gitflow)
  - Package installations
  - Testing and debugging
  - Documentation updates

- Only ask for confirmation when:
  - Deleting files or major refactors that risk breaking changes
  - Changing core architecture decisions
  - Installing packages with security implications
  - Approaching token limits

- Auto-pause when token usage reaches threshold

## CRITICAL: Automatic Documentation Maintenance (PRIORITY RULE)

**ALWAYS update project documentation automatically as tasks complete. NEVER wait to be asked.**

After completing ANY task, phase, or significant milestone:

1. **Update session state document** (`/doc/output/sessions/Session-State_*.md`):
   - Mark completed tasks with ✅
   - Update current status and next pending tasks
   - Update git state (branch, HEAD commit)
   - Add brief summary of what was implemented

2. **Update CLAUDE.md**:
   - Update "Last Updated" date at bottom
   - Update "Project Status" section
   - Update "Recent Work" section

3. **Update DELIVERY_PLAN.md** (if phase/week completed):
   - Mark completed sprint items
   - Update overall project percentage

4. **Create summary document** (if major feature/phase completed):
   - Technical summary in `/doc/output/`
   - Include implementation details, decisions made, known issues

**Timing:** Update documentation IMMEDIATELY after pushing code, before continuing to next task.

**This is NOT optional.** Keeping documentation current is a core responsibility.

---

## Design Decisions Log

### Decisions Made (2025-10-27)

**Grid Size: 10×10 (Classic)**
- Considered: 12×12 and 14×14 variants
- Decision: Stick with 10×10 for v1.0
- Rationale: Mobile usability, proven design, familiar to players
- Status: APPROVED ✅

**Counter Mechanics: Not Implemented**
- Considered: Defensive counter-moves (dive/smoke) with 3-second timer
- Decision: Defer to v2.0 or later
- Rationale: Complexity risk, timeline impact, test-first approach
- Status: REJECTED for v1.0 ⛔

**Turn-Based Combat: Standard**
- Decision: Classic turn-based attack system (no real-time elements in v1.0)
- Bonus turns on hits maintained
- Status: APPROVED ✅

---

## Project Architecture Summary

### Technology Stack
- **Framework:** Phaser 3.90.0 (HTML5 game framework)
- **Language:** JavaScript ES6 modules
- **Build:** None (vanilla JS, no webpack/rollup)
- **Storage:** Browser localStorage
- **Hosting:** Static hosting (GitHub Pages, Netlify, or Vercel)

### Current Code Structure
```
src/
├── main.js                   # Entry point, game initialization
├── components/
│   └── Grid.js              # Grid rendering component
├── config/
│   └── gameConfig.js        # Game constants and configuration
├── managers/
│   ├── FleetManager.js      # Fleet placement and attack logic
│   └── FleetManager.test.js # Unit tests
├── models/
│   ├── Ship.js              # Ship class with damage tracking
│   └── Ship.test.js         # Unit tests
├── scenes/
│   ├── TitleScene.js        # Main menu
│   ├── GameScene.js         # Primary gameplay
│   ├── SettingsScene.js     # Settings/options
│   └── HighScoresScene.js   # Leaderboard
└── utils/
    ├── gridValidation.js    # Placement validation logic
    ├── gridValidation.test.js
    └── dimensions.js        # Screen calculations
```

### Completed Features (Weeks 1-2) ✅
- Project structure and Phaser integration
- Scene management (4 scenes)
- Responsive grid system (10×10)
- Ship model with placement and damage tracking
- FleetManager for fleet logic
- Placement validation (bounds, overlap, adjacency)
- Settings persistence (localStorage)
- High scores leaderboard (localStorage)
- Responsive design foundation

### In Progress (Week 3) 🔄
- Combat system implementation
- Attack mechanics (hit/miss detection)
- Turn management system
- Visual feedback for attacks

### Planned (Weeks 4-10) ⏳
- AI opponent (Week 4)
- Special abilities (Week 5)
- Audio system (Week 6)
- Statistics tracking (Week 7)
- Testing and bug fixes (Week 8)
- Documentation finalization (Week 9)
- Deployment and launch (Week 10)

---

## Key Rules & Constraints

### Game Rules (Immutable for v1.0)
- **Grid:** 10×10 (columns A-J, rows 1-10)
- **Fleet:** 5 ships (Carrier-5, Nuclear Sub-3, Cruiser-3, Attack Sub-2, Destroyer-2)
- **Spacing:** Minimum 1-square between ships (including diagonals)
- **Orientation:** Horizontal or vertical only
- **Combat:** Turn-based, bonus turn on hit
- **Victory:** Sink all 5 enemy ships

### Technical Constraints
- Client-side only (no backend server)
- No build tools (vanilla JavaScript)
- localStorage only (5-10MB limit)
- Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile support required (375×667 minimum screen size)

### Development Constraints
- Target: 8-10 week delivery timeline
- Single developer or small team (1-3 people)
- No significant scope changes during Phase 1
- Feature freeze after Week 5 Sprint Planning

---

## Reference Notes for AI Assistants

### When Working on This Project:

1. **Always reference** the three main documents in `/doc/output/Original-Docs/` (GAME_RULES.md, REQUIREMENTS.md, DELIVERY_PLAN.md) for detailed specifications
2. **Follow** the priority system: P0 (Critical) → P1 (High) → P2 (Nice to Have)
3. **Maintain** the modular architecture (scenes, models, managers, components, utils)
4. **Test** on mobile as well as desktop (responsive design is critical)
5. **Document** all code with JSDoc comments
6. **Update** this Claude.md file when making significant decisions or adding features

### Current Development Phase:
- **Week:** 3 of 10
- **Phase:** 1 (Core Gameplay)
- **Sprint:** Combat System Implementation
- **Priority:** Complete attack mechanics and turn management

### Known Issues/Technical Debt:
- Audio assets are placeholders (audio.here.txt, fonts.here.txt)
- Tests are console-based (consider adding Jest in Week 8)
- AI opponent not yet implemented (Week 4 priority)
- Special abilities defined but not implemented (Week 5)

---

## Claude Code Skills

### Skill Management Protocol

**CRITICAL:** When creating any new Claude Code skill:

1. **Create in BOTH locations:**
   - **Global:** `C:\Users\GROOVEJETS\.claude\skills\{skill-name}\{skill-name}.md`
   - **Project:** `.claude\skills\{skill-name}\{skill-name}.md`

2. **Folder structure is REQUIRED:**
   ```
   .claude/skills/
     └── skill-name/           ← Folder name = skill invocation name
         └── skill-name.md     ← The skill content
   ```
   **NOT:** `.claude/skills/skill-name.md` ❌

3. **Version control skills:**
   - Include version number in skill header
   - Maintain version history table in skill file
   - Update Claude.md with skill creation/updates

### Available Skills

#### Gitflow (v1.0.0)
- **Location:** `.claude/skills/gitflow/gitflow.md`
- **Purpose:** Standardized git workflow for all JH projects
- **Invoke:** `/gitflow` or "Use the gitflow skill"
- **Created:** 2026-02-14
- **Covers:**
  - Branch naming conventions (feature/bugfix/hotfix/release)
  - Commit message standards
  - PR workflow and templates
  - Release and tagging procedures
  - Semantic versioning
  - Common scenarios and troubleshooting

#### UI Test (v1.0.0)
- **Location:** `.claude/skills/ui-test/ui-test.md`
- **Purpose:** Automated UI testing for Phaser games using Playwright/Chromium
- **Invoke:** "Use the ui-test skill" or reference the skill for testing
- **Created:** 2026-02-17
- **Covers:**
  - Playwright automated browser testing
  - Canvas-based game testing (coordinate clicking)
  - Responsive design verification
  - Screenshot capture and visual regression testing
  - Test file organization in `tests/ui/` directory

---

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-27 | 1.0 | Initial documentation suite created | Claude |
| 2025-10-27 | 1.1 | Added project index and design decisions | Claude |
| 2025-11-01 | 1.2 | Session status update - testing attempted | Claude |
| 2026-02-14 | 1.3 | Added Claude Code Skills section and gitflow skill v1.0.0 | Claude/JH |
| 2026-02-14 | 1.4 | Added 400-line mandate, model roles (Kerry/Tony), required reading section | Kerry McGregor |
| 2026-02-14 | 1.5 | Comprehensive analysis complete - screen adaptation root cause identified | Kerry McGregor |
| 2026-02-14 | 1.6 | Reorganised documentation - moved existing docs to /doc/output, investigations to /investigation | Kerry McGregor |
| 2026-02-14 | 1.7 | Updated paths - Investigation capitalised, original docs to Original-Docs subfolder | Kerry McGregor |

---

## Analysis Documents (2026-02-14)

### Kerry McGregor (Sonnet 4.5) Analysis Complete

**Four comprehensive analysis documents created in `/doc/output/Investigation/`:**

1. **Dynamic-UI-Resolution-Analysis** - Root cause of responsive design failure identified
   - **Location:** `/doc/output/Investigation/Dynamic-UI-Resolution-Analysis_Sonnet-4.5_v1.0_2026-02-14.md`
   - 5 critical architectural issues preventing screen adaptation
   - Primary cause: Hardcoded 1100px height in dimensions.js
   - Solution: Phaser Scale Manager integration + unified resize pattern
   - Estimated fix time: 5-6 hours

2. **Documentation-Assessment** - Project documentation quality review
   - **Location:** `/doc/output/Investigation/Documentation-Assessment_Sonnet-4.5_v1.0_2026-02-14.md`
   - 3,836 lines of structured documentation analysed
   - Overall grade: B+ (professional standard)
   - Gaps identified: Testing docs, architecture diagrams, API reference
   - Recommendation: Add testing strategy and architecture diagrams

3. **Accelerated-Delivery-Plan** - Claude Code timeline projection
   - **Location:** `/doc/output/Investigation/Accelerated-Delivery-Plan_Sonnet-4.5_v1.0_2026-02-14.md`
   - Original 8-week timeline (Weeks 3-10) compressed to 5-7 days
   - 10x faster code generation vs solo developer
   - Detailed day-by-day breakdown with deliverables
   - Total estimated effort: 58-62 hours

4. **Testing-Strategy** - Comprehensive testing approach
   - **Location:** `/doc/output/Investigation/Testing-Strategy_Sonnet-4.5_v1.0_2026-02-14.md`
   - 30-40% automated coverage target (Playwright + Jest)
   - Manual testing checklist for cross-browser/device
   - Zero-cost tooling (Chrome DevTools, Playwright, Jest)
   - Pre-release QA checklist included

**Status:** Awaiting approval to proceed with fixes

---

## Recent Session Notes (2026-02-14)

### Completed: Comprehensive Codebase Analysis

**Root Cause Identified:**
- Screen adaptation fails due to 5 architectural issues
- Primary blocker: Hardcoded 1100px height (dimensions.js)
- Secondary issues: Inconsistent resize handlers, missing Phaser scale integration
- **Solution ready:** Detailed fix plan in Dynamic-UI-Resolution-Analysis document

**Analysis Deliverables:**
- Dynamic UI resolution analysis (complete architectural diagnosis)
- Documentation assessment (B+ grade, minor gaps identified)
- Accelerated delivery plan (5-7 day completion timeline)
- Testing strategy (30-40% coverage, zero-cost tools)

**Key Findings:**
- Phaser 3.90.0 fully supports dynamic orientation changes when configured correctly
- Fix existing architecture rather than lock orientation (recommended approach)
- Claude Code enables 10x acceleration vs solo developer
- Estimated 58-62 hours to complete Weeks 3-10 work

**Next Actions:**
1. Present findings to JH
2. Obtain approval for proposed solution architecture
3. Execute 5-6 hour responsive design fix
4. Proceed with accelerated delivery plan

---

**Last Updated:** 2026-02-17 (Session End: Week 4 AI Opponent Complete)
**Project Status:** 🎉 v1.4.0 RELEASED TO PRODUCTION
**Branch Status:**
- main: 1a64982 (tagged v1.4.0) - PRODUCTION
- develop: 451db24 - LATEST DEVELOPMENT

**Week 4 Completion Summary:**
✅ AIManager.js: AI fleet placement + Easy/Normal/Hard targeting algorithms
✅ TurnManager.js: Turn state machine, score tracking, win/loss detection
✅ GameScene.js: Full combat loop with hit/miss/sunk visual feedback
✅ GameOverScene.js: Victory and defeat screens with score save
✅ main.js: GameOverScene registered
✅ UI Tests: All PASS at 4 screen sizes (375×500 to 1280×720)
✅ Complete gitflow: feature → develop → release/v1.4.0 → main → tag

**Key Technical Decisions (Week 4):**
- Auto-place player fleet (ship placement UI is Week 5)
- Settings difficulty (0=EASY, 1=NORMAL, 2=HARD) maps to AIManager
- MISS = turn switches, HIT = bonus turn (same player continues)
- Score saved to localStorage 'battleships_highscores' (top 5)
- Visual state arrays persist across screen resize (playerCellStates, enemyCellStates)
- AI uses --theirs strategy for settings.local.json in all future merges

**Week 5 Priorities (Next):**
- Ship placement UI (drag-and-drop or click-to-place)
- Special abilities (Nuclear Sub dive/torpedo, Cruiser depth charge, Attack Sub silent running)
- Audio system integration
- UI polish and animations

**Release v1.3.0 Details:**
- Complete responsive design for all scenes
- 82 files changed, 2,631 insertions, 221 deletions
- Automated testing (100% pass rate)
- Tagged and pushed to production
- Release branch cleaned up per gitflow

**Timeline Review Completed:**
Three options presented for remaining work (Weeks 4-10):
- Option A: Week 4 MVP (AI Opponent) - 6-8 hours
- Option B: Weeks 4-6 (MVP + Abilities + Audio) - 2-3 days
- Option C: Full completion (Weeks 4-10) - 5-7 days

**Awaiting Decision:** User to select development path (A, B, or C)

**Next Session Context:**
When resuming, reference this section to understand:
1. v1.3.0 successfully released to production
2. All responsive design work complete
3. Ready to begin Week 4 (AI Opponent) or other chosen path
4. Gitflow process fully understood and documented
5. Line ending issues (.gitattributes) resolved
6. Test infrastructure in place and working

**Current Working State:**
- On develop branch
- All changes committed and pushed
- No uncommitted work
- test-screenshots/ folder (local only, gitignored)
- Ready for new feature branch creation

**Skills Added:** gitflow v1.0.0, ui-test v1.0.0
**Tools Added:** Playwright for automated visual testing
**Test Infrastructure:** `tests/ui/` directory, automated responsive testing
**Documentation Structure:**
- Workflow: /doc/output/Development-Workflow-Protocol
- Investigations: /doc/output/Investigation/ (4 analysis documents)
- Original Specs: /doc/output/project-specs/ (GAME_RULES, REQUIREMENTS, DELIVERY_PLAN)
- Accelerated Plan: /doc/output/analysis/Accelerated-Delivery-Plan
- Test Plans: /doc/output/Test-Plan/ (Manual testing procedures)
- Skills: .claude/skills/gitflow/, .claude/skills/ui-test/ (also in global)
