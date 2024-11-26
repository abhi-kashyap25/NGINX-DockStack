# Use a specific Node.js version
FROM node:14-alpine

# Create and set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with force to ensure all dependencies are installed
RUN npm install --force

# Create public directory
RUN mkdir -p public

# Copy application files
COPY server.js .
COPY public/index.html public/

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]