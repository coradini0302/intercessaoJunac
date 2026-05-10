FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
RUN npm install -g serve@14
WORKDIR /app
COPY --from=build /app/dist ./dist
# Gera config.js em runtime com a variável VITE_API_URL do Railway
CMD ["sh", "-c", "echo \"window.__API_URL__ = '${VITE_API_URL:-}';\" > ./dist/config.js && serve -s dist -l ${PORT:-3000}"]
