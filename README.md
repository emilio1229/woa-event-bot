# 🔮 Wizards of Ark — Realm & Event Bot

The official Discord bot powering the interactive **Realm of Wizards** and **Council** systems for The Wizards of Ark (WoA).

## ✨ What It Does

- 🔮 **Realm Panel** — Player hub for Sigils, raffles, bounties, events, rewards, achievements, leaderboard, and profile.
- 🏛️ **Council Panel** — Private admin controls for managing community systems.
- 💎 **Sigils** — Balances, daily rewards, transaction history, and redemptions.
- 🎟️ **Raffles / Giveaways** — Active giveaways with role-based eligibility.
- 👑 **Role-Restricted Giveaways** — A raffle assigned to a role is visible only to members with that role, and only eligible members can enter or redeem Sigils for it.
- 📜 **Weekly Bounties** — Four-dino hunts with individually selected or randomized target stats using the fixed **40–50** range.
- 🏆 **Events** — Events with title, time, description, optional notes, posting channel, optional notification role, and RSVP tracking.
- 🕐 **Admin Timezones** — Council members save their timezone once; event and raffle times are interpreted using that timezone and displayed with Discord timestamps.
- 🧹 **Admin Cleanup** — Removes bot-authored Discord messages without deleting database records.

## 🎟️ Raffles

WoA normally uses two giveaway types:

1. **Server Member Giveaway** — Available to the general server membership.
2. **Supporter Giveaway** — Restricted to the selected supporter role.

Role restriction is enforced in two places:

- The restricted raffle is **hidden from users who do not have the required role**.
- Users without the required role **cannot enter or redeem Sigils for that raffle**.

This is an eligibility system, not a gambling system.

## 📜 Weekly Bounties

Council members can create a weekly hunt by:

1. Choosing the posting channel.
2. Selecting the notification role.
3. Entering exactly four dinos.
4. Adding an optional bonus.
5. Choosing each target stat or using **Randomize All & Post**.

Each selected bounty stat uses the fixed **40–50** target range.

## 🏆 Events

Council members can create events with:

- Title
- Date/time
- Description
- Optional notes
- Posting channel
- Optional notification role

Admins save their timezone in Council Configuration, so a timezone does not need to be entered every time.

Public event posts include RSVP controls, while the Realm shows upcoming gatherings and RSVP information.

## 🔮 Realm

Players open the Realm to access:

- 💎 Sigils
- 🎟️ Raffles
- 📜 Bounties
- 🏆 Events
- 🎁 Rewards
- 🏅 Achievements
- 📊 Leaderboard
- 👤 Profile

The goal is simple: **open the panel, choose a path, and let the system handle the rest.**

## 🏛️ Council

Authorized Council members use the private Council panel to manage:

- Raffles
- Bounties
- Events
- Sigil administration
- Configuration
- Admin timezone
- Bot-authored message cleanup

Posting destinations can be selected directly inside the Council workflow.

## 🧭 Design Principles

- **Simple for players.**
- **Powerful for Council.**
- **Role restrictions are enforced, not cosmetic.**
- **Discord timestamps stay viewer-friendly.**
- **No gambling mechanics.**
- **Database records are never removed by message cleanup.**
- **WoA's arcane theme stays present without making the interface complicated.**

## 🚀 Development

```bash
npm install
npm run build
npm start
```

For local development:

```bash
npm run dev
```

Database sync:

```bash
npm run db:push
```

Deploy slash commands:

```bash
npm run deploy
```

## 🔐 Environment

Configure the required Discord and PostgreSQL environment variables in the deployment environment.

Never commit secrets, bot tokens, database credentials, or private keys to the repository.

---

**The Wizards of Ark**  
*Wizards, Warlocks & Witches — welcome to the Realm.* 🔮