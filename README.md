# WoA Event Bot

<p align="center">
  <img src="https://img.shields.io/badge/Discord-Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Bot">
  <img src="https://img.shields.io/badge/TypeScript-First-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status">
</p>

<p align="center">
  <b>The Wizards of Ark • Realm • Council • Sigils • Events • Bounties • Giveaways</b>
</p>

---

## Overview

**WoA Event Bot** is the community-management bot for **The Wizards of Ark** Discord and ARK: Survival Ascended community.

The bot is built around two primary interactive hubs:

- **`/realm` — Player Hub**: the public home for members to view their Sigils, community giveaways, bounties, events, rewards, achievements, leaderboard, and profile.
- **`/council` — Staff Hub**: the staff control center for economy, giveaways, events, bounties, rewards, members, statistics, and configuration.

The goal is simple: keep Discord clean and make the important community systems accessible through panels, buttons, menus, and modals instead of filling the server with dozens of slash commands.

### Core Architecture

```text
Discord
   │
   ▼
Interaction Router
   │
   ├── Realm Panel ──► Player Services
   │
   └── Council Panel ► Staff Services
             │
             ▼
          Services
             │
             ▼
       Repositories / Stores
             │
             ▼
        PostgreSQL

Website ──► Fastify API ──► Services / PostgreSQL
```

**Panels are the UI. Services are the brain. PostgreSQL is the memory.**

---

## Current Command Philosophy

Only the two main hubs are intended to be publicly registered as the primary user experience:

| Command | Audience | Purpose |
| --- | --- | --- |
| `/realm` | Everyone | Player/community hub |
| `/council` | Council / staff | Staff control center |

Older commands and modules remain in the codebase where they are still used by the existing systems. They are treated as internal functionality during the panel migration rather than unnecessarily rewriting working features.

---

# 🔮 Realm — Player Hub

`/realm` opens the player-facing community panel.

### 💎 Sigils

Players can view their current Sigil balance, recent ledger activity, guild economy totals, and daily reward status.

The panel also provides the daily claim flow and transaction history without requiring a separate public command.

### 🎟️ Giveaways

The Realm panel shows the server's active community giveaways and their current entry counts/end times.

WoA normally has two active community giveaway tracks:

- **Server Member**
- **Server Supporter**

The existing giveaway mechanics are preserved; the Realm panel simply provides a cleaner way for players to view them.

### 📜 Bounties

Players can view currently active bounty hunts, including target creatures/stat objectives and available bonus information.

### 🏆 Events

The event panel shows upcoming community events, host information, start times, and RSVP totals.

Players can RSVP through the interactive event controls.

Event times are stored in UTC and rendered with Discord timestamps so Discord can display the appropriate local time to each viewer.

### 🎁 Rewards

The existing Sigil Shop is surfaced through the Realm panel so players can access available rewards without needing a separate command.

### 🏅 Achievements

Players can view their achievement progress and unlocked accomplishments.

### 📊 Leaderboard

The Realm leaderboard displays the guild's leading Sigil holders with Discord display names where available.

### 👤 Profile

The profile panel combines useful player information into one view, including balance, recent activity, achievement progress, and daily reward status.

---

# 🏛️ Council — Staff Control Center

`/council` opens the staff-facing management panel.

Council access is controlled by the configured Council role permissions or administrator permission.

### 💎 Economy

Provides a guild-wide economy overview and staff controls.

**Management controls include:**

- Select a player from Discord
- Award Sigils
- Remove Sigils
- Enter a required ledger reason
- Immediately record the adjustment with the staff member as the actor

This uses the existing Sigil ledger, so staff adjustments remain part of the same transaction history and economy statistics.

### 🎟️ Giveaways

Staff can review active community giveaways and start a new giveaway directly from the Council panel.

**Start Giveaway flow:**

1. Enter the prize
2. Enter the end time/duration
3. Optionally name the giveaway
4. Enter the notification role ID
5. The bot creates the existing giveaway record
6. The announcement/thread and existing giveaway interaction controls are created

The existing giveaway mechanics are preserved rather than creating a second giveaway system.

### 🏆 Events

Staff can review upcoming events and create new events directly from Council.

**Start Event flow:**

1. Enter the event title
2. Enter a natural-language start time
3. Enter an optional timezone
4. Optionally provide a notification role ID
5. The event is persisted
6. The event embed and RSVP controls are posted

### 📜 Bounties

Staff can review active weekly hunts and start a new bounty directly from Council.

**Start Bounty flow:**

1. Enter four dino names separated by commas
2. Enter the notification role ID
3. Optionally enter a bonus bounty
4. The weekly bounty record is persisted
5. The WoA bounty image/embed is posted

The current panel start flow uses the existing bounty store and posting format.

### 🎁 Rewards

Council can access the existing Sigil Shop/reward components and review current economy context.

### 👥 Members

The member panel provides a staff-oriented Discord membership overview, including cached member/bot counts and synchronized Council directory information.

### 📊 Statistics

The statistics panel combines operational numbers such as member count, bot count, Sigil circulation, active giveaways, active bounties, transactions, and upcoming events.

### ⚙️ Configuration

The configuration panel exposes safe runtime configuration useful to Council without displaying secrets.

Examples include configured Council roles, default event timezone, giveaway thread settings, Astral channel, API host/port, and allowed guild count.

Sensitive values such as bot tokens and API keys are never displayed.

---

## Key Features

### Sigil Economy

- Persistent per-guild Sigil balances
- Transaction history
- Daily reward with cooldown
- Player balance and ledger views
- Staff award/remove controls
- Leaderboard support
- Economy statistics
- Achievement progress

### Community Giveaways

- Existing WoA giveaway system preserved
- Active giveaway tracking
- Council start flow
- Giveaway status visibility through Realm and Council
- Automatic/manual ending support from the existing system
- Discord-linked giveaway messages/threads where configured

### Event System

- Council event creation flow
- Event persistence
- UTC-backed event storage
- Discord-local timestamp rendering
- Going / Maybe / No RSVP support
- Upcoming event panel
- RSVP summaries

### Bounty System

- Council bounty start flow
- Persistent active bounty records
- Weekly hunt support
- Four-dino/stat objectives
- Optional bonus information
- Player-facing bounty board
- Staff-facing bounty overview

### Achievements

- Player achievement records
- Progress indicators
- Sigil and activity-based milestones
- Realm profile/achievement views

### PostgreSQL + Prisma

- Discord member synchronization
- Discord role synchronization
- Sigil/economy persistence
- Event persistence
- Giveaway persistence
- API-backed directory reads

### Fastify API

The bot also exposes a Fastify API for the WoA website and other trusted consumers.

Examples include `/health`, `/api/discord/members`, `/api/discord/council`, and `/api/discord/roles`.

API routes are protected by the configured API key.

---

## Project Structure

```text
src/
├── commands/
│   ├── council.ts
│   ├── realm.ts
│   ├── event/
│   └── ...legacy/internal commands
│
├── config/
├── events/
├── interactions/
│   └── buttons/
├── models/
├── panels/
│   ├── realmPanel.ts
│   └── councilPanel.ts
├── repositories/
├── services/
├── storage/
├── ui/
├── utils/
├── deploy-commands.ts
└── index.ts
```

### Important Design Rule

New player/staff functionality should normally be added to the appropriate **Realm or Council panel** and backed by the existing service/store layer rather than creating another public slash command.

---

## Data & Persistence

PostgreSQL is the primary runtime database for the migrated systems. Legacy JSON-backed modules remain where needed for compatibility, but new panel actions should use the existing persistent stores/services.

---

## Deployment

The project is designed to run as a Railway web service because the process also exposes the Fastify API.

### Build

```bash
npm install
npm run build
npm start
```

### Slash Command Deployment

```bash
npm run deploy
```

The deploy script builds the project and registers the configured public slash commands.

### Database

```bash
npm run db:push
```

This applies the Prisma schema to PostgreSQL.

### Railway

Railway provides the `PORT` environment variable automatically. The runtime uses `PORT` first and falls back to `API_PORT` outside Railway.

The repository includes `railway.json`, `Dockerfile`, `Procfile`, and a Fastify `/health` endpoint.

---

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `TOKEN` | Yes | — | Discord bot token |
| `CLIENT_ID` | Yes | — | Discord application client ID |
| `GUILD_IDS` | Deploy | — | Comma-separated guild IDs for command deployment |
| `ALLOWED_GUILD_IDS` | No | — | Guilds the bot is allowed to remain in |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `API_KEY` | Yes for API | — | Secret used by `/api/*` requests |
| `API_HOST` | No | `0.0.0.0` | Fastify bind host |
| `PORT` | No | Railway | HTTP port supplied by Railway |
| `API_PORT` | No | `3000` | Local/default API port |
| `COUNCIL_ROLE_IDS` | No | — | Council role IDs, comma-separated |
| `DEFAULT_EVENT_TIMEZONE` | No | `UTC` | Default event timezone |
| `ASTRAL_CHANNEL_ID` | No | — | Optional Astral channel |
| `RAFFLE_THREADS_ENABLED` | No | `true` | Enables linked giveaway threads |
| `RAFFLE_THREAD_AUTO_ARCHIVE_MINUTES` | No | `1440` | Giveaway thread auto-archive duration |

Never commit real tokens, API keys, database passwords, or other secrets to the repository.

---

## Startup Flow

At startup the application initializes the runtime, connects to PostgreSQL, logs into Discord, reconciles directory data, starts the Fastify API, begins background routines such as giveaway auto-ending, and listens for Discord interactions.

---

## Interaction Flow

```text
Slash Command
     │
     ▼
Interaction Router
     │
     ├── /realm ──────► Realm Panel Router ──► Player Services
     │
     ├── /council ────► Council Panel Router ─► Staff Services
     │                                      ├─► Sigil ledger
     │                                      ├─► Event service
     │                                      ├─► Giveaway store
     │                                      └─► Bounty store
     │
     └── Legacy flows ► Existing handlers
```

This keeps the Discord surface simple while preserving the existing systems underneath.

---

## Permissions

### Realm

Realm features are intended for regular server members and are protected as guild-only interactions where appropriate.

### Council

Council features require a configured Council role or Administrator permission.

### Sensitive Operations

Sigil adjustments and community-management controls are restricted to Council/staff access.

---

## Development

### Requirements

- Node.js 16+ (newer supported Node versions are recommended)
- npm
- Discord application/bot
- PostgreSQL database for the current runtime architecture

### Recommended Workflow

```bash
npm install
npm run build
npm start
```

For development with the repository's configured watcher:

```bash
npm run dev
```

Before pushing changes:

```bash
npm run build
```

A clean TypeScript build should be treated as the first gate before deploying to Railway.

---

## Repository Philosophy

> **Keep the player experience simple while keeping the backend modular.**

**Realm = Players.**

**Council = Staff.**

**Panels = UI.**

**Services = Brain.**

**PostgreSQL = Memory.**

---

## Support

For project issues, open an issue in the repository or contact the maintainer through the WoA community.

---

## License

Unlicensed.
