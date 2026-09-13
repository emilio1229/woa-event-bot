FROM node:22-bookworm-slim

WORKDIR /app

# Prisma's query engine needs OpenSSL present at runtime on this base image.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# db:push runs on every container start so schema changes always reach Postgres,
# regardless of whether the platform's own start-command override is applied.
# Hosts can override the default command with `node dist/deploy-commands.js`
# after the image is built if they need to register slash commands separately.
CMD ["sh", "-c", "npm run db:push && npm start"]
