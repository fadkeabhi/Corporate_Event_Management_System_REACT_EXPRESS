FROM node:18-alpine

WORKDIR /app

# Copy only the package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Expose port and start command (if applicable)
EXPOSE 5173
CMD ["npm", "run", "dev"]
