FROM node:22-alpine

WORKDIR /app

COPY next-app/package.json next-app/package-lock.json ./

RUN npm ci

COPY next-app/ ./

ENV API_INTERNAL_URL=http://api
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]