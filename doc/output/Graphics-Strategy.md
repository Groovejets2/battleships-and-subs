# Graphics Strategy — Battleships & Subs
**Version:** 1.0
**Created:** 2026-02-17
**Author:** Kerry McGregor (Sonnet 4.5)
**Status:** APPROVED — Autonomous decision per AI-First Mandate

---

## Executive Summary

**DECISION: Use OpenGameArt Sea Warfare Set as primary ship sprite source.**

- ✅ CC0 public domain (commercial use, no attribution required)
- ✅ All 5 required ship types included
- ✅ Proven production quality (from abandoned XNA game project)
- ✅ Pixel art arcade aesthetic matches Project Vision Pillar 1
- ✅ Cannons separated from hulls (enables animation flexibility)
- ✅ 21.7 KB total size (mobile-friendly)

**Backup:** PixelLab AI generator for custom ships if style gaps identified after integration.

---

## Research Findings (2026-02-17)

### Option 1: OpenGameArt Sea Warfare Set ⭐ SELECTED

**Source:** https://opengameart.org/content/sea-warfare-set-ships-and-more
**License:** CC0 (public domain)
**Artist:** hashashin (2022)

**Ships Included:**
- ✅ Battleship
- ✅ Carrier (Aircraft Carrier)
- ✅ Cruiser
- ✅ Destroyer
- ✅ Submarine
- ✅ Patrol Boat (bonus)
- ✅ Rescue Ship (bonus)
- ✅ Jet Fighter Plane (bonus — potential for future mechanics)

**Art Style:** 2D pixel art, top-down perspective, arcade-friendly aesthetic

**Technical:**
- Cannons separated from ship hulls (modular animation)
- 21.7 KB file size
- Proven in production (XNA/Visual Studio game project)

**Pillar 1 Test:** ✅ PASS
*"Would this screen look credible in a $5 App Store game listing?"* — Yes. Pixel art arcade style matches Space Invaders Extreme / Pac-Man CE reference aesthetic.

**Notes:**
- Artist explicitly permits relicensing: *"This is public domain, so u can credit me or not, it's all up to you!"*
- No attribution legally required, but recommended in credits.txt

---

### Option 2: Kenney.nl Pirate Pack

**Source:** https://kenney.nl/assets/pirate-pack
**License:** CC0
**Version:** 1.0 (12/02/2017)

**Ships Included:** 190+ assets, pirate-themed ships

**Art Style:** Colorful pixel art, retro arcade, pirate aesthetic

**Pillar 1 Test:** ⚠️ CONDITIONAL PASS
Style is arcade-grade, but **pirate theme** conflicts with modern naval warfare setting. Ships are sailing ships (masts, sails) not battleships (guns, turrets).

**Decision:** Not selected for ships. **Consider for menu/UI elements** (anchors, treasure chest for achievements, pirate flag icons).

---

### Option 3: CraftPix Free Top-Down Military Boats

**Source:** https://craftpix.net/freebies/free-top-down-military-boats-pixel-art/
**License:** Royalty-free commercial use

**Ships Included:** 3 boat variants (green, pixel, white pixel) + destruction frames

**Art Style:** Pixel art, military themed, 32×32 water tileset included

**Pillar 1 Test:** ⚠️ PARTIAL PASS
Only 3 boat variants — **insufficient** for our 5 ship types (Carrier, Nuclear Sub, Cruiser, Attack Sub, Destroyer).

**Decision:** Not selected. Consider water tileset for grid background texture (Week 6A).

---

### Option 4: OpenGameArt Battleships (Simple)

**Source:** https://opengameart.org/content/battleships
**License:** CC0

**Ships Included:** Carrier, Cruiser, Patrol, Submarine

**Art Style:** Simple pixel art, educational quality

**Pillar 1 Test:** ❌ FAIL
Developer feedback: *"The aircraft carrier needed to be stretched horizontally; there was too much transparent space on the ends."* Quality insufficient for commercial mobile game standard.

**Decision:** Rejected.

---

## AI Generation Tools (Backup Plan)

If Sea Warfare Set style gaps identified after integration, use AI generation:

### Primary AI Tool: PixelLab

**Source:** https://www.pixellab.ai/
**Strengths:**
- Generates 4 or 8 directional views (isometric/top-down)
- Map/tileset generation
- Spritesheet generator for consistent tiles
- Specialized for top-down games

**Use Case:** Generate missing ship types or create color variants

---

### Secondary AI Tools:

| Tool | URL | Best For |
|------|-----|----------|
| Sprite AI | sprite-ai.art | Specific pixel sizes (16×16 to 128×128), built-in editor |
| God Mode AI | godmodeai.co | 8-directional animation (walk, run, combat) |
| Imagine.art | imagine.art | Custom resolutions, 8-bit/16-bit presets |
| PixelVibe (Rosebud AI) | lab.rosebud.ai | 15 models, 2D weapons, characters |

**Prompts for naval ships:**
```
"top-down view battleship, pixel art, 16-bit style, arcade game, naval warfare"
"aircraft carrier sprite, top-down perspective, 64x64 pixels, arcade aesthetic"
"submarine pixel art, top-down view, naval military, game asset"
```

---

## Asset Implementation Plan

### Week 6A: Graphics Overhaul (Immediate)

**Task 1: Download Sea Warfare Set**
- [ ] Download from OpenGameArt: https://opengameart.org/content/sea-warfare-set-ships-and-more
- [ ] Extract to `/assets/ships/`
- [ ] Verify all 5 required ships present
- [ ] Check sprite dimensions and transparency

**Task 2: Integration**
- [ ] Update Grid.js to load ship sprites instead of solid color blocks
- [ ] Map sprites to SHIP_TYPES in gameConfig.js:
  - Carrier (5-long) → carrier sprite
  - Nuclear Sub (3-long) → submarine sprite
  - Cruiser (3-long) → cruiser sprite
  - Attack Sub (2-long) → submarine sprite (scaled or recolored)
  - Destroyer (2-long) → destroyer sprite
- [ ] Test sprite rendering at all responsive sizes (1280×720, 768×1024, 375×667)

**Task 3: Combat Markers**
- [ ] Extract explosion/hit markers if included in pack
- [ ] If not: create programmatic Phaser Graphics for:
  - Hit marker: red explosion burst, leaves red X
  - Miss marker: white water splash, leaves white circle
  - Sunk overlay: dim ship to dark red, draw X over each segment

**Task 4: Attribution**
- [ ] Create `/assets/credits.txt`:
  ```
  Ship Sprites: Sea Warfare Set by hashashin
  Source: https://opengameart.org/content/sea-warfare-set-ships-and-more
  License: CC0 (Public Domain)
  ```

---

### Icons & UI Elements

**Kenney.nl Icon Packs** (to be audited Week 6A):
- Search "game icons", "medals", "ui pack"
- Needed: medal icons (gold/silver/bronze), rank badges, ability indicators
- All Kenney.nl assets are CC0

**Combat Effects** (Programmatic):
- Torpedo fire animation: Phaser Graphics particle emitter
- Depth charge ripple: expanding circle tween
- Row Nuke flash: full-screen red overlay fade
- Chain Bonus combo flash: yellow screen pulse

---

## Quality Standards (Pillar 1 Enforcement)

All integrated graphics must pass this test:

> **"Would this screen look credible in a $5 App Store game listing?"**

**Visual Audit Checklist (Week 6A completion):**
- [ ] Ship sprites are clearly identifiable at min cell size (16px)
- [ ] Art style is consistent across all 5 ships
- [ ] Combat markers (hit/miss) are visible and arcade-appropriate
- [ ] No pixelation/blur artifacts at any responsive size
- [ ] Colour palette matches naval/military theme (blues, greys, reds)
- [ ] Ships look distinct from each other (silhouette test)

**Reference Games (aesthetic match):**
- Space Invaders Extreme (PSP) — bold pixel art, high-contrast
- Pac-Man CE — clean HD arcade aesthetic
- Classic Namco/Capcom arcade cabinets — bold colours, clear sprites

---

## Fallback Plan (If Sea Warfare Set Fails)

If integration testing reveals Sea Warfare Set doesn't meet quality standards:

1. **Generate custom ships via PixelLab:**
   - 5 ships at 64×64 or 128×128 resolution
   - Top-down view, 8-bit or 16-bit pixel art style
   - Export as PNG with transparency
   - Total generation time estimate: 2-3 hours

2. **Alternative: Procedural generation**
   - Use Phaser Graphics to draw ships programmatically
   - Reference: simple geometric shapes (rectangles, triangles for bow)
   - Colour-coded per SHIP_TYPES in gameConfig.js
   - Fastest option but lowest visual polish

3. **Commercial asset purchase** (last resort):
   - itch.io, Unity Asset Store, GameDev Market
   - Budget: <$20 for complete naval sprite pack
   - Only if free options exhausted and deadline pressure

---

## Next Steps

1. **Week 5:** No graphics work — focus on UX polish, mechanics, settings
2. **Week 6A Start:** Download Sea Warfare Set, integrate into Grid.js
3. **Week 6A Mid:** Visual audit, adjust if needed, document final asset sources
4. **Week 7:** Full arcade aesthetic overhaul (metal piping, menu redesign)

---

**Last Updated:** 2026-02-17
**Next Review:** Week 6A start (after Week 5 complete)
**Status:** Ready to implement

---

## Appendix: Asset Source URLs

| Resource | URL | License | Notes |
|----------|-----|---------|-------|
| Sea Warfare Set ⭐ | https://opengameart.org/content/sea-warfare-set-ships-and-more | CC0 | PRIMARY |
| Kenney.nl Pirate Pack | https://kenney.nl/assets/pirate-pack | CC0 | UI elements only |
| CraftPix Military Boats | https://craftpix.net/freebies/free-top-down-military-boats-pixel-art/ | Royalty-free | Water tileset |
| PixelLab AI | https://www.pixellab.ai/ | n/a | Backup generator |
| Sprite AI | https://www.sprite-ai.art/ | n/a | Backup generator |
| Kenney.nl Asset Search | https://kenney.nl/assets | CC0 | Icons, UI |
