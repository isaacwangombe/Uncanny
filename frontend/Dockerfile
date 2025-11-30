FROM nginx:alpine

# Copy the React build
COPY dist /usr/share/nginx/html

# Copy your server block
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy your GLOBAL nginx config
COPY nginx_global.conf /etc/nginx/nginx.conf
