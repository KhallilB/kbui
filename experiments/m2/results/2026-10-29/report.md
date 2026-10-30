# M2 field test: 2026-10-29

60 screens: 30 prompts × 2 models, each rendered at 390, 768, 1440 px. Rule output only; see precision below before reading these as violations.

## Screens with at least one finding, by rule family

| group | integrity | design | integrity or design | arrangement | data | any rule |
|---|---|---|---|---|---|---|
| all | 20/60 (33.3%) | 18/60 (30.0%) | 32/60 (53.3%) | 28/60 (46.7%) | 49/60 (81.7%) | 59/60 (98.3%) |
| claude-sonnet-5-5 | 12/30 (40.0%) | 8/30 (26.7%) | 15/30 (50.0%) | 19/30 (63.3%) | 23/30 (76.7%) | 30/30 (100.0%) |
| gpt-6-1-sol | 8/30 (26.7%) | 10/30 (33.3%) | 17/30 (56.7%) | 9/30 (30.0%) | 26/30 (86.7%) | 29/30 (96.7%) |
| commerce | 5/20 (25.0%) | 11/20 (55.0%) | 14/20 (70.0%) | 10/20 (50.0%) | 17/20 (85.0%) | 20/20 (100.0%) |
| settings | 15/20 (75.0%) | 7/20 (35.0%) | 18/20 (90.0%) | 6/20 (30.0%) | 13/20 (65.0%) | 19/20 (95.0%) |
| dashboard | 0/20 (0.0%) | 0/20 (0.0%) | 0/20 (0.0%) | 12/20 (60.0%) | 19/20 (95.0%) | 20/20 (100.0%) |

## Screens per rule

| rule | family | title | claude-sonnet-5-5 | gpt-6-1-sol | all |
|---|---|---|---|---|---|
| INT-1 | integrity | Asks for credentials or payment details | 4/30 (13.3%) | 2/30 (6.7%) | 6/60 (10.0%) |
| INT-2 | integrity | Destructive action without confirmation | 7/30 (23.3%) | 5/30 (16.7%) | 12/60 (20.0%) |
| INT-3 | integrity | Urgency, scarcity or social-proof claim | 2/30 (6.7%) | 1/30 (3.3%) | 3/60 (5.0%) |
| INT-4 | integrity | Pre-selected marketing consent | 3/30 (10.0%) | 0/30 (0.0%) | 3/60 (5.0%) |
| INT-5 | integrity | Confirmshaming | 0/30 (0.0%) | 0/30 (0.0%) | 0/60 (0.0%) |
| DES-1 | design | More than one primary action in a region | 1/30 (3.3%) | 1/30 (3.3%) | 2/60 (3.3%) |
| DES-2 | design | Heading levels out of order | 7/30 (23.3%) | 10/30 (33.3%) | 17/60 (28.3%) |
| ARR-1 | arrangement | Nesting deeper than seven levels | 6/30 (20.0%) | 6/30 (20.0%) | 12/60 (20.0%) |
| ARR-2 | arrangement | Content does not fit the width | 13/30 (43.3%) | 2/30 (6.7%) | 15/60 (25.0%) |
| ARR-3 | arrangement | Overlapping content | 7/30 (23.3%) | 3/30 (10.0%) | 10/60 (16.7%) |
| ARR-4 | arrangement | Touch target too small | 0/30 (0.0%) | 0/30 (0.0%) | 0/60 (0.0%) |
| DATA-1 | data | Long list without pagination | 2/30 (6.7%) | 2/30 (6.7%) | 4/60 (6.7%) |
| DATA-2 | data | Data-bound list with no empty state | 23/30 (76.7%) | 26/30 (86.7%) | 49/60 (81.7%) |

## Gate

The gate reads rule output, as fixed before the run. Readings from human labels below are for comparison.

From rule output: integrity 20/60 (33.3%), integrity or design 32/60 (53.3%). Reading: **integrity and safety rules lead; continue to M3**.

Without INT-1: integrity 16/60 (26.7%), integrity or design 29/60 (48.3%). Reading: **integrity and safety rules lead; continue to M3**.

## Speed baseline

Wall time from CLI spawn, so it includes CLI start-up. Medians, with p90 in brackets.

| model | screens | time to first node | time to complete | input tokens | output tokens |
|---|---|---|---|---|---|
| claude-sonnet-5-5 | 30 | 4.6s (17.3s) | 22.9s (43.9s) | 9,665 (9,676) | 3,803 (6,582) |
| gpt-6-1-sol | 30 | not streamed | 51.3s (71.4s) | 28,095 (28,102) | 2,878 (3,483) |

## Spec validity

| model | json-render issues | lossless fixes applied | non-patch lines | page errors | empty specs |
|---|---|---|---|---|---|
| claude-sonnet-5-5 | 0/30 (0.0%) | 0/30 (0.0%) | 0/30 (0.0%) | 0/30 (0.0%) | 0/30 |
| gpt-6-1-sol | 2/30 (6.7%) | 0/30 (0.0%) | 0/30 (0.0%) | 0/30 (0.0%) | 0/30 |

Issue codes by screen: missing_child 2.

## Accessibility scan (axe, WCAG 2.2 A and AA tags)

Reported apart from the rules; `target-size` also feeds ARR-4. Screens with the violation at any width.

| violation | claude-sonnet-5-5 | gpt-6-1-sol | all |
|---|---|---|---|
| aria-input-field-name | 2/30 (6.7%) | 1/30 (3.3%) | 3/60 (5.0%) |
| aria-progressbar-name | 11/30 (36.7%) | 9/30 (30.0%) | 20/60 (33.3%) |
| aria-valid-attr-value | 1/30 (3.3%) | 1/30 (3.3%) | 2/60 (3.3%) |
| button-name | 13/30 (43.3%) | 9/30 (30.0%) | 22/60 (36.7%) |
| color-contrast | 6/30 (20.0%) | 12/30 (40.0%) | 18/60 (30.0%) |
| scrollable-region-focusable | 7/30 (23.3%) | 1/30 (3.3%) | 8/60 (13.3%) |

## Rule precision and recall against human labels

50 screens labelled blind by Khallil. Unsure answers are left out.

| rule | fired and yes | fired and no | missed | precision | recall | |
|---|---|---|---|---|---|---|
| INT-1 | 0 | 5 | 0 | 0/5 = 0.00 | n/a | rewrite before M5 |
| INT-2 | 0 | 9 | 1 | 0/9 = 0.00 | 0/1 = 0.00 | rewrite before M5 |
| INT-3 | 0 | 3 | 1 | 0/3 = 0.00 | 0/1 = 0.00 | rewrite before M5 |
| INT-4 | 0 | 3 | 1 | 0/3 = 0.00 | 0/1 = 0.00 | rewrite before M5 |
| INT-5 | 0 | 0 | 2 | n/a | 0/2 = 0.00 | no firings in the sample: no precision |
| DES-1 | 0 | 1 | 4 | 0/1 = 0.00 | 0/4 = 0.00 | rewrite before M5 |
| DES-2 | 4 | 11 | 6 | 4/15 = 0.27 | 4/10 = 0.40 | rewrite before M5 |
| ARR-1 | 0 | 11 | 1 | 0/11 = 0.00 | 0/1 = 0.00 | rewrite before M5 |
| ARR-2 | 6 | 7 | 9 | 6/13 = 0.46 | 6/15 = 0.40 | rewrite before M5 |
| ARR-3 | 3 | 7 | 13 | 3/10 = 0.30 | 3/16 = 0.19 | rewrite before M5 |
| ARR-4 | 0 | 0 | 22 | n/a | 0/22 = 0.00 | no firings in the sample: no precision |
| DATA-1 | 2 | 0 | 4 | 2/2 = 1.00 | 2/6 = 0.33 |  |
| DATA-2 | 5 | 33 | 0 | 5/38 = 0.13 | 5/5 = 1.00 | rewrite before M5 |

From blind human labels on the sample: integrity 4/50 (8.0%), integrity or design 15/50 (30.0%). The gate's thresholds would read: design rules lead; continue to M3. Not the gate; it reads rule output.

### After recheck

42 blind answers that contradicted a rule whose question the spec answers outright (INT-1, INT-3, INT-4, DES-2, ARR-1) were rechecked with the rule's evidence shown; 24 changed. These numbers are no longer blind.

| rule | fired and yes | fired and no | missed | precision | recall | |
|---|---|---|---|---|---|---|
| INT-1 | 3 | 2 | 0 | 3/5 = 0.60 | 3/3 = 1.00 | rewrite before M5 |
| INT-2 | 0 | 9 | 1 | 0/9 = 0.00 | 0/1 = 0.00 | rewrite before M5 |
| INT-3 | 2 | 1 | 1 | 2/3 = 0.67 | 2/3 = 0.67 | rewrite before M5 |
| INT-4 | 2 | 1 | 1 | 2/3 = 0.67 | 2/3 = 0.67 | rewrite before M5 |
| INT-5 | 0 | 0 | 2 | n/a | 0/2 = 0.00 | no firings in the sample: no precision |
| DES-1 | 0 | 1 | 4 | 0/1 = 0.00 | 0/4 = 0.00 | rewrite before M5 |
| DES-2 | 10 | 5 | 3 | 10/15 = 0.67 | 10/13 = 0.77 | rewrite before M5 |
| ARR-1 | 8 | 3 | 1 | 8/11 = 0.73 | 8/9 = 0.89 |  |
| ARR-2 | 6 | 7 | 9 | 6/13 = 0.46 | 6/15 = 0.40 | rewrite before M5 |
| ARR-3 | 3 | 7 | 13 | 3/10 = 0.30 | 3/16 = 0.19 | rewrite before M5 |
| ARR-4 | 0 | 0 | 22 | n/a | 0/22 = 0.00 | no firings in the sample: no precision |
| DATA-1 | 2 | 0 | 4 | 2/2 = 1.00 | 2/6 = 0.33 |  |
| DATA-2 | 5 | 33 | 0 | 5/38 = 0.13 | 5/5 = 1.00 | rewrite before M5 |

From rechecked human labels on the sample: integrity 9/50 (18.0%), integrity or design 22/50 (44.0%). The gate's thresholds would read: design rules lead; continue to M3. Not the gate; it reads rule output.

