FROM node:20-alpine

# Install dependencies required for native modules (like better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies for drizzle-kit)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the listening port
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Push schema and start the application
CMD ["sh", "-c", "if [ ! -s sqlite.db ]; then npx drizzle-kit push --force; fi && npm run start"]
