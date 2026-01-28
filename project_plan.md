# Discover - Project Plan
## Competitive Music Creation Game

---

## 1. Executive Summary

**Project Name:** Discover (working title)  
**Type:** Desktop multiplayer competitive game  
**Goal:** Teach music production through competitive gameplay  
**Target Launch:** MVP in ~3-4 months (part-time development)

---

## 2. Technology Stack

### Core Technologies

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Game Engine** | Godot 4.3+ | Free, open-source, built-in networking, cross-platform |
| **Language** | GDScript (primary) | Fast iteration, Godot-native, Python-like syntax |
| **Alternative Language** | C# | If you prefer static typing (your Java background) |
| **Audio Synthesis** | Godot AudioServer + Custom DSP | Real-time synthesis, your signal processing background helps |
| **Networking** | Godot High-Level Multiplayer (ENet) | P2P support out of the box |
| **Data Storage** | SQLite (local) | User preferences, local saves |
| **UI Framework** | Godot Control nodes | Built-in, themeable, responsive |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **GitHub/GitLab** | Repository hosting, issue tracking, project board |
| **Godot Editor** | Game development IDE |
| **Audacity** | Audio testing/debugging |
| **Figma** | UI/UX mockups |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME CLIENT                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   UI Layer  │  │ Game Logic  │  │    Audio Engine         │  │
│  │             │  │             │  │  ┌─────────────────┐    │  │
│  │ - Menus     │  │ - Rounds    │  │  │   Synthesizer   │    │  │
│  │ - Inventory │  │ - Scoring   │  │  │  - Oscillators  │    │  │
│  │ - Synth UI  │  │ - Timer     │  │  │  - Envelopes    │    │  │
│  │ - Piano Roll│  │ - States    │  │  │  - Filters      │    │  │
│  └─────────────┘  └─────────────┘  │  └─────────────────┘    │  │
│                                     │  ┌─────────────────┐    │  │
│                                     │  │   MIDI Engine   │    │  │
│                                     │  │  - Sequencer    │    │  │
│                                     │  │  - Playback     │    │  │
│                                     │  └─────────────────┘    │  │
│                                     └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      NETWORK LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  P2P Multiplayer (ENet)                                     ││
│  │  - Host creates game (acts as server)                       ││
│  │  - Clients connect via IP/code                              ││
│  │  - Sync: game state, round data, music choices              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Per Round

```
1. INVENTORY PHASE
   [Server] → Broadcasts available items for each player
   [Client] → Player selects items → Sends selection to server
   [Server] → Validates and confirms inventory

2. CREATION PHASE  
   [Client] → Player creates sounds locally (no sync needed)
   [Client] → Player composes MIDI melody locally
   [Client] → Timer countdown synced with server

3. SUBMISSION PHASE
   [Client] → Sends composed track data to server
   [Server] → Stores all player submissions

4. VOTING PHASE
   [Server] → Broadcasts all submissions (audio data)
   [Client] → Player listens and votes
   [Client] → Sends vote to server
   [Server] → Calculates points, broadcasts results

5. NEXT ROUND
   [Server] → Each player receives the track they voted for
   [Repeat from step 1]
```

---

## 4. Project Phases & Milestones

### Phase 0: Setup & Learning (Week 1-2)
**Goal:** Environment setup and Godot fundamentals

| Task | Deliverable | Est. Time |
|------|-------------|-----------|
| Install Godot 4.3+ | Working IDE | 1h |
| Complete Godot basics tutorial | Understanding of nodes, scenes, signals | 8h |
| Complete Godot networking tutorial | Basic multiplayer demo | 6h |
| Explore Godot AudioServer | Simple tone generator | 4h |
| Setup Git repository | Repo with .gitignore, README | 1h |
| Create GitHub project board | Kanban board with issues | 2h |

**Milestone 0:** ✅ Can create a simple multiplayer app where clients connect to a host

---

### Phase 1: Core Synthesizer (Week 3-5)
**Goal:** Build the heart of the game - the synthesizer

#### 1.1 Oscillator Implementation
| Task | Details |
|------|---------|
| Create base Oscillator class | Abstract class for waveform generation |
| Implement Sine wave | `sin(2 * PI * frequency * t)` |
| Implement Saw wave | Linear ramp with reset |
| Implement Square wave | Sign of sine wave |
| Frequency/pitch control | Hz input, MIDI note conversion |
| Real-time audio output | Connect to AudioStreamPlayer |

#### 1.2 Envelope (ADSR)
| Task | Details |
|------|---------|
| Attack phase | Linear/exponential ramp up |
| Decay phase | Ramp to sustain level |
| Sustain phase | Hold at level |
| Release phase | Ramp to zero on note off |
| Envelope → Volume modulation | Apply to oscillator output |

#### 1.3 Synthesizer UI
| Task | Details |
|------|---------|
| Waveform selector | 3 buttons: Sine, Saw, Square |
| Volume knob | Rotary control 0-100% |
| Pitch knob | Semitone adjustment |
| ADSR knobs | 4 rotary controls |
| Virtual keyboard | Clickable piano keys |

**Milestone 1:** ✅ Playable synthesizer with UI, can create and hear sounds

---

### Phase 2: MIDI & Sequencer (Week 6-7)
**Goal:** Allow players to compose melodies

#### 2.1 MIDI Data Structure
```gdscript
class_name MidiNote
var pitch: int      # 0-127 MIDI note number
var start: float    # Start time in beats
var duration: float # Duration in beats
var velocity: int   # 0-127 volume
```

#### 2.2 Piano Roll Editor
| Task | Details |
|------|---------|
| Grid display | Time (x) vs Pitch (y) |
| Note placement | Click to add notes |
| Note editing | Drag to resize, right-click delete |
| Playhead | Visual indicator of playback position |
| Snap to grid | Quantize note positions |

#### 2.3 Sequencer/Playback
| Task | Details |
|------|---------|
| BPM control | Tempo setting |
| Play/Stop/Loop | Transport controls |
| Note triggering | Fire notes at correct times |
| Multi-track support | Layer sounds (for later rounds) |

**Milestone 2:** ✅ Can compose and playback a melody using the synthesizer

---

### Phase 3: Game Logic (Week 8-10)
**Goal:** Implement round-based gameplay

#### 3.1 Game State Machine
```
LOBBY → INVENTORY → CREATING → SUBMITTING → VOTING → RESULTS → [NEXT_ROUND | END]
```

#### 3.2 Inventory System
| Task | Details |
|------|---------|
| Item definitions | Oscillators, envelopes, filters as "items" |
| Random item generation | Pool of available items per round |
| Item selection UI | Card-style selection interface |
| Action economy | 3 actions: reroll or pick |

#### 3.3 Round Management
| Task | Details |
|------|---------|
| 5-minute timer | Countdown with warnings |
| Round counter | Track 1-6 |
| State transitions | Automatic phase progression |
| Music inheritance | Pass chosen music to next round |

#### 3.4 Scoring System
| Task | Details |
|------|---------|
| Vote tracking | Record who voted for whom |
| Point calculation | +1 point when someone chooses your music |
| Leaderboard | Running score display |
| End game results | Final standings screen |

**Milestone 3:** ✅ Can play a full 6-round solo game (against yourself)

---

### Phase 4: Multiplayer (Week 11-13)
**Goal:** Network everything together

#### 4.1 Lobby System
| Task | Details |
|------|---------|
| Host game | Create server, get IP/code |
| Join game | Enter IP/code to connect |
| Player list | Show connected players |
| Ready system | All players ready to start |
| Chat (optional) | Simple text chat |

#### 4.2 Game Synchronization
| Task | Details |
|------|---------|
| State sync | All clients see same game state |
| Timer sync | Synchronized countdown |
| Submission sync | Collect all player creations |
| Vote sync | Distribute votes, calculate results |

#### 4.3 Music Data Transfer
| Task | Details |
|------|---------|
| Serialize synth preset | Convert settings to bytes |
| Serialize MIDI data | Convert notes to bytes |
| Compress data | Minimize network payload |
| Playback on receive | Recreate music from data |

**Milestone 4:** ✅ Can play a full multiplayer game with friends

---

### Phase 5: Polish & MVP Release (Week 14-16)
**Goal:** Make it feel like a real game

#### 5.1 User Experience
| Task | Details |
|------|---------|
| Main menu | Play, Settings, Quit |
| Settings | Volume, graphics, keybinds |
| Tutorial | First-time player guidance |
| Tooltips | Explain synth parameters |

#### 5.2 Visual Polish
| Task | Details |
|------|---------|
| Consistent UI theme | Colors, fonts, spacing |
| Animations | Button hover, transitions |
| Visual feedback | Note triggers, voting |
| Loading screens | Connection, round transitions |

#### 5.3 Audio Polish
| Task | Details |
|------|---------|
| Menu music | Background ambiance |
| Sound effects | UI clicks, round start/end |
| Volume mixing | Balance game audio |

#### 5.4 Testing & Bug Fixes
| Task | Details |
|------|---------|
| Playtesting sessions | Real players, gather feedback |
| Bug fixing | Address critical issues |
| Performance optimization | Smooth gameplay |
| Edge cases | Handle disconnects, errors |

**Milestone 5:** ✅ MVP ready for friends & early adopters

---

## 5. Folder Structure

```
discover/
├── project.godot              # Godot project file
├── .gitignore
├── README.md
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── sounds/               # UI sounds, music
│   └── themes/               # UI themes
│
├── src/
│   ├── main.gd               # Entry point
│   ├── autoload/             # Singletons (always loaded)
│   │   ├── game_manager.gd   # Global game state
│   │   ├── audio_manager.gd  # Audio system
│   │   └── network_manager.gd# Multiplayer handling
│   │
│   ├── audio/
│   │   ├── synthesizer/
│   │   │   ├── oscillator.gd
│   │   │   ├── envelope.gd
│   │   │   ├── filter.gd
│   │   │   └── synth_engine.gd
│   │   └── sequencer/
│   │       ├── midi_note.gd
│   │       ├── track.gd
│   │       └── sequencer.gd
│   │
│   ├── game/
│   │   ├── round_manager.gd
│   │   ├── inventory.gd
│   │   ├── item.gd
│   │   ├── scoring.gd
│   │   └── game_state.gd
│   │
│   ├── network/
│   │   ├── lobby.gd
│   │   ├── sync_manager.gd
│   │   └── serialization.gd
│   │
│   └── utils/
│       ├── constants.gd
│       └── helpers.gd
│
├── scenes/
│   ├── main_menu.tscn
│   ├── lobby.tscn
│   ├── game.tscn
│   ├── results.tscn
│   │
│   ├── ui/
│   │   ├── synthesizer_panel.tscn
│   │   ├── piano_roll.tscn
│   │   ├── inventory_panel.tscn
│   │   ├── player_list.tscn
│   │   └── knob.tscn
│   │
│   └── components/
│       ├── note_block.tscn
│       ├── item_card.tscn
│       └── player_entry.tscn
│
├── tests/                    # Unit tests (optional but recommended)
│   ├── test_oscillator.gd
│   ├── test_envelope.gd
│   └── test_sequencer.gd
│
└── docs/
    ├── mvp.md
    ├── project_plan.md
    ├── game_design.md        # Detailed GDD (future)
    └── technical_notes.md    # Implementation notes
```

---

## 6. Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Audio latency issues | High | Medium | Use AudioServer directly, optimize DSP code |
| Network desync | High | Medium | Server-authoritative state, periodic full sync |
| Scope creep | Medium | High | Strict MVP focus, defer "could have" features |
| Godot learning curve | Medium | Low | Follow tutorials, active Discord community |
| P2P NAT traversal | Medium | Medium | Provide direct IP option, consider STUN/TURN later |
| Complex UI | Medium | Medium | Start simple, iterate based on testing |

---

## 7. Development Best Practices

### Code Quality
- [ ] Use clear naming conventions (snake_case for GDScript)
- [ ] Comment complex audio/DSP code
- [ ] Keep functions small and focused
- [ ] Use signals for decoupling components

### Version Control
- [ ] Commit frequently with clear messages
- [ ] Use feature branches
- [ ] Tag milestones (v0.1, v0.2, etc.)
- [ ] Write meaningful PR descriptions

### Testing
- [ ] Test synthesizer components in isolation
- [ ] Playtest each milestone
- [ ] Test network with artificial latency
- [ ] Get external playtesters early

### Documentation
- [ ] Update README with setup instructions
- [ ] Document network protocol
- [ ] Keep technical notes for complex solutions

---

## 8. Timeline Summary

```
Week 1-2:   [████████] Phase 0 - Setup & Learning
Week 3-5:   [████████████] Phase 1 - Core Synthesizer
Week 6-7:   [████████] Phase 2 - MIDI & Sequencer  
Week 8-10:  [████████████] Phase 3 - Game Logic
Week 11-13: [████████████] Phase 4 - Multiplayer
Week 14-16: [████████████] Phase 5 - Polish & MVP
```

**Total estimated time: 14-16 weeks (part-time ~15-20h/week)**

---

## 9. Next Steps

1. **Install Godot 4.3+** from https://godotengine.org/
2. **Create GitHub repository** with this structure
3. **Start Phase 0 tutorials:**
   - [Godot Official Docs](https://docs.godotengine.org/)
   - [GDQuest YouTube Channel](https://www.youtube.com/c/gdquest)
   - [Godot Multiplayer Tutorial](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html)
4. **Setup project board** with Phase 1 tasks as issues
5. **Begin with a simple oscillator** that makes sound

---

## 10. Resources

### Godot
- [Official Documentation](https://docs.godotengine.org/)
- [GDScript Basics](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_basics.html)
- [High-Level Multiplayer](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html)

### Audio/DSP
- [Godot AudioServer](https://docs.godotengine.org/en/stable/classes/class_audioserver.html)
- [AudioStreamGenerator](https://docs.godotengine.org/en/stable/classes/class_audiostreamgenerator.html)
- [The Audio Programming Book](https://mitpress.mit.edu/books/audio-programming-book) (reference)

### Game Design
- [Game Design Workshop](https://www.routledge.com/Game-Design-Workshop) (book)
- [Extra Credits YouTube](https://www.youtube.com/extracredits)

---

*Last updated: January 28, 2026*
