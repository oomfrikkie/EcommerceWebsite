# Frontend Dockerfile for Vite/React
FROM node:20-alpine as dev

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production image: use a simple static file server
FROM node:20-alpine as prod
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
