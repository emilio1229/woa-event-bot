# WoA Event Bot

<p align="center">
  <img src="https://img.shields.io/badge/Discord-Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Bot">
  <img src="https://img.shields.io/badge/TypeScript-First-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status">
</p>

<p align="center">
  <b>Arcane Events • Ritual Raffles • Sigil Economy • Admin Ledger</b>
</p>

---

## Overview

WoA Event Bot is a Discord bot for managing guild events, ritual raffles, sigil rewards, and moderator-led ledger actions.
It now uses a TypeScript-first `src/` → `dist/` architecture for the main runtime and deploy flow while preserving the existing raffle systems where possible.
Discord directory data is synchronized into PostgreSQL and served from a Fastify REST API rather than being queried live from Discord for website reads.

The bot is currently designed around four command groups:

- **Event commands** for Sesh-like scheduling and RSVP flows
- **User commands** for everyday members
- **Admin commands** for staff and moderators
- **Raffle commands** for creating, tracking, and ending rituals/raffles

## Migration Notes

- Main runtime entry is now `src/index.ts`, compiled to `dist/index.js`
- Slash command deployment entry is now `src/deploy-commands.ts`, compiled to `dist/deploy-commands.js`
- The TypeScript migration is now complete: no runtime `.js` source files remain under `src/`
- Legacy raffle, sigil, bounty, and interaction modules now live as typed `.ts` source files and compile into a fully runnable `dist/` output
- Discord member, role, and sync-state data now live in PostgreSQL via Prisma
- Event, raffle, and sigil application data now live in PostgreSQL as the primary runtime store
- Old JSON-backed state can be discarded when starting fresh; no migration step is required for a clean Railway setup
- New event modules live under:
  - `src/config/`
  - `src/commands/event/`
  - `src/events/`
  - `src/interactions/buttons/`
  - `src/services/`
  - `src/storage/`
  - `src/ui/`
  - `src/utils/`
- Event times are stored in UTC and rendered with Discord timestamp tags (`<t:UNIX:F>` and `<t:UNIX:R>`), so every viewer sees the event in their local timezone automatically

## Deployment

- Always run `npm run build` before `npm start`
- `npm start` launches the compiled bot from `dist/index.js`
- `npm run deploy` rebuilds the project and registers slash commands via `dist/deploy-commands.js`
- `npm run db:push` applies the Prisma schema to PostgreSQL
- Runtime now requires `DATABASE_URL` in addition to the Discord token settings
- The Fastify API reads synchronized Discord data from PostgreSQL and defaults to `API_HOST=0.0.0.0` and `API_PORT=3000`
- The repository includes a `Dockerfile` that installs dependencies, builds the bot, and starts it from `dist/`
- A fallback `Procfile` is also included for hosts that expect one

## PostgreSQL Sync Architecture

- Startup order is: connect PostgreSQL, apply the Prisma schema, log into Discord, wait for the client ready event, run a full Discord-to-database reconciliation, then start the Fastify API
- Reconciliation sync uses PostgreSQL upserts for members and roles and removes stale records that were missed while the bot was offline
- Real-time Discord events update only the affected PostgreSQL records for member and role changes
- API reads come from PostgreSQL for routes such as `/api/discord/members`, `/api/discord/council`, and `/api/discord/roles`
- Council queries can be configured with `COUNCIL_ROLE_IDS` as a comma-separated list of Discord role IDs

## Environment Variables

- `TOKEN` — Discord bot token
- `CLIENT_ID` — Discord application client ID
- `GUILD_IDS` — comma-separated guild IDs for slash command deployment
- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — Railway-provided HTTP port; takes precedence over `API_PORT` when present
- `API_HOST` — Fastify bind host, default `0.0.0.0`
- `API_PORT` — Fastify bind port, default `3000`
- `COUNCIL_ROLE_IDS` — optional comma-separated Discord role IDs for the council endpoint

## Railway Setup

- This app should be deployed to Railway as a web service because the process exposes the Fastify API and Railway health checks rely on the HTTP listener
- Railway injects `PORT`; the runtime now uses `PORT` first and falls back to `API_PORT` outside Railway
- Set these Railway environment variables: `TOKEN`, `CLIENT_ID`, `DATABASE_URL`
- Set `GUILD_IDS` only if you plan to run the slash-command deploy script from the same environment
- Optionally set `COUNCIL_ROLE_IDS`, `DEFAULT_EVENT_TIMEZONE`, `SIGILS_PER_RAFFLE_ENTRY`, and `ASTRAL_CHANNEL_ID`
- The repository includes `railway.json` with `npm run db:push && npm start` and a `/health` health check
- If you are starting fresh, do not attach a Railway volume for the old `data/` directory

---

## Key Features

### Sigil Economy

- Persistent per-guild sigil balances in PostgreSQL
- Transaction history for awards, removals, redemptions, and daily claims
- Daily reward command with 24-hour cooldown
- User balance and ledger views
- Admin balance auditing and economy statistics

### Raffle System

- Start raffles with a prize and duration
- Optional raffle naming
- View raffle status
- End raffles manually or automatically
- Weighted sigil redemption into raffle entries
- Winner announcement flow
- PostgreSQL-backed raffle state

### Event System

- `/event create` slash command with date, time, and optional timezone input
- UTC-backed event persistence in PostgreSQL
- Arcane-themed event embeds with local-time Discord timestamps
- RSVP buttons for Going / Maybe / No
- Modular interaction handlers for future scheduling features

### Admin Tools

- Award or remove sigils from users
- Inspect user balances
- Inspect transaction logs
- View guild-wide leaderboard and economy summary
- Review active raffle state

### Bot Behavior

- Recursive slash command loading from `src/commands/`
- Global interaction router for commands, buttons, and modals
- Background raffle auto-end loop
- Guild-only protection on user-facing features
- Administrator checks for sensitive actions

---

## Command Reference

## User Commands

These commands are available to regular users inside a server.

## Event Commands

### `/event create title date time [timezone] [notes]`

Create a new event embed with timezone-safe display.

**Options**

- `title` — event name
- `date` — `YYYY-MM-DD`
- `time` — `19:30` or `7:30 PM`
- `timezone` — optional IANA timezone such as `America/New_York` (defaults to `UTC`)
- `notes` — optional preparation details

**Behavior**

- Parses the supplied date/time in the requested timezone
- Converts the start time to UTC for storage
- Renders local-time display using Discord timestamps
- Posts an arcane event embed with Going / Maybe / No RSVP buttons
- Persists the event state to PostgreSQL

## User Commands

### `/my-sigils`

View your current sigil balance and recent ledger activity.

**Details**

- Shows your personal balance
- Displays recent transactions
- Uses the sigil ledger for the current guild
- Guild-only command

### `/sigil-shop`

Redeem sigils for weighted raffle entries.

**Details**

- Lists active raffles in the server
- Displays your current sigil balance
- Opens the shop flow for raffle entry redemption
- Guild-only command

### `/daily`

Claim your daily sigil reward.

**Details**

- Grants `+1 sigil`
- Enforces a 24-hour cooldown per user
- Shows a remaining cooldown timer when unavailable
- Persists the last claim timestamp immediately

---

## Admin Commands

These commands are intended for authorized administrators only.

### `/award-sigils <user> <amount> <reason>`

Award or remove sigils from a user.

**Options**

- `user` — the target member
- `amount` — positive to award, negative to remove
- `reason` — required ledger reason

**Behavior**

- Updates the target user's sigil balance
- Records the action in transaction history
- Logs who performed the adjustment
- Returns an updated balance embed

### `/sigil-balance <user>`

Inspect another user's sigil balance.

**Behavior**

- Displays current balance
- Shows recent transaction activity
- Intended for moderation and support

### `/sigil-transactions <user>`

Inspect a user's transaction history.

**Behavior**

- Shows a longer ledger view
- Useful for auditing adjustments and redemptions
- Administrator-only

### `/sigil-leaderboard`

View the top sigil earners in the guild.

**Behavior**

- Sorts users by balance
- Fetches display names when possible
- Returns a formatted leaderboard embed

### `/sigil-admin-panel`

View guild-wide economy statistics.

**Behavior**

- Summarizes circulation and economy data
- Shows active raffle context
- Provides a moderation overview for the server

---

## Raffle Commands

These commands control raffle creation and resolution.

### `/raffle-start <prize> <duration> [name]`

Start a new raffle.

**Options**

- `prize` — required prize text
- `duration` — required end time or duration input
- `name` — optional custom raffle title

**Behavior**

- Parses a human-readable time value
- Rejects invalid or past durations
- Generates a themed default name if none is provided
- Prompts the user to select a role during setup
- Continues the raffle creation flow interactively

### `/raffle-status`

Show the current raffle status.

**Behavior**

- Displays details for a single active raffle
- Shows a selection menu if multiple raffles are active
- Includes prize, ending time, invocation text, and bound entry count

### `/raffle-end`

Force-end the current raffle.

**Behavior**

- Ends the active raffle manually
- Selects a winner from the entries when available
- Removes interactive components from the original raffle message
- Posts a winner announcement when applicable

---

## How It Works

### Startup Flow

When the bot starts, it:

1. creates a Discord client
2. loads command files recursively from `src/commands/`
3. registers them in memory
4. starts the raffle auto-end loop
5. optionally starts additional background routines
6. listens for interactions from Discord

### Interaction Routing

The bot uses a central interaction handler for:

- slash commands
- buttons
- modal submissions

This keeps command logic organized while still supporting richer interactive workflows.

### Sigil Ledger

Sigil balances are stored per guild and per user.
The ledger tracks:

- current balance
- transaction history
- daily claim timestamps
- awarded, removed, and redeemed amounts

### Raffle Flow

Raffles can be started, monitored, and ended.
The raffle system supports:

- active raffle tracking
- manual ending
- automatic ending
- entry redemption through the sigil shop
- winner selection based on raffle entries

---

## Installation

### Requirements

- Node.js 16+ or newer
- npm
- a Discord application and bot token
- permission to invite the bot to a server

### Setup

```bash
git clone https://github.com/emilio1229/woa-raffle-bot.git
cd woa-raffle-bot
npm install
```

Create a `.env` file in the project root:

```env
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_application_client_id_here
SIGILS_PER_RAFFLE_ENTRY=100
```

Deploy the slash commands:

```bash
npm run build
npm run deploy
```

Start the bot:

```bash
npm run start
```

For local development with auto-reload:

```bash
npm run dev
```

---

## Configuration

| Variable                  | Required         | Default | Description                                                 |
| ------------------------- | ---------------- | ------: | ----------------------------------------------------------- |
| `TOKEN`                   | Yes              |       — | Discord bot token                                           |
| `CLIENT_ID`               | Yes              |       — | Discord application client ID                               |
| `GUILD_IDS`               | Yes (for deploy) |       — | Comma-separated guild IDs for slash command deployment      |
| `DEFAULT_EVENT_TIMEZONE`  | No               |   `UTC` | Default timezone used when `/event create` omits a timezone |
| `SIGILS_PER_RAFFLE_ENTRY` | No               |   `100` | Sigil cost per raffle entry                                 |
| `ASTRAL_CHANNEL_ID`       | No               |       — | Channel ID for the optional astral selection routine        |

### Example `.env`

```env
TOKEN=your_discord_bot_token_here
CLIENT_ID=123456789012345678
GUILD_IDS=1498579289166188604,1428105944373526610
DEFAULT_EVENT_TIMEZONE=UTC
SIGILS_PER_RAFFLE_ENTRY=100
ASTRAL_CHANNEL_ID=
```

---

## Data Storage

### Sigil Data

The bot uses a persistent sigil ledger to keep balances and transaction history.

Typical information stored includes:

- guild ID
- user ID
- sigil balance
- transaction records
- daily reward timestamp

### Raffle Data

Raffle state includes:

- raffle ID
- guild ID
- channel ID
- message ID
- prize
- end time
- entries
- ended state

### Event Data

Event state includes:

- event ID
- guild ID
- channel ID
- message ID
- host and creator IDs
- `startAtIso` in UTC
- `startAtUnix` for Discord timestamp rendering
- RSVP state per user

---

## Permissions

### OAuth2 Scopes

- `applications.commands` — registers slash commands
- `bot` — adds the bot to the server

### Bot Permissions

- `SEND_MESSAGES` — reply to commands
- `MANAGE_MESSAGES` — update raffle content and remove components
- `EMBED_LINKS` — send rich embeds
- `READ_MESSAGE_HISTORY` — fetch existing raffle messages

### Command Restrictions

- user commands are guild-only
- admin commands require administrator privileges
- raffle management should be used only by trusted staff

---

## Troubleshooting

### Commands do not appear

Check that:

- the bot was invited with `applications.commands`
- slash commands were deployed successfully
- the bot has permission to view the server and channels
- the correct application `CLIENT_ID` is set

### `/my-sigils` or `/sigil-shop` does not work in DMs

That is expected.
These commands are intentionally server-only.

### Daily reward says it is still on cooldown

The command can only be used once every 24 hours.
Wait until the displayed cooldown expires.

### Raffle creation fails

Possible causes:

- invalid duration format
- end time in the past
- missing permissions
- setup interaction timed out

### Admin command fails

Verify that:

- you have administrator permissions
- you are using the command in a server
- the bot can reply in the channel

---

## Contributing

Contributions are welcome.
If you add new slash commands under `src/commands/`, they will be discovered automatically by the recursive loader.

---

## License

Unlicensed. Use freely.

---

## Support

If you need help, open an issue in the repository or contact the maintainer.
