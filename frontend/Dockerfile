FROM node:22-alpine

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install packages
RUN npm install

# Copy application source
COPY . .

EXPOSE 3000

# Run Vite development server binding to host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
