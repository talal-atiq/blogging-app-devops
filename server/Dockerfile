# Use a small, official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install *only* production dependencies
RUN npm install --omit=dev

# Copy the rest of your backend source code
COPY . .

# Expose the port your server listens on (it's 5000 in your index.js)
EXPOSE 5000

# The command to run your app
CMD ["node", "index.js"]