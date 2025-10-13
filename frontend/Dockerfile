# frontend/Dockerfile

FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG INSTALL_PLAYWRIGHT=false
RUN if [ "$INSTALL_PLAYWRIGHT" = "true" ]; then \
      npx playwright install --with-deps; \
    fi

EXPOSE 3000 6006

CMD ["npm", "run", "dev"]
