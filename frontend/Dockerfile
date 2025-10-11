# frontend/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Install dependencies first (package.json, package-lock.json)
COPY package*.json ./

RUN npm install

# Copy the rest of the files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
