# Telegram Invite Bot

A serverless Telegram bot that tracks user invitations via unique invitation links.

[中文文档](README.zh-CN.md)

## Features

- Generate personal invitation links for users (`/mylink`)
- Track invitations when users join via invitation links
- View personal invitation stats and ranking (`/status`)
- See the top inviters leaderboard (`/rank`)

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Supabase account for database storage

## Setup

1. Clone this repository
2. Install dependencies with Bun:
   ```bash
   bun install
   ```
3. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in the required environment variables in the `.env` file:
   - `BOT_TOKEN`: Your Telegram bot token from BotFather
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`: Supabase credentials

## Database Setup

You need to set up the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  invite_count INTEGER DEFAULT 0,
  invite_link TEXT DEFAULT NULL
);
```

### Invites Table
```sql
CREATE TABLE invites (
  invitee_id BIGINT PRIMARY KEY,
  inviter_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Development

Run the bot locally in polling mode:

```bash
bun dev
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Configure environment variables in Vercel's dashboard

### Deploying to AWS Workers or other serverless platforms

Similar to Vercel, you'll need to:

1. Configure the platform for your serverless functions
2. Set up environment variables
3. Deploy your application

## License

MIT
