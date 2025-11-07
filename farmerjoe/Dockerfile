# Stage 1: Development environment
FROM node:24-alpine AS development

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port for development server
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]