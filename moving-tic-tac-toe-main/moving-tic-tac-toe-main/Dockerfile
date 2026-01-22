# Step 1: Use a lightweight Nginx image to serve the web files
FROM nginx:alpine

# Step 2: Copy your project files into the Nginx server's default HTML folder
COPY . /usr/share/nginx/html

# Step 3: Tell the container to listen on port 80
EXPOSE 80

# Step 4: Run Nginx in the foreground so the container stays active
CMD ["nginx", "-g", "daemon off;"]