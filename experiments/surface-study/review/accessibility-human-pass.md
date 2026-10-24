# Screen-reader pass / G6 accessibility follow-up

Automated axe, browser keyboard and native accessibility-tree checks are separate from a real screen-reader pass. No completed VoiceOver pass is recorded yet.

Use macOS VoiceOver in the actual browser. Start with Command+F5; if the tutorial opens, complete or dismiss it yourself. Restore your prior VoiceOver setting after testing. Test each supplied local surface, report browser/OS and any missing/wrong announcement or trapped focus.

1. Commerce `/experiments/surface-study/commerce/`: navigate finishes. Fired clay announces selected radio; Chalk announces unavailable/disabled and its return explanation. Set quantity 2, open Add to bag; hear Bag review name/description, navigate item facts/total and close. Background must stay outside dialog navigation; close returns to Add to bag.
2. Operations `/experiments/surface-study/operations/`: Task status announces combobox and current value; choose All open tasks. Select one eligible row; aggregate selection announces mixed. Locked R-120 stays disabled. Assign selected; exact result count announces. Search/inspector must retain useful labels.
3. Culture `/experiments/surface-study/culture/`: date choices announce date/day/availability; arrows reach sold-out Saturday and return Friday. Choose Student ticket class; acknowledgement announces checkbox. Review reservation announces name/description, session facts/total, and closes back to Review reservation.
4. Transfer `/experiments/surface-study/transfer/`: choose West team and Manual assignment; turn notifications off. Review preferences contains these values. Cancel retains draft; Apply locally announces local success. No messages sent.
5. Repeat dialog open/close with system reduced motion enabled if available. Check reading order at browser zoom 200%. Do not use a production purchase, booking, worker or message action.

Result to record: PASS/FAIL per surface; browser/OS/screen-reader version, actual announcements, keyboard/focus observations, screenshots or exact failing step. A checklist read-through or generic approval is not completion evidence.
