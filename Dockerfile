FROM node:20 AS builder

# Create app directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Copy prisma directory
COPY prisma ./prisma/

# Install app dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

FROM node:20

# Install netcat
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
COPY .env.docker .env
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]