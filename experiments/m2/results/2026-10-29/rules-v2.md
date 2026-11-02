# Rules v1 and v2, 2026-10-29

v1 is the rule set M2 recorded, and `report.md` still uses it. v2 rewrites INT-2, INT-3, DES-1, DATA-2, fitted to the human labels after recheck. Scores against human labels are therefore in-sample. The Codex labels were not used to write v2. Unsure or missing answers are left out.

## Firings on all 60 screens

| rule | v1 | v2 | change |
|---|---|---|---|
| INT-1 | 6 | 6 | unchanged: labels disagree with themselves: a card form is a problem at checkout and not in billing settings |
| INT-2 | 12 | 0 | rewritten: only irreversible actions: delete, erase, close an account, cancel a subscription or order |
| INT-3 | 3 | 4 | rewritten: adds common deadline and scarcity phrases |
| INT-4 | 3 | 3 | unchanged: the rule matches the spec; the one false alarm is a newsletter switch that starts on |
| INT-5 | 0 | 0 | unchanged: no instances in the sample |
| DES-1 | 2 | 5 | rewritten: counts filled danger and default buttons, ignores buttons in closed dialogs |
| DES-2 | 17 | 17 | unchanged: labels disagree with themselves: the same h1 to h3 skip is marked both ways after recheck |
| ARR-1 | 12 | 12 | unchanged: already at or above 0.7 |
| ARR-2 | 15 | 15 | unchanged: the frozen probes did not record what the labeller saw; needs new measurements |
| ARR-3 | 10 | 10 | unchanged: the frozen probes did not record what the labeller saw; needs new measurements |
| ARR-4 | 22 | 22 | unchanged: rewritten in the previous change |
| DATA-1 | 4 | 4 | unchanged: already at or above 0.7 |
| DATA-2 | 49 | 11 | rewritten: only lists the UI adds to or removes from, which can become empty |

## Against human blind

| rule | v1 precision | v2 precision | v1 recall | v2 recall |
|---|---|---|---|---|
| INT-1 | 0/5 = 0.00 | 0/5 = 0.00 | n/a | n/a |
| INT-2 | 0/9 = 0.00 | n/a | 0/1 = 0.00 | 0/1 = 0.00 |
| INT-3 | 0/3 = 0.00 | 1/4 = 0.25 | 0/1 = 0.00 | 1/1 = 1.00 |
| INT-4 | 0/3 = 0.00 | 0/3 = 0.00 | 0/1 = 0.00 | 0/1 = 0.00 |
| INT-5 | n/a | n/a | 0/2 = 0.00 | 0/2 = 0.00 |
| DES-1 | 0/1 = 0.00 | 0/4 = 0.00 | 0/4 = 0.00 | 0/4 = 0.00 |
| DES-2 | 4/15 = 0.27 | 4/15 = 0.27 | 4/10 = 0.40 | 4/10 = 0.40 |
| ARR-1 | 0/11 = 0.00 | 0/11 = 0.00 | 0/1 = 0.00 | 0/1 = 0.00 |
| ARR-2 | 6/13 = 0.46 | 6/13 = 0.46 | 6/15 = 0.40 | 6/15 = 0.40 |
| ARR-3 | 3/10 = 0.30 | 3/10 = 0.30 | 3/16 = 0.19 | 3/16 = 0.19 |
| ARR-4 | 9/20 = 0.45 | 9/20 = 0.45 | 9/22 = 0.41 | 9/22 = 0.41 |
| DATA-1 | 2/2 = 1.00 | 2/2 = 1.00 | 2/6 = 0.33 | 2/6 = 0.33 |
| DATA-2 | 5/38 = 0.13 | 1/8 = 0.13 | 5/5 = 1.00 | 1/5 = 0.20 |

## Against human after recheck

| rule | v1 precision | v2 precision | v1 recall | v2 recall |
|---|---|---|---|---|
| INT-1 | 3/5 = 0.60 | 3/5 = 0.60 | 3/3 = 1.00 | 3/3 = 1.00 |
| INT-2 | 0/9 = 0.00 | n/a | 0/1 = 0.00 | 0/1 = 0.00 |
| INT-3 | 2/3 = 0.67 | 3/4 = 0.75 | 2/3 = 0.67 | 3/3 = 1.00 |
| INT-4 | 2/3 = 0.67 | 2/3 = 0.67 | 2/3 = 0.67 | 2/3 = 0.67 |
| INT-5 | n/a | n/a | 0/2 = 0.00 | 0/2 = 0.00 |
| DES-1 | 0/1 = 0.00 | 0/4 = 0.00 | 0/4 = 0.00 | 0/4 = 0.00 |
| DES-2 | 10/15 = 0.67 | 10/15 = 0.67 | 10/13 = 0.77 | 10/13 = 0.77 |
| ARR-1 | 8/11 = 0.73 | 8/11 = 0.73 | 8/9 = 0.89 | 8/9 = 0.89 |
| ARR-2 | 6/13 = 0.46 | 6/13 = 0.46 | 6/15 = 0.40 | 6/15 = 0.40 |
| ARR-3 | 3/10 = 0.30 | 3/10 = 0.30 | 3/16 = 0.19 | 3/16 = 0.19 |
| ARR-4 | 9/20 = 0.45 | 9/20 = 0.45 | 9/22 = 0.41 | 9/22 = 0.41 |
| DATA-1 | 2/2 = 1.00 | 2/2 = 1.00 | 2/6 = 0.33 | 2/6 = 0.33 |
| DATA-2 | 5/38 = 0.13 | 1/8 = 0.13 | 5/5 = 1.00 | 1/5 = 0.20 |

## Against codex gpt-6.1-sol medium

| rule | v1 precision | v2 precision | v1 recall | v2 recall |
|---|---|---|---|---|
| INT-1 | 4/5 = 0.80 | 4/5 = 0.80 | 4/4 = 1.00 | 4/4 = 1.00 |
| INT-2 | 9/10 = 0.90 | n/a | 9/12 = 0.75 | 0/12 = 0.00 |
| INT-3 | 3/3 = 1.00 | 4/4 = 1.00 | 3/7 = 0.43 | 4/7 = 0.57 |
| INT-4 | 3/3 = 1.00 | 3/3 = 1.00 | 3/4 = 0.75 | 3/4 = 0.75 |
| INT-5 | n/a | n/a | n/a | n/a |
| DES-1 | 0/1 = 0.00 | 1/4 = 0.25 | 0/9 = 0.00 | 1/9 = 0.11 |
| DES-2 | 15/15 = 1.00 | 15/15 = 1.00 | 15/15 = 1.00 | 15/15 = 1.00 |
| ARR-1 | 11/11 = 1.00 | 11/11 = 1.00 | 11/11 = 1.00 | 11/11 = 1.00 |
| ARR-2 | 13/13 = 1.00 | 13/13 = 1.00 | 13/25 = 0.52 | 13/25 = 0.52 |
| ARR-3 | 6/10 = 0.60 | 6/10 = 0.60 | 6/13 = 0.46 | 6/13 = 0.46 |
| ARR-4 | 19/19 = 1.00 | 19/19 = 1.00 | 19/23 = 0.83 | 19/23 = 0.83 |
| DATA-1 | 2/2 = 1.00 | 2/2 = 1.00 | 2/2 = 1.00 | 2/2 = 1.00 |
| DATA-2 | 41/42 = 0.98 | 8/9 = 0.89 | 41/42 = 0.98 | 8/42 = 0.19 |
