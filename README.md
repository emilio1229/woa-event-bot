# 🔮 Wizards of Ark — Realm & Event Bot

The official Discord bot powering the interactive **Realm of Wizards** and **High Council** systems for The Wizards of Ark (WoA).

## ✨ What It Does

- 🔮 **Realm Panel** — Player hub for Sigils, giveaways, bounties, events, rewards, achievements, leaderboard, and profile.
- 🏛️ **High Council Panel** — Private admin controls for managing WoA community systems.
- 💎 **Sigils** — Balances, daily rewards, transaction history, and redemptions.
- 🎟️ **Giveaways** — Active giveaways with role-based eligibility and entry tracking.
- 👑 **Role-Restricted Giveaways** — A giveaway assigned to a role is visible only to members with that role, and eligibility is enforced when entering or redeeming.
- 📜 **Weekly Bounties** — Four-dino hunts with individually selected or randomized target stats using the fixed **40–50** range.
- 🏆 **Events** — Scheduled community events with title, time, description, optional notes, posting channel, optional notification role, and RSVP tracking.
- 🕐 **Admin Timezones** — Council members save their timezone once; scheduled times are interpreted using that timezone and displayed with Discord timestamps.
- 🧹 **Admin Cleanup** — Removes bot-authored Discord messages without deleting database records.

## 🧭 Panel-First Design

WoA is designed around interactive panels rather than a large collection of commands.

The bot's primary commands are:

- `/realm` — Opens the player Realm.
- `/council` — Opens the High Council panel for authorized administrators.

Most administration is handled through **buttons, select menus, and modals inside the Council panel**.

There are no separate slash commands for routine event or bounty administration.

## 🎟️ Giveaways

WoA normally uses two community giveaway types:

1. **Server Member Giveaway** — Available to eligible members of the general server community.
2. **Supporter Giveaway** — Restricted to the selected supporter role.

Role restriction is enforced rather than being cosmetic:

- Restricted giveaways can be hidden from members who do not have the required role.
- Members without the required role cannot enter or redeem Sigils for that giveaway.
- Active giveaway messages display the current entry count rather than publicly listing every participant.

Existing giveaway entry records are preserved during normal administration and management actions.

## 📜 Weekly Bounties

Council members can create and manage the weekly hunt directly from the Council panel.

### Starting a Bounty

Council members can:

1. Choose the posting channel.
2. Select the notification role.
3. Enter exactly four dinos.
4. Add an optional bonus.
5. Choose each target stat or use **Randomize All & Post**.

Each selected bounty stat uses the fixed **40–50** target range.

### Ending a Bounty

The Council panel provides an **End Bounty** control. Council members select the specific active bounty they want to conclude rather than ending multiple bounties at once.

## 🏆 Events

Council members can create events with:

- Title
- Date/time
- Description
- Optional notes
- Posting channel
- Optional notification role

Admins save their timezone in Council Configuration, so a timezone does not need to be entered every time.

### Event RSVP

Public event posts include a **Going** RSVP button. RSVP information is tracked with the event record and displayed in the event post and Realm.

### Ending an Event

The Council panel provides an **End Event** control that opens a selector containing the active events. Council members choose the specific event they want to conclude.

When an event is ended:

- The event is marked as ended in storage.
- Existing RSVPs are preserved.
- The public event post is updated to show that the event has ended.
- RSVP controls are removed from the ended post.
- Further RSVP attempts are blocked.

## 🔮 Realm

Players open the Realm to access:

- 💎 Sigils
- 🎟️ Giveaways
- 📜 Bounties
- 🏆 Events
- 🎁 Rewards
- 🏅 Achievements
- 📊 Leaderboard
- 👤 Profile

The goal is simple: **open the panel, choose a path, and let the system handle the rest.**

## 🏛️ High Council

Authorized Council members use the private Council panel to manage:

- Giveaways
- Bounties
- Events
- Sigil administration
- Configuration
- Admin timezone
- Bot-authored message cleanup

### Standardized Management Flow

Events and Bounties follow the same management pattern:

**Start → View active items → End → Select the specific item → Confirm completion**

This keeps administration consistent and prevents accidental bulk-ending of active community activities.

Posting destinations can be selected directly inside the Council workflow.

## 🧹 Cleanup

The Council cleanup system can remove bot-authored Discord messages while leaving the underlying database records intact.

Cleanup is intended for Discord message housekeeping, not data deletion.

## 🧭 Design Principles

- **Simple for players.**
- **Powerful for Council.**
- **Panel-first administration.**
- **Role restrictions are enforced, not cosmetic.**
- **Discord timestamps stay viewer-friendly.**
- **Existing records are preserved during routine management.**
- **No gambling mechanics.**
- **Database records are never removed by message cleanup.**
- **WoA's arcane theme stays present without making the interface complicated.**

## 🚀 Development

Install dependencies:

```bash
npm install
```

Build the bot:

```bash
npm run build
```

Start the production build:

```bash
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

Deploy the registered slash commands:

```bash
npm run deploy
```

The bot's normal administrative workflows remain panel-based after command deployment.

## 🔐 Environment

Configure the required Discord and PostgreSQL environment variables in the deployment environment.

Never commit secrets, bot tokens, database credentials, or private keys to the repository.

---

**The Wizards of Ark**  
*Wizards, Warlocks & Witches — welcome to the Realm.* 🔮
