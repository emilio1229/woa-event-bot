# Riddle Vault Expansion & Automation Rules

## Current library snapshot
- 54 curated seeds are defined in `src/services/riddleAiService.ts` on `feature/arcane-riddle-overhaul`.
- Existing code categories: creatures, items, abilities, lore, challenges, and maps.
- The TypeScript array remains the runtime source of truth; these Markdown files are a review/export and draft bank.
- Current rotation checks only a small recent-answer window. It is **not** a permanent no-repeat registry yet.

## Approved direction for expansion
1. Logic, wordplay, and lateral thinking, with unambiguous answer keys
2. Mythology and folklore, clearly labeled as cultural stories where appropriate
3. WoA community lore
4. ARK creatures, items/abilities, maps, artifacts/caves, bosses, and events

Do not add wizard/magic trivia or general real-world knowledge sections.

## Approval workflow
Draft → Review → Approved → Retired. Only approved riddles can enter automatic rotation. Each entry should have a stable ID, category, difficulty, exact answer, accepted alternate answers, progressive hints, reward, factual verification note, and complete posting history.

Admin controls should include schedule, timezone, channel, eligible categories, difficulty, hint timing, rewards, repeat cooldown, and a master enable/disable switch. Track every use by riddle ID, not just answer. If no eligible approved riddles remain, skip posting and notify admins; never silently reuse one to fill a slot. Weight selection for category variety. AI-assisted drafts must remain private until approved.

The Logic/Wordplay file is an idea starter; some entries need answer-key cleanup before approval. Nothing in these Markdown files is wired into live automation automatically.
