# --- STAGE 1: Build the Vite app ---
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy all client code
COPY . .

# This runs the 'build' script in your package.json
# It creates a 'dist' folder with your static app
RUN npm run build

# --- STAGE 2: Serve the built app with Nginx ---
FROM nginx:stable-alpine

# Copy the built files from Stage 1 into the Nginx server directory
COPY --from=build /app/dist /usr/share/nginx/html

# We need to add a custom Nginx config to handle API proxying
# We will create this file next
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP)
EXPOSE 80