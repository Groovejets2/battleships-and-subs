# Battleships & Subs - Game Rules

## Game Overview

**Battleships & Subs** is a modern naval warfare strategy game based on the classic Battleship game. Two players (human vs AI) engage in turn-based naval combat, attempting to locate and destroy each other's fleet before their own ships are sunk.

---

## Game Objective

**Primary Objective:** Sink all enemy ships before your fleet is destroyed.

**Victory Condition:** First player to sink all 5 of their opponent's ships wins.

**Defeat Condition:** All 5 of your ships are sunk.

---

## Game Setup

### Fleet Composition

Each player commands a fleet of **5 ships** with different sizes and capabilities:

| Ship Name | Type | Length | Special Abilities | Color Code |
|-----------|------|--------|-------------------|------------|
| **Carrier** | Capital Ship | 5 squares | None (Base unit) | Gray |
| **Nuclear Submarine** | Attack Sub | 3 squares | Dive, Torpedo Strike | Blue |
| **Cruiser** | Surface Ship | 3 squares | Depth Charge | Green |
| **Attack Submarine** | Fast Attack | 2 squares | Torpedo, Silent Running | Magenta |
| **Destroyer** | Surface Ship | 2 squares | None (Base unit) | Yellow |

**Total Fleet Health:** 15 squares (5 + 3 + 3 + 2 + 2)

---

## Placement Phase

### Placement Rules

1. **Grid Size:** Each player has a 10x10 grid (columns A-J, rows 1-10)

2. **Ship Orientation:** Ships can be placed either:
   - **Horizontally** (left to right)
   - **Vertically** (top to bottom)

3. **No Overlapping:** Ships cannot occupy the same grid square

4. **Spacing Rule (Critical):** Ships must maintain **minimum 1-square spacing** from all other ships
   - This includes diagonal adjacency
   - No ship can touch another ship, even at corners
   - Creates tactical "buffer zones" around each vessel

5. **Boundary Rule:** Ships must be placed entirely within the 10x10 grid
   - No part of a ship can extend beyond the grid edges

6. **Placement Order:** Ships are placed in the following sequence:
   1. Carrier (5 squares)
   2. Nuclear Sub (3 squares)
   3. Cruiser (3 squares)
   4. Attack Sub (2 squares)
   5. Destroyer (2 squares)

7. **Re-placement:** During setup, players can:
   - Remove and replace any ship
   - Rotate ships between horizontal/vertical
   - Must follow all placement rules when re-placing

8. **Finalization:** Once all 5 ships are placed and player confirms, placement is locked and battle begins

---

## Combat Phase

### Turn Structure

1. **Player Turn**
   - Select a coordinate on the enemy grid to attack
   - Fire at the selected square
   - Receive feedback (Hit or Miss)
   - If Hit: Continue attacking (bonus turn)
   - If Miss: Turn ends, switches to Enemy

2. **Enemy Turn (AI)**
   - AI selects a coordinate on player's grid
   - AI fires at the selected square
   - Player receives feedback
   - If AI Hits: AI gets bonus turn
   - If AI Misses: Turn returns to player

### Attack Mechanics

**Standard Attack:**
- Click any unattacked square on enemy grid
- System checks if square contains a ship segment
- Result displayed immediately:
  - **HIT** - Square contains ship segment (turns RED)
  - **MISS** - Square is empty water (turns WHITE/GRAY)

**Duplicate Attack Prevention:**
- Cannot attack the same square twice
- Attacked squares are marked and cannot be re-selected
- System provides visual feedback for previously attacked squares

**Ship Damage Tracking:**
- Each ship has segments equal to its length
- Each hit damages one segment
- Ship status updated in real-time (e.g., "Destroyer: 1/2 hits")

**Ship Sinking:**
- Ship sinks when all segments are hit
- Announcement displays: "You sank their [Ship Name]!"
- Sunk ships are clearly marked on grid
- Special ability is lost when ship sinks (if applicable)

---

## Special Abilities (Planned Feature)

### Ability System

Each ship type (except base units) has unique tactical abilities:

#### 1. Nuclear Submarine Abilities

**Dive (Defensive)**
- **Effect:** Submarine submerges, becoming undetectable for 1 turn
- **Duration:** 1 turn
- **Cooldown:** 3 turns
- **Usage:** Activated during enemy turn
- **Limitations:** Cannot attack while diving

**Torpedo Strike (Offensive)**
- **Effect:** Fires long-range torpedo in a straight line (3 squares)
- **Pattern:** Linear attack (horizontal or vertical)
- **Range:** 3 squares in chosen direction
- **Cooldown:** 2 turns
- **Damage:** Hits first ship encountered in path

#### 2. Cruiser Abilities

**Depth Charge (Area Attack)**
- **Effect:** Area-of-effect attack on a 3x3 grid
- **Pattern:**
  ```
  X X X
  X O X
  X X X
  ```
  (O = center square, X = affected squares)
- **Cooldown:** 4 turns
- **Usage:** Select center square, all 9 squares attacked
- **Damage:** Standard damage to all ships in area

#### 3. Attack Submarine Abilities

**Torpedo (Offensive)**
- **Effect:** Fires torpedo in straight line (2 squares)
- **Pattern:** Linear attack
- **Range:** 2 squares in chosen direction
- **Cooldown:** 2 turns
- **Damage:** Hits first ship encountered

**Silent Running (Stealth)**
- **Effect:** Next attack does not reveal your position
- **Duration:** 1 turn
- **Cooldown:** 3 turns
- **Benefit:** AI cannot learn your ship locations from counterattack pattern

#### 4. Carrier & Destroyer

**No Special Abilities**
- These are base combat units
- Standard attack only
- Balanced for fleet composition

### Ability Rules

1. **Cooldown System:** Abilities cannot be used every turn
   - Must wait specified turns before reuse
   - Cooldown starts after ability activation

2. **One Ability Per Turn:** Can only use one special ability per turn
   - Cannot stack multiple abilities
   - Regular attack OR ability use (not both, with exceptions)

3. **Lost on Sinking:** When ship sinks, abilities are lost permanently

4. **Strategic Resource:** Abilities must be used tactically
   - Wasting abilities on empty water has consequences
   - Timing is critical for maximum effect

---

## Game Progression

### Score System

**Points Awarded:**
- **Hit (Non-sinking):** +10 points
- **Ship Sunk:**
  - Carrier: +100 points
  - Nuclear Sub: +75 points
  - Cruiser: +75 points
  - Attack Sub: +50 points
  - Destroyer: +50 points
- **Accuracy Bonus:** +(accuracy percentage × 50)
  - Example: 60% accuracy = +30 points
- **Turn Efficiency Bonus:** +(faster wins = more points)
  - Under 30 turns: +200 points
  - 30-50 turns: +100 points
  - 50-70 turns: +50 points
  - Over 70 turns: +0 points

**Final Score Calculation:**
```
Total Score = Hit Points + Sunk Ship Points + Accuracy Bonus + Efficiency Bonus
```

### Accuracy Calculation

```
Accuracy = (Total Hits / Total Shots) × 100%
```

### Turn Tracking

- **Turn Counter:** Tracks total number of attacks made
- **Hit/Miss Ratio:** Displayed in real-time
- **Ships Remaining:** Shows active ships for both fleets
- **Fleet Health:** Displays remaining health percentage

---

## Win/Loss Conditions

### Victory

**Condition:** All 5 enemy ships sunk

**Victory Screen Displays:**
- Final score
- Total turns taken
- Accuracy percentage
- Ships lost (your casualties)
- Time taken (minutes:seconds)
- Rank/Rating based on performance

**Post-Game Options:**
- Add score to High Scores leaderboard
- Play Again (new game)
- Return to Main Menu
- View Statistics

### Defeat

**Condition:** All 5 of your ships sunk

**Defeat Screen Displays:**
- Enemy ships remaining
- Your accuracy statistics
- Total turns survived
- Damage dealt to enemy

**Post-Game Options:**
- Retry
- Return to Main Menu
- View Game Replay (planned)

### Draw (Edge Case)

**Condition:** Both fleets destroyed on same turn (extremely rare)

**Resolution:** Victory goes to player with highest score

---

## AI Behavior (Planned)

### Difficulty Levels

#### Easy Mode
- **Strategy:** Random targeting
- **Hit Follow-up:** 50% chance to search adjacent squares after hit
- **Ability Usage:** Never uses special abilities
- **Prediction:** No pattern learning

#### Normal Mode
- **Strategy:** Checkerboard pattern (efficient search)
- **Hit Follow-up:** Always searches adjacent squares after hit
- **Ability Usage:** Uses abilities randomly when available
- **Prediction:** Learns basic patterns after 10 turns

#### Hard Mode
- **Strategy:** Probability density function targeting
- **Hit Follow-up:** Intelligent direction testing
- **Ability Usage:** Strategic ability timing
- **Prediction:** Analyzes player patterns and adapts
- **Optimization:** Prioritizes high-value targets

#### Expert Mode (Planned)
- **Strategy:** Machine learning-based targeting
- **Hit Follow-up:** Multi-step ahead planning
- **Ability Usage:** Perfect timing with combo chains
- **Prediction:** Predicts player placement patterns
- **Optimization:** Maximizes hit probability every turn

---

## Game Modes

### Standard Mode (Current)
- 1 Player vs AI
- 10x10 grid
- 5-ship fleet
- Standard rules

### Future Planned Modes

#### Campaign Mode
- Series of battles with increasing difficulty
- Story-driven missions
- Unlockable ships and abilities
- Boss battles with special enemy ships

#### Multiplayer Mode
- Hot-seat (same device, turn-based)
- Online multiplayer (networked)
- Real-time combat (no turns)
- Ranked matches with ELO system

#### Custom Mode
- Adjustable grid size (8x8 to 15x15)
- Custom fleet composition
- Rule modifications
- Time limits per turn

#### Survival Mode
- Endless waves of enemy fleets
- Repair between waves
- Increasing difficulty
- Leaderboard for most fleets defeated

---

## UI/UX Rules

### Visual Feedback

**Grid Color Coding:**
- **Green Grid:** Your fleet (Player)
- **Orange Grid:** Enemy waters (Opponent)
- **Red Squares:** Hit ship segment
- **White/Gray Squares:** Miss (empty water)
- **Dark Gray:** Unattacked square
- **Yellow Highlight:** Square under cursor (hover)

**Ship Display:**
- **Placed Ships:** Visible on your grid with ship color
- **Enemy Ships:** Hidden until sunk (then revealed)
- **Sunk Ships:** Displayed with darker color or cross pattern

### Input Methods

**Desktop:**
- Mouse click to select and attack
- Hover for targeting preview
- Keyboard shortcuts (R=rotate, ESC=back, ENTER=confirm)

**Mobile/Tablet:**
- Touch tap to select and attack
- Touch and hold for targeting info
- Gesture support (swipe, pinch)

**Accessibility:**
- High contrast mode option
- Sound cues for hits/misses
- Colorblind-friendly palette option
- Screen reader support

---

## Settings & Customization

### Audio Settings

**Volume Controls:**
- Master Volume (0-100%)
- Sound Effects Volume (0-100%)
- Music Volume (0-100%)
- Individual mute toggles

**Sound Effects:**
- Hit notification (explosion)
- Miss notification (splash)
- Ship sinking (dramatic sound)
- Ability activation sounds
- UI click sounds

**Music:**
- Menu theme (orchestral)
- Battle theme (intense)
- Victory theme (triumphant)
- Defeat theme (somber)

### Visual Settings

**Effects:**
- Particle effects (on/off)
- Animations (on/off)
- Screen shake (on/off)
- Transition effects (on/off)

**Display:**
- Grid size (adjustable zoom)
- Coordinate display (always/on-hover/off)
- Hit markers (style selection)
- Background style (gradient/solid/animated)

---

## High Scores & Statistics

### Leaderboard System

**Data Tracked:**
- Player Name
- Final Score
- Date of Game
- Accuracy Percentage
- Turns Taken
- Ships Lost
- Difficulty Level

**Ranking:**
- Top 10 displayed
- Sorted by score (descending)
- Medals for Top 3 (🥇🥈🥉)

**Storage:**
- Local storage (browser-based)
- Persistent across sessions
- Clear leaderboard option with confirmation

### Personal Statistics (Planned)

**Career Stats:**
- Total Games Played
- Wins/Losses
- Average Accuracy
- Favorite Ship (most hits)
- Total Shots Fired
- Total Hits Landed
- Perfect Games (100% accuracy)
- Fastest Victory (turns)

---

## Strategy Tips (In-Game Help)

### Placement Strategy

1. **Corner Carrier:** Place carrier in corner or edge for protection
2. **Spread Fleet:** Maximize spacing to avoid area attacks
3. **Central Control:** Keep smaller ships near center for flexibility
4. **Unpredictable Patterns:** Avoid symmetrical or obvious placements

### Combat Strategy

1. **Checkerboard Search:** Attack in checkerboard pattern for efficiency
2. **Hit Follow-up:** When you hit, systematically check adjacent squares
3. **Probability Hunting:** Target areas where larger ships can still fit
4. **Ability Timing:** Save special abilities for critical moments
5. **Eliminate Threats:** Prioritize sinking ships with dangerous abilities

### Advanced Tactics

1. **Bait and Switch:** Use small ships to draw out enemy abilities
2. **Area Denial:** Force enemy into corners with systematic searching
3. **Psychological Warfare:** Create fake patterns to mislead AI
4. **Resource Management:** Balance regular attacks with ability usage

---

## Fair Play & Game Integrity

### No Cheating

1. **No Grid Inspection:** Cannot view enemy ship positions until sunk
2. **No Undo Attacks:** Attacks are final once confirmed
3. **No Placement Modifications:** Cannot move ships after battle starts
4. **No Save Scumming:** Cannot reload to change outcomes (when save feature added)

### Game Balance

1. **Equal Fleets:** Both players have identical fleet composition
2. **Turn Order:** Player always goes first (balanced by AI difficulty)
3. **Randomization:** AI does not have perfect information
4. **Ability Cooldowns:** Enforced strictly to prevent spam

---

## Technical Requirements

### Supported Platforms

**Desktop:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile:**
- iOS 14+ (Safari, Chrome)
- Android 10+ (Chrome, Firefox)
- Tablets (iPad, Android tablets)

**Screen Sizes:**
- Minimum: 768x600
- Recommended: 1280x720 or higher
- Responsive design adapts to all sizes

### Performance Requirements

- JavaScript enabled (required)
- HTML5 Canvas support (required)
- LocalStorage enabled (for settings/scores)
- Minimum 2GB RAM recommended
- Stable internet (for future online modes)

---

## Version History & Roadmap

### Current Version: 1.0.0 (In Development)

**Implemented:**
- Grid system and visualization
- Ship placement mechanics
- Placement validation
- Settings persistence
- High scores leaderboard
- Scene management (Title, Game, Settings, High Scores)

**In Progress:**
- AI opponent logic
- Combat system
- Victory/defeat conditions
- Score calculation

**Planned:**
- Special abilities implementation
- Sound effects and music
- Multiple difficulty levels
- Campaign mode
- Multiplayer support

---

## Support & Feedback

**Bug Reports:**
- Submit issues on project repository
- Include browser/device information
- Describe steps to reproduce

**Feature Requests:**
- Community voting on requested features
- Roadmap published on repository

**Updates:**
- Regular version releases
- Patch notes published
- Changelog maintained

---

## Credits & Acknowledgments

**Original Concept:** Milton Bradley's Battleship (1967)

**This Implementation:**
- Built with Phaser 3.90.0 game framework
- Vanilla JavaScript (ES6 modules)
- Modern responsive web design

**Inspiration:**
- Classic Battleship board game
- WWII naval warfare
- Modern submarine warfare tactics

---

## License & Usage

**Game Version:** 1.0.0 (Development)

**Technology:**
- Phaser 3: Licensed under MIT License
- Game assets: [Specify licensing when added]
- Source code: [Specify project license]

---

## Glossary

**Terms:**

- **Grid:** 10x10 playing field with columns (A-J) and rows (1-10)
- **Square/Cell:** Individual position on grid
- **Segment:** One section of a ship
- **Hit:** Successful attack on ship segment
- **Miss:** Attack on empty water
- **Sunk:** Ship with all segments destroyed
- **Fleet:** Collection of all 5 ships
- **Turn:** One player's attack phase
- **Ability:** Special action unique to ship type
- **Cooldown:** Required wait time between ability uses
- **Accuracy:** Percentage of shots that hit ships
- **Buffer Zone:** Empty space around ships (spacing rule)

---

**End of Game Rules**

*This document will be updated as new features are implemented.*

**Last Updated:** 2025-10-27
**Document Version:** 1.0.0
