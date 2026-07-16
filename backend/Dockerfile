# Stage 1: Install production dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev


# Stage 2: Run the application
FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 5000

CMD ["node", "server.js"]