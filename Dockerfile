FROM node:22-bookworm-slim

WORKDIR /app

# Prisma's query engine needs OpenSSL present at runtime on this base image.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# The app applies the Prisma schema itself at startup (see src/database/prisma.ts),
# so the container's start command does not need to run db:push separately.
# Hosts can override the default command with `node dist/deploy-commands.js`
# after the image is built if they need to register slash commands separately.
CMD ["npm", "start"]
