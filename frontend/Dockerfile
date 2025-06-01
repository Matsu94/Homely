FROM nginx:alpine

# Clear default content
RUN rm -rf /usr/share/nginx/html/*

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy all files (except those in .dockerignore)
COPY . .

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80