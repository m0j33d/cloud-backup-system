# Use an official Node.js runtime as the base image
FROM node:18.16.0-alpine

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your app runs on (Express.js default is 3000)
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]