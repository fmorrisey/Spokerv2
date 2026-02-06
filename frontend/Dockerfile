# Build stage
FROM node:20-alpine AS build

# Build argument for cache busting
ARG BUILD_DATE=unknown
RUN echo "Build date: ${BUILD_DATE}"

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/* && rm /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/spokerv2/browser/ /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for runtime configuration
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
