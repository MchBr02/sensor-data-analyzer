# Use the official Deno image from Docker Hub
FROM denoland/deno:alpine

# Set working directory inside the container
WORKDIR /app

# Copy the project files to the container
COPY . .

# Set the environment variables file location
ENV DENO_ENV=production

# Expose the application port
EXPOSE 8000

# Set necessary environment variables
ENV DENO_INSTALL=/deno
ENV PATH=$DENO_INSTALL/bin:$PATH

# Cache dependencies
RUN deno cache dev.ts

# Run the application
CMD ["deno", "task", "start"]
