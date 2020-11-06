FROM node:14.3-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 80
COPY . .
