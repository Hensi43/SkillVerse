FROM node:22-alpine

WORKDIR /app

# Copy package descriptors first to leverage Docker layers cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source tree
COPY . .

# Build typescript compilation
RUN npm run build

EXPOSE 5000

# Default execution command
CMD ["npm", "run", "dev"]
