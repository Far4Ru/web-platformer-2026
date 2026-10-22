# Game sound effects

The eight WAV files in this directory come from [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds), released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The original OGG files were decoded to PCM WAV without changing their timing.

| Game file | Original Kenney file |
| --- | --- |
| `jump.wav` | `maximize_004.ogg` |
| `coin.wav` | `pluck_002.ogg` |
| `hurt.wav` | `error_004.ogg` |
| `sword.wav` | `scratch_003.ogg` |
| `enemy.wav` | `drop_002.ogg` |
| `chest.wav` | `open_003.ogg` |
| `card.wav` | `select_003.ogg` |
| `win.wav` | `confirmation_004.ogg` |

## Mixkit additions

The files below were downloaded from [Mixkit Free Sound Effects](https://mixkit.co/free-sound-effects/) under the [Mixkit Sound Effects Free License](https://mixkit.co/license/#sfxFree). The license permits use and modification in commercial and non-commercial video games without attribution. They were trimmed, converted to 16-bit PCM and peak-normalized with `scripts/process-audio.mjs` for consistent in-game playback.

| Game file | Mixkit title | Mixkit ID |
| --- | --- | ---: |
| `portal-open.wav` | Magic sparkle whoosh | 2350 |
| `portal-enter.wav` | Fairy teleport | 868 |
| `stage-complete.wav` | Completion of a level | 2063 |
| `lose.wav` | Player losing or failing | 2042 |
| `boost-speed.wav` | Digital sweep effect | 2631 |
| `boost-damage.wav` | Electricity static power up | 2600 |
| `boost-heal.wav` | Video game health recharge | 2837 |
| `heal-skill.wav` | Heal soft water spell | 878 |
| `fireball-cast.wav` | Fireball spell | 1347 |
| `fireball-hit.wav` | Explosion spell | 1685 |
| `ice-cast.wav` | Icicles spell whoosh | 881 |
| `ice-hit.wav` | Thin icicles spell | 882 |
| `bow-shot.wav` | Arrow shot through air | 2771 |
| `arrow-hit.wav` | Wood hard hit | 2182 |
| `sword-hit.wav` | Metallic sword strike | 2160 |
| `enemy-cast.wav` | Spellcaster fairy swoosh | 1463 |
| `boss-cast.wav` | Ominous drums | 227 |
| `spikes-trigger.wav` | Gear metallic lock sound | 2858 |
| `companion-attack.wav` | Quick magic sword slice | 2793 |
| `companion-hurt.wav` | Small hit in a game | 2072 |
| `companion-down.wav` | Magic sparkle poof hit | 3082 |
| `fake-card.wav` | Rewind magic spell | 1085 |
| `hell-card.wav` | Horror bell cartoon transition | 598 |
| `card-reroll.wav` | Thin metal card deck shuffle | 3175 |
| `land.wav` | Light impact on the ground | 2070 |
| `ui-confirm.wav` | Interface device click | 2577 |
