# Anti-AI Riddler hardening

## Scope

This is a hardening pass over the existing 54-seed curated bank in `src/services/riddleAiService.ts`. It preserves answer keys, categories, rewards, WoA lore, and the private review-before-posting flow.

## Changes in this pass

- The public riddle now exposes only the first two setup lines.
- The live clue path is exactly four progressive hints; the extra seed lines are no longer appended as a second, overlapping hint sequence.
- All 54 current answers have a dedicated hardened hint path designed to narrow the reasoning gradually without simply repeating the answer.
- The leak guard checks the full normalized answer and distinctive long answer tokens, while excluding common ARK/WoA category terms to avoid rejecting every fair clue.
- Duplicate normalized answer entries are collapsed before selection.
- The council panel labels this curated workflow **Anti-AI Riddler** instead of implying it makes an external AI request.

## Review standard for future additions

Every new riddle should pass all of these checks before approval:

1. **Single answer:** one exact intended answer; any acceptable aliases must be documented privately.
2. **Fair derivation:** every public clue supports the answer; no clue requires guessing what the author had in mind.
3. **Decoy resistance:** the nearest plausible alternatives should fail at least one concrete clue.
4. **No answer leakage:** the answer phrase and distinctive identifying terms must not appear in the public question or hint path.
5. **Progressive hints:** four stages only. Each stage should add a new constraint; do not repeat the same clue in different words.
6. **Factual accuracy:** verify ARK mechanics and WoA-specific claims against the actual server/game version. Do not invent mechanics to make a rhyme work.
7. **No cheap giveaway:** avoid naming the map, creature family, item category, initials, or exact mechanic in the opening unless that information is intentionally part of the challenge.
8. **No false difficulty:** obscurity, contradictory wording, and vague metaphors do not count as difficulty. A hard riddle must still have a provable answer.

## Important limitation

No text-only riddle can be guaranteed AI-proof. This code is a curated local selector with static checks, not an external AI service or a reliable detector for whether a player used AI. The practical goal is to make answers less searchable and clues require multiple specific inferences, while keeping the answer fair to a knowledgeable player.

## QA still required

Run `npm test` (which includes the TypeScript build) before merging. Then manually review a sample from every category in Discord to confirm the public embed shows only the setup and the hint button reveals exactly four stages.
