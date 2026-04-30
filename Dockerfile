FROM node:20-alpine

# Install dependencies required for native modules (like better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
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

# Start the application
CMD ["npm", "run", "start"]
