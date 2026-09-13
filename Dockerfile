FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Mount this path on the host or platform-managed persistent storage.
VOLUME ["/app/data"]

# Hosts can override the default command with `node dist/deploy-commands.js`
# after the image is built if they need to register slash commands separately.
CMD ["npm", "start"]
