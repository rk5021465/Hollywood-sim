# NEXA — The Transcendent System
A 2D illustrated anime story RPG and life simulator for Android, built with **Godot 4.3+** and GDScript.

> **Status: foundation build covering all 12 phases. It has not been run yet.**
> The code was written and statically checked (data cross-references, every quest event fired, bracket and indent checks, typed-variable checks). It was **not** opened in Godot, because Godot wasn't available where it was built. The first time you open it, check the Output panel for errors before you do anything else (see "First run" below).

---

## 1. How to open and run it

1. Install **Godot 4.3** or newer (standard version, not .NET): https://godotengine.org/download
2. Unzip this folder anywhere.
3. Open Godot → **Import** → choose `project.godot` → **Import & Edit**.
4. Wait for the first import to finish, then press **F5** (Run Project).
5. The window opens in portrait (720×1280). Mouse clicks act as touches.

### First run checklist
- Open **Output** at the bottom of the editor. Red lines are script errors. Send me any error text and I'll fix it.
- Lines like `[Assets] missing image, using fallback: peter_happy` are expected until you add artwork.

---

## 2. Android export (APK)

No APK is included. You build it yourself:

1. Godot → **Editor → Manage Export Templates** → Download.
2. Install **Android Studio** (or the Android SDK command-line tools) plus **OpenJDK 17**.
3. Godot → **Editor Settings → Export → Android**: set the Java SDK path and Android SDK path.
4. **Project → Export → Add… → Android**.
   - Under **Resources → Filters to export non-resource files**, enter: `*.json`
   - Screen orientation is already portrait (Project Settings).
5. Click **Export Project** → save `nexa.apk` → copy it to your phone and install it. You'll need to allow "install unknown apps".

Godot's Android export guide: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html

---

## 3. Adding your Meta AI artwork

Open **ASSET_LIST.md**. It lists every image ID with its exact path, for example:

```
assets/characters/peter/peter_happy.png
assets/characters/john/john_angry.png
assets/backgrounds/school/school_classroom.png
assets/cards/mythical/ultra_instinct_card.png
```

- Name the file exactly as the ID and drop it in. No code changes are needed.
- If an expression is missing, the game uses that character's `_normal` image. If that's missing too, it uses the built-in drawn portrait. Missing images never crash the game.
- To use a different file name or path, add it to `data/asset_registry.json`:
  `"assets": { "peter_happy": "res://assets/my_art/peter_smile.png" }`
- Adult Peter (after the time skip) uses `peter_adult_<expression>.png` when present.

Music goes in `assets/music/<id>.ogg` and sound effects in `assets/sound/<id>.ogg`. The IDs are listed in ASSET_LIST.md. Missing sounds play synthesized tones.

---

## 4. Project structure

```
project.godot            settings, autoloads, portrait mode
scenes/main.tscn         single root scene (screens are built in code)
scripts/main.gd          screen navigation, Android back button, toasts, card reveal queue
scripts/autoload/        global managers (always loaded)
  events.gd              signal bus — systems talk through events
  settings.gd            user://settings.cfg
  data.gd                loads every JSON in data/
  assets.gd              asset registry + fallback lookup
  audio_manager.gd       music/SFX/UI/voice buses, synthesized fallback tones
  game.gd                stats, EXP, coins, time/date/age, relationships, reputation, inventory, phone data
  quest_manager.gd       dynamic quests (daily, special, emergency, main, side, situational)
  card_manager.gd        cards, levels, upgrades, evolution, combinations, loadout
  story_manager.gd       story progression and scene gating
  save_manager.gd        versioned saves, autosave, 5 slots, .bak backups, migration
scripts/components/      reusable views: UI kit, PortraitView, BackgroundView, CardArt
scripts/ui/              screens: menu, creator, story, hub, system, phone, combat, competition,
                         shop, housing, job, galleries, settings, saves, map, credits, card reveal
data/                    ALL editable content (JSON)
  story/chapter_XX.json  the story, scene by scene
  characters/            characters, crews, enemies, shadows
  cards/ quests/ items/ shops/ locations/ jobs/ dialogue/ news/ progression/ calendar/
assets/                  your artwork, music, sound, fonts (folders already created)
docs/                    your original master prompts
```

### How the story engine works
Each scene in `data/story/chapter_XX.json` has `bg`, `music`, `lines` and `next`. A scene can also have `requires`, which holds it back until a condition is met (a quest done, a flag set, a day reached). Each line is one of:
- dialogue: `{"s": "john", "e": "happy", "t": "Text…"}` (`think: true` for thoughts, `s: "narrator"` / `"system"`)
- choice: `{"choice": [{"t": "Option", "goto": "label", "rel": {...}, "flags": [...]}]}`
- command: `{"cmd": "bg|show|hide|system|combat|competition|quest|card|reward|flag|rel|news|message|timeskip|…"}`
- conditional: any line can have `"if": {"rel_gt": ["john", "friendship", 70]}` or `{"card": "ultra_instinct"}` or `{"quest_done": "…"}`

---

## 5. What's built (all 12 phases)

| Phase | Built in this version |
|---|---|
| 1 | Main menu (particles, all 9 buttons), settings (all options), character creator with live layered preview, save/load (autosave + 5 slots + backups + versioned migration), Peter's data |
| 2 | Story engine from JSON: backgrounds, portraits with 7 expressions, typewriter text, tap to continue, auto-read, skip, history log, choices, conditional lines, transitions (fade, black, white flash, zoom/blur, portal, chapter cards, time skip), System pop-ups |
| 3 | Holographic System: Status (stat allocation, rank, reputation, Stat Inspection of others), quests (main/special/emergency/daily/side with objectives, difficulty, time limits, rewards, failure penalties), context-aware daily generation, situational quests, System History |
| 4 | 31 cards across 8 rarities (Common → Beyond Transcendent), a different reveal animation per rarity, levels, card EXP, skill-point upgrades, evolution, 3 combinations, 4-slot skill loadout |
| 5 | Smartphone: Messages (NPC texts + replies + invites), Contacts (relationship bars), Calls (scripted call scenes), PulseNet social (posts, likes, comments, followers), Daily News driven by events, Maps, Banking (savings + interest + history), Calendar (birthdays, events, appointments, deadlines), Jobs, Gallery, Settings, Alerts |
| 6 | Relationships (friendship, trust, respect, familiarity, rivalry) and NPC memory; dialogue changes with story, relationship, reputation and cards; character, card and scene galleries with replay |
| 7 | Nexa Coins economy, 10 shops, 5 part-time jobs with interactive tasks, school classes as quizzes (Intelligence matters), pets (needs, happiness, bond, care), housing (6 properties, rooms, furniture, comfort, moving), vehicles and garage, costumes and equipment with stats |
| 8 | Prologue, school, John and Bruce, agility trial, jungle picnic, cave and statues, hospital, System awakening, first quest |
| 9 | Four crews (members, colours, symbols, territories, hidden secrets), Protect John, the Inter-Class Trial and Ultra Instinct, the mall emergency and Mana Drain, the four crews' attack, goodbye messages, teleport |
| 10 | Planet Oa, Green Lantern training, the White Lantern ring and its interface (ring level, mastery, energy, 8 auras, missions), six multiverse worlds, each with a mentor, training and a trial |
| 11 | 10-year time skip (age and date update correctly), return to Nexa, the reunion with Mother ("jungle" story), John's reunion, the phone call to Professor Hale to register, the Grand Power Competition, the Bruce rematch |
| 12 | Shadow Army (ARISE extraction after victories, ranks, levels, training, equipment, 3-slot formation, summon animation, used in combat), 21 achievements, 13 titles, Android back button, autosave on pause/close, offline-only |

**Combat:** turn-based. Attack, defend, card skills with energy and cooldowns, stun, heal, reflect, drain, evade, multi-hit, pierce, summon shadows, potions, flee. Allies can join. Results depend on real stats. Story battles Peter is meant to lose, he loses.

**Competitions:** 3 rounds, each with a strategy choice (all-out, steady, intelligence, card). Your stats are scored against rival scores, so Peter does not win automatically.

---

## 6. Not built yet (planned)

- **Final Zero arc** (Part 36): the story pauses on a "To be continued" scene after the Grand Competition. Next: the father's imprisonment revealed, Peter's own crew, multiverse allies, the confrontation with Zero, rescuing his father.
- **Peter's own crew** and the crews' secrets being revealed (the secrets are in the data, but no scenes use them yet).
- **Languages other than English** (the setting exists, but only English text has been written).
- **Online features** (cloud saves, leaderboards). The game is fully offline by design.
- **Real artwork and music.** The game uses drawn fallbacks until you add your files.
- **Character image layers** for the creator. The creator uses the drawn layered portrait; your Peter images replace it in-game.

---

## 7. How to test each phase quickly

1. **Phase 1:** New Game → change options in the creator → Begin. Press Menu → Save to slot 1 → return to the Main Menu → Continue.
2. **Phase 2:** In the prologue, try Auto, Skip and Log. Make choices at breakfast.
3. **Phase 3:** After the hospital scene, open System → Status (allocate points) and Quests. Sleep, and three daily quests appear.
4. **Phase 4:** Complete "Rise Again" to watch two card reveals. Upgrade a card in System → Cards.
5. **Phase 5:** Open Phone. Read Mother's messages, reply to John, post on PulseNet, check News and Calendar.
6. **Phase 6:** Talk to people at school (Map → School District). Watch the bars in Phone → Contacts.
7. **Phase 7:** Downtown → Delivery Hub → do a job. Mall → shops. Pet Shop → adopt. Map → Commercial → Realty.
8. **Phases 8–11:** Follow the gold "Continue Story" button. The hint under it always tells you what's needed.
9. **Phase 12:** After ARISE, win a fight against an enemy marked as extractable → press "ARISE — extract shadow" → System → Shadow Army.

Development shortcut: in Godot, edit `scripts/autoload/game.gd → default_state()`, for example `"coins": 999999`, to test shops faster. Change it back afterwards.

---

## 8. Notes
- This is a personal fan project. Peter Parker, Green Lantern, Ultra Instinct, ARISE and the Shadow Monarch belong to their owners. Before publishing anywhere public (for example Google Play), replace them with original names and art.
- Saves are kept on the device in `user://` (on Android, the app's private storage).
