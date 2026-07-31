FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build application
RUN npm run build

EXPOSE 3000

# Start server
CMD ["npm", "start"]

