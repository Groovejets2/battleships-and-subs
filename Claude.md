# Claude.md - AI Context & Project Documentation Index

This file serves as a reference index for AI assistants working on this project.

**LINE LIMIT MANDATE:** Maximum 400 lines (token conservation). Move detailed content to `/doc/output` documents.

---

## REQUIRED READING (All AI Agents)

**CRITICAL:** Both Kerry McGregor (Sonnet 4.5) and Tony Stark (Opus 4.5) MUST read:
1. This Claude.md file (always)
2. `/doc/output/Development-Workflow-Protocol_Sonnet-4.5_v1.0_2026-02-14.md` (workflow, model roles, handoff protocol)
3. `.claude/skills/gitflow/gitflow.md` (git operations)
4. Any Tony-created architectural directive documents

---

## Model Roles

**Kerry McGregor (Sonnet 4.5):** Primary development agent - coding, docs, git, testing, implementation
**Tony Stark (Opus 4.5):** Architectural consultant - deep analysis, root cause investigation, strategic decisions

See Development-Workflow-Protocol document for complete handoff procedures and token management.

---

## Project Documentation

### Comprehensive Documentation Suite Created: 2025-10-27

Three formal project documents exist in the root directory:

#### 1. **GAME_RULES.md** (~25 pages)
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

#### 2. **REQUIREMENTS.md** (~40 pages)
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

#### 3. **DELIVERY_PLAN.md** (~50 pages)
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

1. **Always reference** the three main documents (GAME_RULES.md, REQUIREMENTS.md, DELIVERY_PLAN.md) for detailed specifications
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

---

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-27 | 1.0 | Initial documentation suite created | Claude |
| 2025-10-27 | 1.1 | Added project index and design decisions | Claude |
| 2025-11-01 | 1.2 | Session status update - testing attempted | Claude |
| 2026-02-14 | 1.3 | Added Claude Code Skills section and gitflow skill v1.0.0 | Claude/JH |
| 2026-02-14 | 1.4 | Added 400-line mandate, model roles (Kerry/Tony), required reading section | Kerry McGregor |

---

## Recent Session Notes (2025-11-01)

### Attempted: Testing Responsive Layout
- **Goal:** Verify grids display side-by-side on desktop, stacked on mobile
- **Status:** ❌ Did not work (app failed to launch properly)
- **Issue:** App did not display/function when accessed via localhost:8080
- **Server:** Python HTTP server (python3 -m http.server 8080) - ran but app didn't work

### Investigation Needed:
1. Check browser console for JavaScript errors
2. Verify Phaser is loading from CDN (index.html)
3. Check if ES6 modules working correctly
4. Verify all file paths are correct
5. Consider CORS or module loading issues

### Next Steps When Resuming:
1. Debug why app didn't work in browser
2. Check console errors in browser DevTools
3. Verify index.html loads Phaser correctly
4. Test if scenes are initializing
5. Once working: Verify responsive layout (side-by-side vs stacked)
6. Then proceed to Week 3 Combat System implementation

---

**Last Updated:** 2026-02-14
**Project Status:** Week 3 - Pre-Combat (Testing Phase)
**Current Blocker:** App not loading/functioning in browser
**Next Milestone:** Debug and fix app launch, then proceed to Combat System
**Skills Added:** gitflow v1.0.0
