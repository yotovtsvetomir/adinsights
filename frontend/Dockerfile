# frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (package.json, package-lock.json)
COPY package*.json ./

RUN npm install

# Copy the rest of the files
COPY . .

EXPOSE 3000 6006

CMD ["npm", "run", "dev"]
