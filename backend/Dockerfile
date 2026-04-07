FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeuser
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./
RUN chown -R nodeuser:nodejs /app
USER nodeuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "src/index.js"]