# Arcade Design Philosophy
## Battleships & Subs - Classic Gaming Aesthetic

**Version:** 1.0
**Date:** 2026-02-15
**Created by:** Sonnet 4.5
**Status:** Active Design Standard

---

## Overview

This document defines the arcade design philosophy for Battleships & Subs - a modern web game built with old-school arcade cabinet aesthetics. Every UI decision, animation, interaction, and visual element should embody the spirit of classic 1980s-1990s arcade gaming.

---

## Core Principles

### 1. **Old-School Arcade Cabinet Aesthetic**
Games should feel like they belong in a vintage arcade cabinet with a CRT monitor.

**Design Decisions:**
- Bold, high-contrast visuals
- Simple geometric shapes (rectangles, circles, lines)
- Vibrant primary and secondary colors
- Clear visual hierarchy
- Minimal decorative elements (function over ornament)

**Examples from Current Implementation:**
- High Scores table: Simple bordered rectangle with alternating row backgrounds
- Medal indicators: Pure colored circles (gold, silver, bronze)
- Buttons: Solid rectangles with colored borders

---

### 2. **Top 5 / Limited Display Philosophy**
Classic arcades showed only the best scores to create aspirational competition and save screen space.

**Design Decisions:**
- Show top 5 high scores ONLY (not 10, not scrolling lists)
- Compact, dense layouts that waste no space
- Information hierarchy: Show what matters, hide what doesn't
- Fixed-size tables (not dynamic based on data volume)

**Rationale:**
- Arcade cabinets had limited screen real estate
- Creates prestige ("only the best make the board")
- Reduces visual clutter
- Faster load times and simpler logic

**Example:**
```
✅ GOOD: Top 5 Commanders (fixed height table)
❌ BAD: "Showing 1-10 of 247 scores" (scrolling, pagination)
```

---

### 3. **White Text Philosophy**
Clean, uniform, readable text without unnecessary color coding.

**Design Decisions:**
- Primary text: WHITE (#FFFFFF)
- Secondary/meta text: Light blue (#A0C4FF)
- Headers/emphasis: Slightly larger WHITE text
- NO color-coded information in text (use icons/shapes instead)

**Why:**
- Arcade monitors had limited color palettes
- High contrast white-on-dark is most readable
- Color used for accent/decoration (medals, borders) not information
- Consistent visual language

**Examples:**
- ✅ Rank numbers: White text + colored medal circle
- ❌ Rank numbers: Gold/silver/bronze colored text

---

### 4. **Big Fonts / Touch-Friendly Sizing**
Arcade screens were viewed from standing distance; touch screens need large hit targets.

**Design Decisions:**
- Minimum font sizes: 18px for body, 20px for emphasis
- Button minimum: 44px height (Apple Human Interface Guidelines)
- Touch targets: Minimum 44x44px with padding
- Headers: 36-48px+ depending on importance
- Generous whitespace around interactive elements

**Size Scale:**
| Element | Size | Purpose |
|---------|------|---------|
| Title | 42-48px | Main scene title |
| Headers | 18px | Table headers, section labels |
| Body text | 18px | Names, labels |
| Emphasis | 20px | Scores, important numbers |
| Buttons | 18px text, 50px height | Primary actions |

---

### 5. **Fixed Spacing / Content-Relative Positioning**
Elements positioned relative to content, not arbitrary screen percentages.

**Design Decisions:**
- Fixed pixel spacing between elements (e.g., 35px)
- Position calculated from content edges
- Avoid percentage-based positioning for buttons
- Create predictable visual rhythm

**Example:**
```javascript
// ✅ GOOD: Fixed spacing from content
const buttonY = tableBottom + 35 + (buttonHeight / 2);

// ❌ BAD: Arbitrary screen percentage
const buttonY = height * 0.94; // Button "floats" unpredictably
```

**Rationale:**
- Arcade cabinets had fixed layouts
- User expectation: "Button is always X distance below content"
- Professional, cohesive aesthetic
- Works across all screen sizes when content size is consistent

---

### 6. **Arcade-Style Animations**
Quick, snappy, game-feel animations that enhance (not delay) interaction.

**Animation Principles:**
- **Duration:** 300-500ms (fast, responsive)
- **Easing:** Back.easeOut for "bounce" (arcade physics feel)
- **Stagger:** 100-150ms delays between elements
- **Purpose:** Celebrate player actions, provide feedback
- **Never block:** Animations are eye-candy, not gatekeepers

**Examples from High Scores:**
```javascript
// Fly-in animation: Rows enter from left
Stagger: 500ms + (row# × 150ms)
Elements: rank → name (+50ms) → medal (+100ms) → score (+150ms)
Duration: 400ms per element
Easing: Back.easeOut (arcade bounce)
Total: ~1.5 seconds for full board reveal
```

**Animation Types:**
- **Entrance:** Fly-in, fade-in with scale
- **Hover:** Scale 1.05x, color shift (150ms)
- **Click:** Scale 0.95x → 1.0x (100ms yoyo)
- **Exit:** Quick fade (200ms)

**What NOT to do:**
- ❌ Long, smooth eases (too modern/corporate)
- ❌ Complex physics (bouncing, springs beyond Back.easeOut)
- ❌ Delays > 2 seconds total
- ❌ Animations that prevent interaction

---

### 7. **Immediate Feedback**
Every touch/click gets instant visual and (eventually) audio confirmation.

**Design Decisions:**
- Button press: Immediate scale down (0ms delay)
- Hover states: 150ms max transition
- Visual state changes before action execution
- Clear hover cursor (useHandCursor: true)

**Button Interaction States:**
1. **Default:** Solid background, colored border
2. **Hover:** Background becomes border color, scale 1.05x
3. **Press:** Scale 0.95x (yoyo)
4. **Disabled:** Grayed out, no cursor change

---

## Scene-Specific Guidelines

### HighScoresScene (Arcade Leaderboard)

**Implemented Philosophy:**
- ✅ **Top 5 only** - Classic arcade competition board
- ✅ **All text WHITE** - Clean, uniform appearance
- ✅ **Medal circles** - Color used for decoration/honor, not text
- ✅ **Bigger fonts** - Headers 18px, Scores 20px (bold)
- ✅ **Compact table** - 85% width, no wasted space
- ✅ **Tighter spacing** - Score close to name (logical grouping)
- ✅ **Fixed button spacing** - Always 35px below table bottom
- ✅ **Fly-in animation** - Staggered left-to-right arcade reveal

**Visual Hierarchy:**
```
Title (42px, white, bold)
  ↓
Subtitle (16px, light blue, italic)
  ↓
Table Header (18px, blue, bold)
  ↓
Rows (18px white, 20px white bold for scores)
  ↓
Fixed 35px spacing
  ↓
BACK Button (18px white, 50px height)
```

---

## Design Patterns

### Color Palette

**Primary Colors:**
- Background: Gradient #1e3c72 → #2a5298 (navy blues)
- Text: #FFFFFF (white)
- Secondary text: #A0C4FF (light blue)
- Accent: #3498DB (bright blue)

**Accent Colors (Medals/Borders):**
- Gold: #FFD700
- Silver: #C0C0C0
- Bronze: #CD7F32
- Green (score): #2ECC71
- Red (danger): #E74C3C
- Gray (neutral): #2C3E50

**Usage:**
- Use PRIMARY colors for 90% of UI
- Use ACCENT colors sparingly for emphasis/decoration
- Never use more than 3 colors in a single component

---

### Layout Grid

**Spacing Scale:**
- **XS:** 10px - Internal padding
- **SM:** 20px - Between related elements
- **MD:** 35px - Between sections (e.g., table → button)
- **LG:** 50px - Major spacing (title → content)

**Container Widths:**
- Mobile: 85-90% of screen
- Tablet/Desktop: Max 600px centered

---

## Mobile-First Touch Design

### Touch Targets
- Minimum: 44x44px (Apple HIG)
- Preferred: 50x50px+ with visual padding
- Spacing between touch targets: 8px minimum

### Font Scaling
```
< 400px width:  Small devices (13-15px body, 16-18px emphasis)
400-700px:      Medium devices (15-18px body, 18-20px emphasis)
> 700px:        Large devices (18px body, 20-24px emphasis)
```

### Layout Modes
- **Portrait (height > width):** Stack vertically, full-width elements
- **Landscape (width > height):** Side-by-side when possible
- **Threshold:** 600px width (switch from mobile to tablet)

---

## Animation Timing Standards

| Action | Duration | Easing | Purpose |
|--------|----------|--------|---------|
| Button hover | 150ms | Linear | Quick feedback |
| Button press | 100ms | Yoyo | Immediate response |
| Scene entrance | 1000-1500ms | Back.easeOut | Celebratory reveal |
| Element fly-in | 400ms | Back.easeOut | Arcade bounce |
| Fade transitions | 600ms | Linear | Scene changes |
| Micro-interactions | 200ms | Quad.easeOut | Subtle polish |

---

## Anti-Patterns (What NOT to Do)

### ❌ Modern UI Conventions That Don't Fit
- Drop shadows, gradients on buttons (too skeuomorphic)
- Rounded corners > 4px (too modern/material design)
- Infinite scroll (arcade = fixed lists)
- Pagination controls (use fixed top-N instead)
- Loading spinners (instant or quick fades only)
- Hamburger menus (use visible buttons)

### ❌ Information Overload
- Don't show dates if not essential (removed from High Scores)
- Don't show accuracy % if just nice-to-have
- Don't show player avatars (keep it simple)
- Don't show "Share to Twitter" (out of scope)

### ❌ Over-Animation
- Don't animate every single element on every scene
- Don't use physics beyond Back.easeOut bounce
- Don't delay user actions with animations
- Don't loop animations indefinitely (subtle background only)

---

## Future Application

### TitleScene
- ✅ Bold white title text
- ✅ Simple rectangular buttons with colored borders
- ✅ Fly-in animations on load
- ⏳ Consider: Button press animations more snappy

### GameScene
- ⏳ Large, touch-friendly grid cells
- ⏳ Immediate visual feedback on cell tap
- ⏳ Bold "HIT" / "MISS" animations (arcade style)
- ⏳ Compact UI, game takes center stage
- ⏳ Fixed button positions (not percentage-based)

### SettingsScene
- ⏳ Large sliders/toggles (easy touch)
- ⏳ White text labels, colored accent indicators
- ⏳ Fixed spacing between settings groups
- ⏳ Minimal options (audio, difficulty, reset)

---

## Success Metrics

A design adheres to this philosophy if:

1. ✅ **Looks arcade:** Could believably appear on a 1990s cabinet CRT
2. ✅ **Touch-friendly:** All interactions work one-handed on phone
3. ✅ **Fast:** Loads and animates in < 2 seconds
4. ✅ **Simple:** 3-year-old could navigate (big buttons, clear labels)
5. ✅ **Consistent:** Same patterns used across all scenes
6. ✅ **Focused:** Shows only essential information, nothing extraneous

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-15 | Initial arcade design philosophy | Sonnet 4.5 |

---

## References

**External Inspiration:**
- Classic Arcade Cabinets (1980s-1990s)
- Apple Human Interface Guidelines (Touch Targets)
- Pac-Man, Space Invaders, Galaga (Visual Style)
- Street Fighter II (High Score Displays)

**Internal Documentation:**
- `/doc/output/project-specs/GAME_RULES.md`
- `/doc/output/project-specs/REQUIREMENTS.md`
- Current implementation: `src/scenes/HighScoresScene.js`

---

**Remember:** When in doubt, ask: "Would this look out of place in a 1990s arcade?" If yes, simplify. If no, you're on the right track.

🕹️ **Keep it simple. Keep it bold. Keep it arcade.**
