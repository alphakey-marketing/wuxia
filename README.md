# Rebirth of Jianghu — Game Design Document v1.0

**Project Title:** Rebirth of Jianghu (重生江湖)  
**Genre:** Single-player Run-based Roguelite RPG  
**Platform:** Web-first (Phaser + React), mobile-responsive  
**Target Session Length:** 15–25 minutes per run  
**Document Version:** 1.0 — April 2026  
**Status:** Pre-production / MVP planning  

---

## Executive Summary

Rebirth of Jianghu is a single-player roguelite RPG in which each playthrough represents one martial life. The player ventures through a procedurally ordered jianghu, learns weapon schools, inner arts, and movement techniques, faces rivals and faction trials, then dies or ascends — passing forward a narrow but meaningful inheritance into the next generation. The game's core emotional loop is: *this life builds the next*. A single run lasts 15–25 minutes; meta-progression through the Sect Archive and the Inheritance system creates long-term retention without requiring open-world scale content.

**Design pillars:**
- Every death is meaningful — inheritance makes failure feel like investment
- Wuxia build identity — players name their own style through weapon + inner art + movement combinations
- Short runs, long mastery — sessions are compact; mastery accumulates across lifetimes
- Choices echo — karma and reputation from past lives shape future encounter pools

---

## 1. Core Gameplay Loop

### 1.1 Macro Loop (Across Runs)

```
Start New Life
  ↓
Choose Lineage Trait + Starting Weapon Style
  ↓
Node Map — 10 nodes across 3 phases
  ↓
Combat / Event / Elite / Boss
  ↓
Reward Draft After Each Node (Technique / Relic / Qi Breakthrough / Healing / Karma Shift)
  ↓
Defeat Final Boss  OR  Die
  ↓
Legacy Screen → Choose Inheritance (1 Manual, 1 Trait, all Currency)
  ↓
Sect Archive — Spend Legacy Essence on Permanent Unlocks
  ↓
Start Next Life (stronger meta foundation)
```

### 1.2 Micro Loop (Per Node)

```
Enter Node
  ↓
Combat (auto-attack + 2 active skills + dash + ultimate)
  ↓
Enemy defeated → floating rewards: EXP burst, silver drop, relic page, technique shard
  ↓
Node cleared → 3-choice reward draft
  ↓
Choose path on map (fork every 3 nodes)
  ↓
Repeat
```

### 1.3 Three-Layer Motivation

| Layer | Horizon | Player Question |
|---|---|---|
| Immediate | This fight | "Can I survive and hit this synergy?" |
| Mid-run | This life | "Can I complete a 3-piece combo before the boss?" |
| Meta | Next life | "What will I inherit and unlock tonight?" |

All three must be present and visible at all times. The HUD should show mid-run build status; the Legacy Screen should excite the player before they close the app.

---

## 2. Combat System

### 2.1 Design Philosophy

Combat should feel wuxia — fast, read-heavy, movement-expressive — without requiring complex real-time execution that exceeds web/mobile capability. The system uses auto-basic-attack, two active skills, one mobility action (dash / qinggong), and one ultimate burst. Enemy telegraphing via color-coded indicators creates timing engagement without needing frame-perfect parry windows.

### 2.2 Player Actions

| Action | Input | Cooldown | Notes |
|---|---|---|---|
| Basic Attack | Auto (range-based) | None | Varies by weapon style |
| Skill 1 | Button tap | 4–8s | Weapon-specific |
| Skill 2 | Button tap | 6–12s | Inner art-specific |
| Dash / Qinggong | Button tap | 2–4s | Movement art-specific |
| Ultimate (Burst) | Button hold (full qi meter) | Per meter fill | 1 per node, very powerful |
| Pause-Reward | Auto-pause on node clear | N/A | Player picks reward at own pace |

### 2.3 Enemy Attack Indicators

| Indicator Color | Meaning | Counter |
|---|---|---|
| Yellow glow | Normal attack | Dodge away or tank |
| Orange glow | Breakable — can interrupt | Skill interrupt window |
| Red glow | Unblockable — dodge only | Dash required |
| Purple glow | Stance-break attack | Can be countered for bonus damage |

### 2.4 Damage Formula

**Base damage per hit:**

```
Damage = (Weapon Attack × Technique Multiplier) + Inner Art Bonus − Enemy Defense
```

**Crit formula:**

```
Crit Damage = Base Damage × (1.5 + Crit Power Bonus)
Crit Chance = Base 8% + Meridian Bonuses + Relic Bonuses
```

**Stance Break bonus (enemy only):**

```
Stance Break Hit = Base Damage × 1.8 (guaranteed crit, ignores defense)
```

### 2.5 Player Stats at Run Start

| Stat | Base Value | Scales With |
|---|---|---|
| HP | 120 | Level, relics, lineage |
| Attack | 10 | Weapon style, techniques, relics |
| Defense | 4 | Inner art, techniques, relics |
| Speed | 5 | Movement art, relics |
| Crit Chance | 8% | Meridian upgrades, relics |
| Crit Power | 1.5× | Relics, breakthroughs |
| Qi Meter | 100 | Fills on hit and damage taken |

---

## 3. Run Structure

### 3.1 Node Map

A run consists of 10 nodes across 3 phases, with 2 fork choices at key junctions. The map is freshly seeded each run, but node types follow weighted distributions to guarantee rhythm.

```
Phase 1: Early Journey (Nodes 1–3)
  Node 1: Combat (tutorial enemy)
  Node 2: Event OR Healer (weighted 50/50)
  Node 3: Combat (slightly harder) → FORK: Event path OR Black Market path

Phase 2: Mid Jianghu (Nodes 4–7)
  Node 4: Combat (elite enemy)
  Node 5: Wandering Master OR Sect Trial (weighted 60/40)
  Node 6: Combat (elite enemy)
  Node 7: FORK: Hidden Cave (relic reward) OR Ambush (fight for bonus currency)

Phase 3: Late Crisis (Nodes 8–10)
  Node 8: Major Event (karma-heavy choice)
  Node 9: Pre-boss recovery: Healer available, or second manual page
  Node 10: BOSS — determines life outcome
```

### 3.2 Node Type Definitions

| Node Type | Frequency | Player Outcome |
|---|---|---|
| Combat | 40% | Silver, techniques, relic page, karma |
| Elite Combat | 15% | Guaranteed rare relic or manual chapter |
| Event | 20% | Karma shift, faction change, bonus/risk |
| Healer | 8% | Restore HP (50–80%), at silver cost |
| Wandering Master | 7% | Teach a rare technique for free or at karma cost |
| Black Market | 5% | Buy relics or techniques with silver |
| Sect Trial | 5% | Faction challenge — pass for sect bonus, fail for penalty |

### 3.3 Reward Draft

After clearing a combat or event node, the player is shown 3 reward options. They choose 1.

**Reward category weightings (typical mid-run):**

| Reward Type | Weight | Description |
|---|---|---|
| Technique Upgrade | 30% | Improve or evolve current technique |
| New Technique | 25% | Add a new active or passive technique |
| Relic | 20% | Equip a new relic (max 4 at once) |
| Qi Breakthrough | 15% | Stat upgrade (HP, Attack, Crit) |
| Healing | 10% | Restore HP without visiting healer |

The draft system should always offer one choice from each major axis (combat power, build expression, survivability) to avoid forcing dominant paths.

---

## 4. Progression Systems

### 4.1 In-Run Progression (Resets Per Run)

| System | Max Per Run | Notes |
|---|---|---|
| Techniques | 6 slots | Overflow replaces weakest or upgrades existing |
| Relics | 4 slots | Drop from elites and events; overflow at black market |
| Qi Breakthroughs | 3 stages | Each stage adds stat bonus and visual effect |
| Silver | Unlimited | Spent at healers and black markets |
| Stance Points | Fills on hit | Used to trigger manual-specific specials |

**Synergy detection:** When 2+ equipped techniques share a keyword (e.g., "Blade", "Frost", "Swift"), display an active synergy bonus visually and show the effect on the HUD.

### 4.2 Inheritance System (Rebirth Core)

At run end (death or victory), the Legacy Screen displays everything the player earned. They may carry forward:

| Slot | What Can Be Inherited | Limit |
|---|---|---|
| Manual | 1 technique chapter (unlocks as starting option next life) | 1 |
| Lineage Trait | 1 passive stat or ability modifier | 1 |
| Reputation Imprint | Faction standing (opens/closes event pools) | 1 |
| Memory Seal | Special event flag from a major choice | 0–1 (conditional) |
| Legacy Essence | All earned currency for Sect Archive | All |

**Inheritance unlock hierarchy:** Manuals begin at Chapter I. Only if a player inherits the same manual for 3 consecutive runs does it unlock Chapter II (a significantly stronger version). This creates meaningful repetition motivation without requiring grinding.

**Design constraint:** Players must NOT feel that each death fully resets them. The Legacy Screen must visually affirm progress toward the next life. Every run — even a fast death — must produce at least one inheritable item.

### 4.3 Sect Archive (Meta Progression)

The Sect Archive is the between-run hub. Spend Legacy Essence to unlock new run content and starting options.

#### Tier 1 Unlocks (Early Access — 50–150 Essence each)

| Unlock | Cost | Effect |
|---|---|---|
| Spear Mastery Scroll | 80 | Unlocks Spear as a starting weapon |
| Blood Wolf Canon | 100 | Unlocks Blood Wolf inner art pool |
| Cloud Ladder Movement | 60 | Unlocks Cloud Ladder as starting movement art |
| Event: The Fallen Physician | 50 | Adds moral event to pool |
| Relic: Iron Ring of Patience | 80 | Adds defensive relic to pool |
| Healer's Mark Bloodline | 120 | Starting trait: +30 HP at life start |

#### Tier 2 Unlocks (Mid Progress — 200–400 Essence each)

| Unlock | Cost | Effect |
|---|---|---|
| Drunken Drift Movement | 200 | Unlocks high-risk evasive movement art |
| Frozen Heart Sutra | 250 | Unlocks ice-counter inner art |
| Elite: White Ape Elder | 300 | Adds second boss to pool |
| Sect: Beggar's Union Access | 200 | Opens faction event branch |
| Manual Tier II Conversion | 400 | Allows Chapter I manuals to upgrade to II |
| Challenge Modifier: Hunted | 350 | Start life with bounty; more enemies, double Essence gain |

#### Tier 3 Unlocks (Late/Endgame — 600–1200 Essence each)

| Unlock | Cost | Effect |
|---|---|---|
| Forbidden Demonic Seed | 800 | Unlocks forbidden cultivation path with special finale |
| Five-Style Grandmaster Mode | 1000 | Equip 2 weapon styles simultaneously |
| Ancestral Meridian | 600 | Pass 2 inheritance slots instead of 1 per run |
| Secret Ending: Nameless Ghost | 1200 | Triggers hidden death-ending narrative chain |

### 4.4 Karma & Fate System

The karma system tracks moral identity across **this life** and projects its shadow into the next.

**Five karma axes (range −3 to +3 per axis):**

| Axis | Positive Pole | Negative Pole | Effect on Run |
|---|---|---|---|
| Mercy | +3 Benevolent | −3 Ruthless | Opens healer discounts vs. opens assassination contracts |
| Honor | +3 Righteous | −3 Devious | Sect trials favor you vs. Black market deals open |
| Ambition | +3 Driven | −3 Withdrawn | Harder enemies, higher rewards vs. hidden path access |
| Orthodoxy | +3 Orthodox | −3 Unorthodox | Grandmaster mentors appear vs. Forbidden arts available |
| Renown | +3 Legendary | −3 Infamous | Allies appear in crisis vs. Feared — enemies hesitate |

Karma values shift based on event choices (e.g., spare or kill a captured rival, steal or purchase a manual, join or attack a convoy). At life end, the dominant axis at ±2 or higher stamps a **Fate Imprint**, which modifies the next life's event pool.

---

## 5. Build System

### 5.1 Weapon Styles

| Style | Basic Attack Pattern | Weapon Skill | Best Synergy |
|---|---|---|---|
| **Sword** (劍) | Fast 3-hit combo, close range, high crit chance | Sword Flash — forward dash-strike that counts as 3 hits | Crit-stack, multi-hit relics, Burning Meridian |
| **Spear** (槍) | Long reach, 2-hit sweep, knockback on second hit | Dragon Thrust — unblockable charge that pierces through crowds | AoE techniques, disruption relics, Flowing River Qi |
| **Fists** (拳) | Very fast 5-hit combo, short range, on-hit procs | Iron Fist Chain — 8-hit burst that fills Qi meter rapidly | On-hit effects, lifesteal, Blood Wolf Canon |

### 5.2 Inner Arts

| Inner Art | Passive Engine | Ultimate Behavior | Risk/Reward |
|---|---|---|---|
| **Flowing River Qi** (流水內功) | Each dodge within 2s of an enemy attack restores 8 HP | Tidal Surge — heal 40 HP and slow all enemies for 4s | Low risk, sustain-focused |
| **Burning Meridian** (燃脈功) | Each kill stacks +3% Attack (up to +30%); taking damage loses 1 stack | Inferno Ignition — releases all stacks as an AoE explosion | High reward, fragile stack management |
| **Frozen Heart Sutra** (冰心訣) | Taking a hit triggers a 0.8s freeze bubble on attacker (6s cooldown) | Absolute Zero — freeze all enemies for 3s; next 3 hits do 2.5× damage | Defensive, punish-focused |
| **Blood Wolf Canon** (血狼經) | Every 5th basic attack hits twice and restores 5 HP | Savage Feast — channel 2s; heal 15% max HP per enemy in range | Lifesteal-focused, dangerous vs. ranged |

### 5.3 Movement Arts

| Movement Art | Dash Behavior | Passive Bonus | Identity |
|---|---|---|---|
| **Swallow Step** (燕式輕功) | Double-dash; second dash within 1.5s costs no cooldown | +15% Speed | Aggressive repositioning; best for flanking |
| **Cloud Ladder** (雲梯踏) | Short blink-teleport (ignores terrain) | Immune to damage during dash frames | Safe escape tool; best for glass-cannon builds |
| **Drunken Drift** (醉步) | Wide arc sway-dodge; during dodge, basic attack does +40% damage | +10% Crit Chance | Risky high-damage dance; rewards staying near enemies |

---

## 6. Techniques & Upgrades

### 6.1 Technique Slots

Players hold up to 6 techniques. Techniques are tagged with keywords that activate synergies.

**Keyword list:** `Blade`, `Pierce`, `Strike`, `Frost`, `Fire`, `Swift`, `Shadow`, `Thunder`, `Poison`, `Qi-Surge`, `Counter`, `AoE`

**Synergy examples:**

| Keyword Pair | Bonus Effect |
|---|---|
| 2× Blade | +15% Sword basic attack speed |
| 2× Frost | Slow effect duration +2s |
| 3× Swift | +20% Dash cooldown reduction |
| Blade + Counter | Sword Flash triggers automatic counter after a dodge |
| Fire + Qi-Surge | Burning Meridian stacks gain bonus on Qi ultimate activation |
| 2× Pierce | Spear thrust pierces shields; stance-break chance +20% |

### 6.2 Technique Roster (MVP: 24 Techniques)

#### Sword Techniques

| ID | Name | Tags | Effect | Upgrade I | Upgrade II |
|---|---|---|---|---|---|
| T01 | Seven Stars Slash | Blade, Swift | On crit, deal 30% damage to adjacent enemies | Crit triggers fire spark (+10% burn dmg) | Adjacent hit applies Blade synergy count |
| T02 | Phantom Blade Step | Blade, Shadow | Dash leaves a shadow clone that attacks once | Clone crits on Swallow Step | Clone inherits all Blade synergies |
| T03 | Empty Hand Deflect | Counter | Dodge within 0.5s of red-glow attack deals 2× counter damage | Counter also restores 10 HP | Counter resets Skill 1 cooldown |
| T04 | Heaven-Splitting Form | Blade, Qi-Surge | Ultimate does +50% damage if at full Qi meter | Full-Qi ultimate also freezes enemies 1s | Full-Qi ultimate area doubled |

#### Spear Techniques

| ID | Name | Tags | Effect | Upgrade I | Upgrade II |
|---|---|---|---|---|---|
| T05 | Iron Curtain Stance | Pierce, Counter | Stance: absorb next hit as 0 damage (1 charge) | Absorb also grants +15% Attack for 5s | 2 charges instead of 1 |
| T06 | Storm of Ten Thousand | Pierce, AoE | Dragon Thrust hits enemies behind target too | +1 additional pierce target | All pierce hits apply Pierce synergy once |
| T07 | Viper Coil Strike | Pierce, Poison | Spear basic attacks apply poison (5 dmg/s, 4s) | Poison also reduces enemy Attack by 10% | Poison can stack twice |
| T08 | Mountain-Topple Blow | Pierce, Qi-Surge | First hit of a fight does 3× damage | Bonus activates after each dodge too | Bonus activates after every 10 basic hits |

#### Fist Techniques

| ID | Name | Tags | Effect | Upgrade I | Upgrade II |
|---|---|---|---|---|---|
| T09 | Steel Finger Jab | Strike, Poison | Every 3rd hit applies a weak poison (3 dmg/s) | Poison duration +3s | Poison triggers on every hit if Blood Wolf active |
| T10 | Iron Bell Body | Strike, Counter | Taking damage while standing still grants +20% Defense for 3s | Defense bonus also applies to next attack | Stationary bonus doubled; triggers passive regen |
| T11 | Thunder Fist Chain | Strike, Thunder | Iron Fist Chain's final hit discharges lightning to nearby enemies | Lightning arc to 2 additional targets | Lightning applies a 0.5s stun |
| T12 | Void Palm | Strike, Shadow | Once per fight: teleport behind target; guaranteed crit | Teleport recharges on kill | Teleport recharges on dodge |

#### Inner Art Techniques

| ID | Name | Tags | Effect | Upgrade I | Upgrade II |
|---|---|---|---|---|---|
| T13 | Glacial Will | Frost, Counter | Frozen Heart counter-freeze duration +1s | Freeze bubble applies Frost synergy | Two freeze bubbles before cooldown resets |
| T14 | Boiling Blood Secret | Fire, Qi-Surge | Every 10 hits, next skill does 2× damage | 8 hits instead of 10 | Also applies to ultimate |
| T15 | River Memory | Swift, Shadow | After using an event item, gain +20% Speed for 5s | Effect triggers on healer visits too | +25% Speed; lasts until next combat |
| T16 | Empty Mind Meditation | Counter, Qi-Surge | No-damage runs of 4s restore 20 Qi | 3s trigger instead of 4s | Passive Qi regen even in combat (+2/s) |

#### Rare / Manual Techniques

| ID | Name | Tags | Source | Effect |
|---|---|---|---|---|
| T17 | Nine Dragon Destruction | Blade, Thunder, Qi-Surge | Chapter II manual | Ultimate hits 9 times; each hit triggers lightning |
| T18 | Corpse-Walking Six Paths | Shadow, Poison, Strike | Forbidden cultivation event | Each kill spawns a shadow echo for 8s |
| T19 | Tai Chi Reversal | Counter, Swift, AoE | Wandering Master (Orthodox path) | Absorb any hit and reverse 80% damage back as AoE |
| T20 | Five Poison Scripture | Poison, Fire, AoE | Black market rare | All attacks apply all 4 poison tiers simultaneously |

### 6.3 Relic Roster (MVP: 20 Relics)

| ID | Name | Type | Effect |
|---|---|---|---|
| R01 | Jade Carp Carving | Defensive | Start with +25 HP max |
| R02 | Iron Grip Rings | Offensive | Basic attacks deal +8% damage |
| R03 | Cracked Moon Mirror | Utility | See all node rewards before choosing path |
| R04 | Widow's Tear Pendant | Sustain | Restore 3 HP per kill |
| R05 | Black Bone Fan | Offensive | Each dodge within a fight increases next skill damage by 10% (up to +50%) |
| R06 | Vengeful Ribbon | Counter | On taking damage below 30% HP, next attack deals 3× damage |
| R07 | Scholar's Inkbrush | Technique | Technique drafts always include 1 rare/manual technique |
| R08 | Bandit Leader's Ring | Economy | +30% silver from combat |
| R09 | Frostglass Bangle | Frost | Frozen enemies take +25% damage from all sources |
| R10 | Crimson Talisman | Fire | Burning Meridian stacks cap raised to +45% Attack |
| R11 | Empty Hand Bell | Counter | Counter-attacks have +30% crit chance |
| R12 | River Willow Flute | Sustain | At fight start, heal 10% max HP |
| R13 | Bloodstained Manual Page | Manual | Earn +10 Legacy Essence per elite defeated |
| R14 | Stolen Temple Bell | AoE | Ultimate hits also stun nearby enemies for 0.5s |
| R15 | Assassin's Coal Dust | Shadow | Dash leaves a smoke cloud that blinds enemies for 2s |
| R16 | Thunder Bead Necklace | Thunder | Every 5th hit chains lightning to 2 enemies (30% weapon damage) |
| R17 | Mountain Root Staff Ring | Pierce | Spear thrust range +40% |
| R18 | Fox Spirit Charm | Utility | Once per run: avoid lethal damage (survive at 1 HP) |
| R19 | Drunken God's Flask | Utility | After each node: 50% chance to find a free healing item |
| R20 | Heaven and Earth Diagram | Meta | At life end: inherit 1 extra technique as a memory seal |

---

## 7. Enemy Roster (MVP: 12 Enemies + 2 Bosses)

### 7.1 Standard Enemies

| ID | Name | HP | Attack | Behavior | Indicator Pattern | Drop |
|---|---|---|---|---|---|---|
| E01 | Road Bandit | 40 | 8 | Basic melee, no dodge | Yellow only | Silver, minor technique |
| E02 | Crossbow Soldier | 30 | 12 | Ranged slow fire; runs from melee | Yellow + Red (charged shot) | Silver, pierce technique |
| E03 | Tavern Brawler | 60 | 10 | Grapple attempt on 3rd hit; unblockable | Yellow, Yellow, Red | Strike relic shard |
| E04 | Mountain Bandit Chief | 80 | 14 | Buffs self after losing 50% HP | Orange (buff interrupt window) | Rare silver, minor manual page |
| E05 | River Pirate | 50 | 11 | Dash-attack from range; retreats after | Red (dash), Yellow | Swift technique |
| E06 | Corrupt Constable | 70 | 13 | Blocks regularly; stance-break required to damage through guard | Purple (stance-break) | Counter relic shard |

### 7.2 Elite Enemies

| ID | Name | HP | Attack | Special Mechanic | Drop |
|---|---|---|---|---|---|
| E07 | Twin Blade Widow | 130 | 18 | Splits into two after losing 60% HP; each half has 40 HP | Phantom Blade technique; R05 Black Bone Fan |
| E08 | Iron Monk Disciple | 160 | 16 | Phase 1: Block only (stance-break required). Phase 2: Frenzy attacks | Iron Bell Body upgrade; R10 Crimson Talisman |
| E09 | Drunken Swordsman | 120 | 20 | Random dodge pattern; 30% chance to dodge any skill | Drunken Drift movement art; R19 Drunken God's Flask |
| E10 | Ghost Assassin | 110 | 22 | Vanishes for 2s every 30s; attacks from stealth | Void Palm technique; R15 Assassin's Coal Dust |
| E11 | Poison Valley Witch | 140 | 15 | Applies strong poison on each hit; cleanses slow/stun | Five Poison Scripture fragment; R09 Frostglass Bangle |
| E12 | Wandering Iron Fist | 150 | 19 | Every 5th hit is unblockable; immune to knockback | Thunder Fist Chain upgrade; R16 Thunder Bead Necklace |

### 7.3 Boss Roster

#### Boss 1 — Iron Fan Widow (鐵扇寡婦)

| Property | Value |
|---|---|
| **HP** | 350 |
| **Attack** | 22 |
| **Phase Count** | 2 |
| **Phase 1 (100–50% HP)** | Fan tornado AoE (Red, untelegraphed direction); Summon 2 Road Bandits; Stance-break vulnerability on 3rd attack |
| **Phase 2 (50–0% HP)** | Faster attack rate; Fan counter-attack on each player dodge (Orange); Applies Widowmaker Curse: max HP −15 if hit twice |
| **Karma Link** | If Mercy ≥ +2: she reveals she was wronged — spare her for Memory Seal. Kill her for Reputation +2 with Beggar's Union |
| **Drops** | Manual Chapter: Phantom Blade Step; R06 Vengeful Ribbon; 60 Legacy Essence |

#### Boss 2 — White Ape Elder (白猿老人)

| Property | Value |
|---|---|
| **HP** | 450 |
| **Attack** | 26 |
| **Phase Count** | 3 |
| **Phase 1 (100–70%)** | Slow powerful slam (Red); Rock throw (Yellow); Leap AoE (Orange interrupt window) |
| **Phase 2 (70–35%)** | Gains stone armor (+20 Defense); Must break armor with 3 stance-break hits; Also enrages at 50%, doubling attack speed for 5s |
| **Phase 3 (35–0%)** | Drops stone armor; speed massively increased; begins 15s Berserk countdown — must kill within countdown or instant death |
| **Karma Link** | If Orthodoxy ≥ +2: he accepts defeat and offers a secret technique. If Unorthodox: he reveals a forbidden scroll location |
| **Drops** | Manual Chapter: Tai Chi Reversal OR Nine Dragon Destruction (karma-dependent); R20 Heaven and Earth Diagram; 100 Legacy Essence |

---

## 8. Event System

### 8.1 Event Design Rules

- Every event must have exactly 2–3 choices
- At least 1 choice must involve a genuine trade-off (no obvious correct answer)
- Outcomes must visibly shift at least 1 karma axis or 1 resource
- 20% of events reference past-life Memory Seals for narrative continuity

### 8.2 Sample Events (MVP: 12 Events)

#### The Fallen Physician

> A physician lies beaten on the road. Her medicine chest has been ransacked. She asks you to escort her to the next town. A pursuer will intercept you.

| Choice | Outcome |
|---|---|
| Escort her (+1 fight) | Heal 30 HP at town; Mercy +1; opens Wandering Master event variant |
| Give her your silver (−30 silver) | Mercy +1; +5 HP max this run |
| Leave her | −1 Mercy; +10 silver on next combat |

#### The Manual Thief

> You catch a young student who stole a page from your inherited manual.

| Choice | Outcome |
|---|---|
| Take it back by force | Retrieve manual page; Ruthless +1; student becomes enemy in later node |
| Let him keep it | Honor +1; Memory Seal: "The Student You Spared" (future run event trigger) |
| Teach him instead | Lose 5 silver, gain Technique shard; Renown +1 |

#### The Sect Invitation

> The Black Cliff Manor offers you membership — protection, resources, and a powerful relic. But they demand you report all wandering masters you encounter.

| Choice | Outcome |
|---|---|
| Accept | +R01 Jade Carp Carving; Black Cliff reputation +2; Wandering Master events become hostile |
| Decline politely | No change |
| Decline and warn masters | Honor +1; Renown +1; Black Cliff becomes rival faction (ambush chance +1 node) |

#### The Forbidden Cave

> A sealed cave bears a warning: the cultivation method inside drives practitioners to madness. 

| Choice | Outcome |
|---|---|
| Enter (requires Unorthodox ≥ 0) | +T18 Corpse-Walking Six Paths; Orthodoxy −2; HP max −20 |
| Seal it further | Orthodoxy +1; +15 Legacy Essence bonus |
| Mark it for the Archive | Memory Seal: "Location of the Madman's Cave" (+1 forbidden relic next run) |

---

## 9. UI Screens

### 9.1 Screen List

| Screen ID | Name | Trigger |
|---|---|---|
| UI-01 | Title Screen | App open |
| UI-02 | Lineage Select | New life start |
| UI-03 | Node Map | Between nodes |
| UI-04 | Combat HUD | During combat |
| UI-05 | Reward Draft | Node cleared |
| UI-06 | Event Screen | Event node entered |
| UI-07 | Inventory / Build View | Pause during run |
| UI-08 | Legacy Screen | Run ends |
| UI-09 | Sect Archive | Between runs |
| UI-10 | Manual Collection | Sect Archive sub-screen |

### 9.2 Screen Descriptions

#### UI-02 — Lineage Select

Shown at the start of each life. Player picks 1 of 3 presented starting options (derived from Sect Archive unlocks + any inherited traits from prior run).

**Layout:**
- Left panel: 3 lineage cards (weapon style + inner art + movement art combination preview)
- Right panel: Description text, karma tendency note, inherited manual slot preview
- Bottom: "Begin this life" confirm button
- Passive info bar: shows current Sect Archive tier and any active Fate Imprint from last run

#### UI-03 — Node Map

An ink-brush painted road illustrated as a stylized jianghu map. Nodes are illustrated circles (combat = crossed swords, event = ink scroll, healer = herb bundle, boss = red seal). Current position is marked with a glowing character silhouette.

**Layout:**
- Map fills 70% of screen
- Fork paths shown as diverging roads with distinct visual tone
- Bottom strip: current build summary (weapon, inner art, movement art icons, HP bar, silver count)
- Tap a node to see its type tooltip before confirming travel

#### UI-04 — Combat HUD

Minimalist HUD that does not obstruct the play area.

**Layout:**
- Top-left: HP bar (segmented, shows exact HP on hover/tap)
- Top-right: Silver count, Legacy Essence counter (for current run)
- Bottom-left: Karma axis icons (small 5-dot indicators for current life values)
- Bottom-center: Skill 1 button, Skill 2 button (with cooldown radial overlays)
- Bottom-right: Dash button, Ultimate button (with Qi meter fill ring)
- On-screen floating: Damage numbers, crit labels ("CRIT!"), synergy pop-ups ("BLADE SYNC!"), stance break labels ("STANCE BROKEN!")
- Relic icons visible as a small strip above skill buttons

#### UI-05 — Reward Draft

Pause-style overlay that appears after node clear. Game world is blurred behind it.

**Layout:**
- 3 reward cards horizontally arranged
- Each card: icon, name, description, keyword tags (highlighted if they activate a current synergy)
- If a choice activates a new synergy, the card glows and shows "NEW SYNERGY: [Name]" below description
- Hover/tap to expand full description
- "Choose" button below each card

#### UI-08 — Legacy Screen

The emotional climax of each run. Must feel ceremonial, not mechanical.

**Layout:**
- Full-screen dark background with ink painting of mountains and mist
- Character silhouette fades in, dissolving into light upward
- Scroll reveals run summary: enemies defeated, bosses cleared, furthest node, build used, total damage dealt
- Inheritance section: 5 slots appear with earned items
  - Grayed-out slots = not available to inherit
  - Lit slots = available to choose
- Player selects 1 Manual + 1 Trait (other slots auto-carry currency and memory seals)
- Final line of flavour text based on karma dominant axis: e.g., "A righteous swordsman's spirit endures. The next wielder of your sword will know mercy."
- "Begin the Next Life" button

#### UI-09 — Sect Archive

The meta-progression hub. Feels like a martial library or ancestral hall.

**Layout:**
- Background: illustrated pavilion interior with shelves of manuals and weapon racks
- Grid of unlock cards organized in 3 tiers (visually stacked like shelves)
- Top bar: current Legacy Essence balance
- Each unlock card: name, icon, cost, "LOCKED / UNLOCKED" status, hover description
- Bottom right: "New Life" button that takes player to UI-02

### 9.3 Mobile Adaptation

| Screen | Mobile Adjustment |
|---|---|
| UI-03 Node Map | Vertical scroll layout; nodes stacked top to bottom |
| UI-04 Combat HUD | Larger touch targets (minimum 44×44px); skill buttons in thumb zone |
| UI-05 Reward Draft | Cards stacked vertically; scroll to compare |
| UI-08 Legacy Screen | Simplified silhouette animation; scroll to see full summary |

---

## 10. Data Schema

### 10.1 Run State Object

```json
{
  "run_id": "uuid",
  "life_number": 4,
  "seed": 847263,
  "phase": "mid_jianghu",
  "current_node": 5,
  "nodes_completed": [1, 2, 3, 4],
  "player": {
    "hp": 84,
    "max_hp": 120,
    "attack": 18,
    "defense": 6,
    "speed": 7,
    "crit_chance": 0.14,
    "crit_power": 1.8,
    "qi_meter": 45,
    "silver": 130
  },
  "build": {
    "weapon_style": "sword",
    "inner_art": "burning_meridian",
    "movement_art": "swallow_step",
    "techniques": ["T01", "T04", "T09", "T14"],
    "relics": ["R02", "R05", "R10"],
    "active_synergies": ["BLADE+FIRE", "SWIFT_BLADE"]
  },
  "karma": {
    "mercy": 1,
    "honor": -1,
    "ambition": 2,
    "orthodoxy": 0,
    "renown": 1
  },
  "run_flags": {
    "spared_iron_fan_widow": false,
    "entered_forbidden_cave": true,
    "joined_black_cliff": false
  }
}
```

### 10.2 Meta State Object

```json
{
  "player_id": "local",
  "total_lives": 12,
  "legacy_essence": 840,
  "sect_archive_unlocks": ["spear_mastery_scroll", "cloud_ladder", "event_fallen_physician"],
  "inheritance": {
    "manual_slot": "T02",
    "lineage_trait": "swift_meridians",
    "reputation_imprint": "beggar_union_friendly",
    "memory_seal": "spared_the_student",
    "essence_carried": 80
  },
  "fate_imprint": "driven",
  "manual_collection": {
    "T02": { "chapter": 1, "inherited_count": 2 },
    "T19": { "chapter": 1, "inherited_count": 1 }
  },
  "lifetime_stats": {
    "total_enemies_killed": 245,
    "total_bosses_defeated": 7,
    "furthest_node_reached": 10,
    "best_run_damage": 18420
  }
}
```

### 10.3 Technique Data Object

```json
{
  "id": "T01",
  "name": "Seven Stars Slash",
  "name_zh": "七星斬",
  "tags": ["Blade", "Swift"],
  "rarity": "common",
  "description": "On crit, deal 30% damage to adjacent enemies.",
  "upgrades": [
    {
      "level": 1,
      "effect": "Crit triggers fire spark (+10% burn damage)"
    },
    {
      "level": 2,
      "effect": "Adjacent hit applies Blade synergy count"
    }
  ],
  "weapon_affinity": "sword",
  "synergy_keywords": ["Blade", "Swift"],
  "source": "draft_pool"
}
```

### 10.4 Enemy Data Object

```json
{
  "id": "E07",
  "name": "Twin Blade Widow",
  "name_zh": "雙刀寡婦",
  "tier": "elite",
  "hp": 130,
  "attack": 18,
  "defense": 8,
  "speed": 6,
  "behavior_pattern": "split_on_threshold",
  "split_threshold": 0.6,
  "split_hp_each": 40,
  "attack_sequence": ["yellow", "yellow", "orange"],
  "drops": {
    "guaranteed": ["T02"],
    "rare": ["R05"],
    "silver_range": [40, 60]
  },
  "node_phase": "mid_jianghu"
}
```

### 10.5 Event Data Object

```json
{
  "id": "EVT_03",
  "name": "The Sect Invitation",
  "name_zh": "門派邀約",
  "trigger": "standard",
  "memory_seal_required": null,
  "memory_seal_blocks": null,
  "description": "The Black Cliff Manor offers membership — protection, resources, and a powerful relic. But they demand you report all wandering masters you encounter.",
  "choices": [
    {
      "id": "accept",
      "label": "Accept membership",
      "karma_delta": { "honor": 0, "ambition": 1 },
      "rewards": { "relic": "R01" },
      "flags_set": ["black_cliff_member"],
      "event_pool_change": { "remove": ["wandering_master_friendly"], "add": ["wandering_master_hostile"] }
    },
    {
      "id": "decline",
      "label": "Decline politely",
      "karma_delta": {},
      "rewards": {},
      "flags_set": []
    },
    {
      "id": "warn_masters",
      "label": "Decline and warn all masters",
      "karma_delta": { "honor": 1, "renown": 1 },
      "rewards": {},
      "flags_set": ["black_cliff_rival"],
      "node_modifier": { "ambush_chance_increase": 1 }
    }
  ]
}
```

### 10.6 Node Map Generator Rules

```json
{
  "run_seed": "int",
  "phases": [
    {
      "phase": "early",
      "node_count": 3,
      "nodes": [
        { "position": 1, "type": "combat", "enemy_tier": "standard", "forced": true },
        { "position": 2, "type_pool": ["event", "healer"], "weights": [50, 50] },
        { "position": 3, "type": "combat", "enemy_tier": "standard", "fork": true,
          "fork_options": ["event_path", "black_market_path"] }
      ]
    },
    {
      "phase": "mid",
      "node_count": 4,
      "nodes": [
        { "position": 4, "type": "elite", "enemy_tier": "elite" },
        { "position": 5, "type_pool": ["wandering_master", "sect_trial"], "weights": [60, 40] },
        { "position": 6, "type": "elite", "enemy_tier": "elite" },
        { "position": 7, "type": "fork", "fork": true,
          "fork_options": ["hidden_cave", "ambush"] }
      ]
    },
    {
      "phase": "late",
      "node_count": 3,
      "nodes": [
        { "position": 8, "type": "major_event", "karma_weight": true },
        { "position": 9, "type_pool": ["healer", "manual_page"], "weights": [50, 50] },
        { "position": 10, "type": "boss", "boss_pool": ["boss_iron_fan_widow", "boss_white_ape_elder"] }
      ]
    }
  ]
}
```

---

## 11. Inheritance & Rebirth System — Full Flow

### 11.1 Death Resolution Steps

1. Combat ends in player defeat
2. Slow-motion final blow animation plays
3. Fade to black; Legacy Screen begins loading (use run state to populate)
4. Legacy Screen shows character summary + earned items
5. Player selects inheritance (1 manual, 1 trait)
6. Legacy Essence added to meta state
7. Memory Seals auto-added if flags triggered during run
8. Karma fate imprint calculated and stamped
9. Sect Archive screen opens; player may spend essence
10. Player begins a new life (Lineage Select screen)

### 11.2 Manual Inheritance Progression

```
Run ends → Manual X inherited (Chapter I)
  → Manual X becomes available in starting draft for future runs

If Manual X inherited again (Chapter I, second time):
  → "Chapter mastered" notification
  → Manual X gets a passive bonus even at Chapter I level

If Manual X inherited a third consecutive time:
  → Manual X upgrades to Chapter II version
  → Chapter II technique is a significantly more powerful evolution
  → New visual effect for the technique
```

### 11.3 Fate Imprint Table

| Dominant Karma Axis at ≥ +2 | Fate Imprint Name | Next Run Effect |
|---|---|---|
| Mercy +2 | The Compassionate | Healer nodes appear 1 additional time |
| Ruthless −2 | The Blood-Handed | First elite drops double silver |
| Honor +2 | The Righteous | Sect trial difficulty −1; favor bonus |
| Devious −2 | The Schemer | Black Market prices −20% |
| Ambition +2 | The Driven | Boss HP +10%; Boss drops +50% Essence |
| Orthodoxy +2 | The Grandmaster | Wandering Master appears twice per run |
| Unorthodox −2 | The Forbidden | Forbidden art events added to pool |
| Renown +2 | The Legend | Enemy groups sometimes surrender without fighting |
| Infamous −2 | The Feared | Elites occasionally hesitate (1s stun at fight start) |

---

## 12. Economy & Balance

### 12.1 Silver Economy Per Run

| Source | Typical Yield | Notes |
|---|---|---|
| Standard combat | 15–30 silver | Per node |
| Elite combat | 40–60 silver | Per node |
| Event outcome | 0–40 silver | Variable |
| Boss | 80–120 silver | Fixed range |
| Total expected per run | 250–400 silver | Tunable via relic R08 |

**Silver sinks:**
- Healer visit: 30–60 silver
- Black Market relic: 80–150 silver
- Black Market technique: 50–100 silver

### 12.2 Legacy Essence Economy

| Source | Yield |
|---|---|
| Completing a run (any outcome) | 30 Essence |
| Per elite defeated | 10 Essence |
| Boss defeat | 40 Essence |
| Special event outcomes | 10–20 Essence |
| Relic R13 equipped | +10 per elite |
| Typical run (mid-game) | 80–120 Essence |

**Essence sink target:** Tier 1 unlock = 1–2 runs; Tier 2 = 4–6 runs; Tier 3 = 10–14 runs.

### 12.3 Difficulty Tuning Guidelines

| Phase | Enemy HP Multiplier | Enemy Attack Multiplier | Notes |
|---|---|---|---|
| Early (nodes 1–3) | 1.0× | 1.0× | Tutorial baseline |
| Mid (nodes 4–7) | 1.4× | 1.3× | Elites begin here |
| Late (nodes 8–10) | 1.8× | 1.6× | Crisis pressure |
| Boss | 3.0× | 2.0× | Above scaling |

**Soft difficulty scaling with Sect Archive tier:**
- Tier 1 unlocked (3+ items): enemy scaling begins at +5% per phase
- Tier 2+ unlocked (8+ items): scaling +10%; Challenge modifiers become available

---

## 13. Four-Week MVP Roadmap

### Week 1 — Playable Skeleton

**Goal:** One complete run from start to boss is playable.

| Task | Priority | Notes |
|---|---|---|
| Player movement (drag / virtual stick) | P0 | Phaser scene |
| Auto-attack (sword only) | P0 | Range detection, damage calc |
| 2 active skills (T01, T03) | P0 | Cooldown system |
| Dash (Swallow Step only) | P0 | Iframe window |
| 3 standard enemies (E01, E02, E03) | P0 | Basic AI patterns |
| 1 boss (Iron Fan Widow) | P0 | Phase 1 only for week 1 |
| Node map (10 nodes, no fork) | P0 | Static layout first |
| Reward draft (3 choices) | P0 | Text-only, no animation |
| Run state object | P0 | JSON in memory |
| Basic HUD (HP, skills, Qi meter) | P0 | React overlay |

**Definition of done:** Player can fight through 10 nodes and face Iron Fan Widow.

### Week 2 — Progression & Juice

**Goal:** Run-to-run progression exists and feels rewarding.

| Task | Priority | Notes |
|---|---|---|
| Spear and Fist weapon styles | P0 | Full skill sets |
| 3 inner arts (Flowing River, Burning Meridian, Blood Wolf) | P0 | Passive engines + ultimates |
| 10 techniques (T01–T10) | P0 | Draft pool functional |
| 8 relics (R01–R08) | P0 | Equip system |
| Hit effects, damage numbers, crit pop | P0 | Phaser particle emitter |
| Kill animation + item drop effect | P1 | Visual juice |
| Synergy detection and HUD display | P1 | Keyword matching |
| Legacy Essence currency | P0 | Persists across runs |
| Post-run Legacy Screen (basic version) | P0 | Manual + Trait selection |
| Meta state object | P0 | Separate from run state |

**Definition of done:** Run-to-run inheritance exists; hit feedback is satisfying.

### Week 3 — Meta & Identity

**Goal:** Choices in one life visibly affect the next life.

| Task | Priority | Notes |
|---|---|---|
| Sect Archive screen | P0 | 6 Tier 1 unlocks functional |
| Karma system (5 axes, delta on events) | P0 | Track and display |
| 8 events (EVT_01–EVT_08) | P0 | Full choice/outcome trees |
| Fate Imprint calculation and application | P1 | Based on dominant axis |
| Memory Seal flags | P1 | 3 seals from major events |
| Second boss (White Ape Elder Phase 1+2) | P1 | Rotate randomly with boss 1 |
| Fork logic on node map | P1 | 2 fork junctions per run |
| Reputation imprint affecting event pool | P1 | Simple filter on event IDs |
| Lineage Select screen (3 options) | P0 | Pulls from archive unlocks |

**Definition of done:** Past-life choices visibly change next-life encounters.

### Week 4 — Balance & Retention

**Goal:** 10 consecutive test runs remain fun and understandable.

| Task | Priority | Notes |
|---|---|---|
| Full difficulty scaling (phase multipliers) | P0 | See section 12.3 |
| All 3 movement arts functional | P0 | Cloud Ladder, Drunken Drift |
| Frozen Heart Sutra inner art | P0 | Completes inner art set |
| Boss Phase 2 for both bosses | P0 | Complete fight flows |
| Challenge modifier: Hunted | P1 | Increases stakes + Essence |
| Manual Chapter II path (3× inheritance) | P1 | Verify feel of power spike |
| Mobile HUD pass (44px touch targets) | P0 | Phaser/React responsive |
| Economy tuning (silver, essence) | P0 | Target ranges from §12 |
| 3 achievement-style long-term goals | P1 | First boss kill, full archive tier 1, 10 lives |
| Audio: hit sounds, UI transitions, death sting | P1 | Minimal but essential |

**Definition of done:** The question "Was I excited about my next life before I quit?" is answered yes by testers in all 10 sessions.

---

## 14. Non-Goals (MVP Scope Protection)

The following are explicitly out of scope for the MVP to protect delivery:

- Open-world exploration or free movement between regions
- Multiplayer or co-op
- Romance or companion systems
- Complex inventory management or equipment slots
- More than 3 weapon families or 4 inner arts
- Large dialogue trees or voiced narration
- Dozens of factions or political strategy layer
- Animated cutscenes
- Procedural terrain generation

These may be addressed in post-MVP content expansion once core addiction loop is validated.

---

## 15. Success Metrics

| Metric | Target |
|---|---|
| Average runs per session | ≥ 2 |
| Legacy screen "excited for next life" rating (tester survey) | ≥ 80% of sessions |
| Build identity legibility ("describe your build in one sentence") | ≥ 90% of mid-run testers |
| Distinct viable build archetypes (playtester variety) | ≥ 3 identifiable archetypes |
| Early-death still grants progress | 100% of sessions |
| Session "one more run" moment rate | ≥ 1 per session |
| Week 4 fun retention (run 10 still engaging) | ≥ 7/10 avg tester score |

---

*Document maintained by: Rebirth of Jianghu Dev Team*  
*Last updated: April 2026*  
*Next review: Post-Week 1 milestone*
