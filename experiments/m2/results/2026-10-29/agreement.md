# Labeller agreement, 2026-10-29

Human: blind `labels.json` (Khallil), and the same with `adjudicated.json` laid over it after the non-blind recheck. Each model labeller saw the same 50 blind screens, screenshots, outline, questions and hints, and no rule output. A pair with an unsure or missing answer on either side is unpaired. Kappa is n/a when both labellers gave one answer throughout.

## codex gpt-6.1-sol medium

| rule | both yes | human only | model only | both no | unpaired | agreement | κ blind | κ after recheck |
|---|---|---|---|---|---|---|---|---|
| INT-1 | 0 | 0 | 4 | 46 | 0 | 46/50 (92%) | 0.00 | 0.85 |
| INT-2 | 0 | 1 | 11 | 37 | 1 | 37/49 (76%) | -0.04 | -0.04 |
| INT-3 | 1 | 0 | 6 | 43 | 0 | 44/50 (88%) | 0.22 | 0.56 |
| INT-4 | 0 | 1 | 4 | 45 | 0 | 45/50 (90%) | -0.03 | 0.54 |
| INT-5 | 0 | 2 | 0 | 48 | 0 | 48/50 (96%) | 0.00 | 0.00 |
| DES-1 | 2 | 2 | 7 | 39 | 0 | 41/50 (82%) | 0.22 | 0.22 |
| DES-2 | 4 | 6 | 11 | 29 | 0 | 33/50 (66%) | 0.11 | 0.60 |
| ARR-1 | 0 | 1 | 11 | 38 | 0 | 38/50 (76%) | -0.04 | 0.75 |
| ARR-2 | 8 | 7 | 17 | 18 | 0 | 26/50 (52%) | 0.04 | 0.04 |
| ARR-3 | 6 | 10 | 7 | 27 | 0 | 33/50 (66%) | 0.18 | 0.18 |
| ARR-4 | 10 | 11 | 13 | 15 | 1 | 25/49 (51%) | 0.01 | 0.01 |
| DATA-1 | 2 | 4 | 0 | 44 | 0 | 46/50 (92%) | 0.47 | 0.47 |
| DATA-2 | 5 | 0 | 33 | 8 | 4 | 13/46 (28%) | 0.05 | 0.05 |

Yes answers by the model that generated the screen; a labeller from the same family as a generator may mark that generator's screens more kindly.

| generator | screens | human yes (blind) | model yes |
|---|---|---|---|
| claude-sonnet-5-5 | 25 | 52 | 100 |
| gpt-6-1-sol | 25 | 32 | 67 |
