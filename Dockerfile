FROM node:22-alpine3.21 AS base

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./

COPY src ./src

RUN npm ci