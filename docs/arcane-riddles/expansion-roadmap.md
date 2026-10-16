# Riddle Vault Expansion & Automation Rules

## Current library snapshot
- 54 curated seeds are defined in `src/services/riddleAiService.ts` on `feature/arcane-riddle-overhaul`.
- Existing code categories: creatures, items, abilities, lore, challenges, and maps.
- The TypeScript array remains the runtime source of truth; these Markdown files are a review/export and draft bank.
- Current rotation checks only a small recent-answer window. It is **not** a permanent no-repeat registry yet.

## Proposed new sections
1. Wizarding & magical terminology/history
2. Real-world knowledge: science, geography, nature, language, inventions
3. Logic, wordplay, lateral thinking
4. Mythology & folklore, labeled as cultural stories
5. WoA community lore
6. ARK creatures, items/abilities, maps, artifacts/caves, bosses/events

## Approval workflow
Draft → Review → Approved → Retired. Only approved riddles can enter automatic rotation. Each entry should have a stable ID, category, difficulty, exact answer, accepted alternate answers, progressive hints, reward, factual verification note, and complete posting history.

Admin controls should include schedule, timezone, channel, eligible categories, difficulty, hint timing, rewards, repeat cooldown, and a master enable/disable switch. Track every use by riddle ID, not just answer. If no eligible approved riddles remain, skip posting and notify admins; never silently reuse one to fill a slot. Weight selection for category variety. AI-assisted drafts must remain private until approved.

The Wizard, Real-World, and Logic files are idea starters. Some entries need answer-key cleanup before approval. Nothing in these Markdown files is wired into live automation automatically.
