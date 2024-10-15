FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install typescript -g

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN tsc

EXPOSE 4000

CMD ["npm", "start"]
