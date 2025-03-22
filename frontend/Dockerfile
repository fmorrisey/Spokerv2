# Build stage
FROM node:20-alpine AS build

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

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
