FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Expose the port your backend listens on
EXPOSE 5001

CMD ["npm", "start"]
