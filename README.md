# Fire Verse: Cyberpunk Neon Shootout

Fire Verse is a high-fidelity, cyberpunk-themed 2D multiplayer and single-player shootout game built entirely with client-side web technologies. It features dynamic physics, procedurally synthesized sound effects, adaptive bot AI levels, and a sleek neon glassmorphic UI.

👉 **Live Demo**: [https://suwalkaanmol.github.io/fire-verse/](https://suwalkaanmol.github.io/fire-verse/)

---

## 🎮 Game Controls

| Action | Player (Left / ME) | Player 2 (Right / BOT or PVP) | Mobile / Touch |
| :--- | :--- | :--- | :--- |
| **Movement** | Hover / Glide to **Mouse Cursor** | **System AI** (Bot) or **Arrow Keys** (PvP) | **Touch & Drag** to steer player |
| **Shoot SCAR-H** | **Left Click** (Hold for rapid fire) | **Auto-Fire** (Bot) or **Enter** / **L** (PvP) | **Hold Touch** on screen to auto-fire |
| **Reload** | Key **`R`** (30 rounds magazine) | **Auto-Reload** (Bot) or Key **`P`** / **`/`** (PvP) | Automatic on empty clip |
| **Menu Controls**| Press **`Enter`** to start/restart. Press **`Escape`** to return to menu. | Tap buttons on screen |

---

## 🚀 Key Features

1. **Strategic Medium-Range Combat (SCAR-H)**:
   - Bullets have an effective range of **550px**. Lasers traveling beyond this distance automatically dissolve into fading sparks.
   - Spacing is key: players must step forward to attack and step back into safe zones to reload.
2. **Dynamic Bot Difficulty Levels**:
   - **Level 1 (Easy)**: The bot drifts in a slow sine wave pattern independent of your position, keeping a safe distance and firing infrequently.
   - **Level 2 (Medium)**: The bot tracks your vertical position with an oscillating offset to simulate human strafing and shoots at a steady rate.
   - **Level 3 (Hard)**: The bot moves quickly, strafes tightly, and **actively scans for incoming player laser bullets to dodge them vertically** on a 1.2-second cooldown with a 70% success rate.
3. **Procedural Web Audio Synthesizer**:
   - All sound effects (laser blasts, metallic magazine locks, hitmarker double-beeps, empty clip clicks, and victory fanfare) are synthesized in real-time using browser oscillator nodes. No external audio assets are downloaded!
4. **Interactive HUD Panels & Visuals**:
   - Glowing neon health bars with delayed red "glitch" damage-trailing indicators.
   - Responsive canvas screen-shake rumble on taking damage.
   - Floating damage indicators showing HP loss (e.g. `-15 HP`).
   - Dynamic HUD labels that change between `ME` & `BOT` in single-player or `PLAYER 1` & `PLAYER 2` in Local PvP.

---

## 🛠️ Technical Stack

- **Graphics & Rendering**: HTML5 Canvas 2D Context (High-performance rendering loop, particle systems, floating vectors)
- **Programming Language**: Vanilla ES6+ JavaScript
- **Styling**: Modern Vanilla CSS3 (Custom keyframe animations, glassmorphism, responsive viewport margins, neon drop-shadow filters)
- **Audio**: Web Audio API (Low-latency synthesizer nodes, BiquadFilters, WaveShaper distortion curves)
