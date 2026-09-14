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

Older commands and modules remain in the codebase where they are still used by the existing systems. They are being treated as internal functionality during the panel migration rather than unnecessarily rewriting working features.

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

Players can view currently active bounty hunts, including the target creatures/stat objectives and available bonus information.

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

The profile panel combines useful player information into one view, including:

- current Sigil balance
- recent activity
- achievement progress
- daily reward status

---

# 🏛️ Council — Staff Control Center

`/council` opens the staff-facing management panel.

Council access is controlled by the configured council role permissions.

### 💎 Economy

Provides a quick guild-wide economy overview, including:

- total Sigils
- active users
- active giveaways
- active bounties
- upcoming events

### 🎟️ Giveaways

Staff can review the currently active community giveaways and their status from one place while preserving the existing giveaway system.

### 🏆 Events

Staff can review upcoming events, hosts, RSVP totals, and refresh event information.

### 📜 Bounties

Staff can review active bounty hunts and their current configuration.

### 🎁 Rewards

Council can access the existing Sigil Shop/reward components and review the current economy context.

### 👥 Members

The member panel provides a staff-oriented Discord membership overview, including member/bot counts and synchronized directory information where available.

### 📊 Statistics

The statistics panel combines useful operational numbers such as:

- guild member count
- bot count
- Sigil economy totals
- active giveaways
- active bounties
- upcoming events

### ⚙️ Configuration

The configuration panel exposes safe runtime configuration useful to Council without displaying secrets.

Examples include:

- configured Council roles
- default event timezone
- giveaway thread settings
- giveaway thread auto-archive duration
- Astral channel configuration
- API host/port
- allowed guild configuration

Sensitive values such as bot tokens and API keys are never displayed.

---

## Key Features

### Sigil Economy

- Persistent per-guild Sigil balances
- Transaction history
- Daily reward with cooldown
- Player balance and ledger views
- Staff economy statistics
- Leaderboard support
- Achievement progress

### Community Giveaways

- Existing WoA giveaway system preserved
- Active giveaway tracking
- Giveaway status visibility through Realm and Council
- Automatic/manual ending support from the existing system
- Discord-linked giveaway messages/threads where configured

### Event System

- Event creation and persistence
- UTC-backed event storage
- Discord-local timestamp rendering
- Going / Maybe / No RSVP support
- Upcoming event panel
- RSVP summaries

### Bounty System

- Persistent active bounty records
- Weekly hunt support
- Dino/stat objectives
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

Examples include:

- `/health`
- `/api/discord/members`
- `/api/discord/council`
- `/api/discord/roles`

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

New player/staff functionality should normally be added to the appropriate **Realm or Council panel** and backed by a service, rather than creating another public slash command.

---

## Data & Persistence

### PostgreSQL

PostgreSQL is the primary runtime database for the migrated systems.

The database is used for synchronized Discord data and application state including economy and event-related information.

### Legacy JSON

Some legacy JSON-backed modules remain in the repository for compatibility and migration support. A fresh Railway deployment can use PostgreSQL as the primary runtime store without requiring the old JSON state.

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

The deploy script builds the project and registers the configured slash commands.

### Database

```bash
npm run db:push
```

This applies the Prisma schema to PostgreSQL.

### Railway

Railway provides the `PORT` environment variable automatically. The runtime uses `PORT` first and falls back to `API_PORT` outside Railway.

The repository includes:

- `railway.json`
- `Dockerfile`
- `Procfile`
- Fastify `/health` endpoint

For a fresh PostgreSQL deployment, the old `data/` directory does not need a Railway volume.

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

### Example

```env
TOKEN=your_discord_bot_token
CLIENT_ID=123456789012345678
GUILD_IDS=123456789012345678
ALLOWED_GUILD_IDS=123456789012345678
DATABASE_URL=postgresql://...
API_KEY=your_api_key
API_HOST=0.0.0.0
API_PORT=3000
COUNCIL_ROLE_IDS=123456789012345678
DEFAULT_EVENT_TIMEZONE=UTC
ASTRAL_CHANNEL_ID=
RAFFLE_THREADS_ENABLED=true
RAFFLE_THREAD_AUTO_ARCHIVE_MINUTES=1440
```

Never commit real tokens, API keys, database passwords, or other secrets to the repository.

---

## Startup Flow

At startup the application is designed to:

1. initialize the application/runtime
2. connect to PostgreSQL
3. apply/verify the Prisma schema as configured
4. log into Discord
5. wait for the Discord client to become ready
6. reconcile Discord directory data with PostgreSQL
7. start the Fastify API
8. begin background routines such as giveaway auto-ending
9. listen for Discord interactions

---

## Interaction Flow

Discord interactions pass through a central router.

```text
Slash Command
     │
     ▼
Interaction Router
     │
     ├── /realm ──────► Realm Panel Router
     │                      └── Services
     │
     ├── /council ────► Council Panel Router
     │                      └── Services
     │
     ├── Event RSVP ──► Event Service
     │
     └── Legacy flows ► Existing handlers
```

This allows the user experience to stay simple while the underlying systems remain modular.

---

## Permissions

### Realm

Realm features are intended for regular server members and are protected as guild-only interactions where appropriate.

### Council

Council features require the configured Council/staff permissions.

### Sensitive Operations

Administrative economy and management actions should remain restricted to trusted staff roles/permissions.

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

## Troubleshooting

### `/realm` or `/council` does not appear

Run the command deployment step and verify:

- `CLIENT_ID` is correct
- `GUILD_IDS` contains the intended server IDs
- the bot was invited with the `applications.commands` scope

### Council panel denies access

Check that the user has one of the configured `COUNCIL_ROLE_IDS` or the required staff permission used by the panel.

### Events are showing the wrong time

Events are stored in UTC and displayed using Discord timestamps. Check the source event timezone and `DEFAULT_EVENT_TIMEZONE` rather than manually changing stored UTC values.

### Giveaways are not appearing in the panel

Verify that the existing giveaway record is active and belongs to the current guild. The Realm/Council panels read the existing giveaway store rather than creating a second giveaway system.

### PostgreSQL connection fails

Check `DATABASE_URL` and confirm the Railway PostgreSQL service is reachable.

### API health check fails

Confirm that the service is binding to the Railway-provided `PORT` and that the `/health` endpoint is available.

---

## Repository Philosophy

WoA Event Bot is being developed around a simple principle:

> **Keep the player experience simple while keeping the backend modular.**

The public Discord surface should feel like one cohesive WoA system rather than a collection of unrelated commands.

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
