FROM node:18

# Install cloudflared
RUN curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb \
    && dpkg -i cloudflared.deb

# Copy backend code
WORKDIR /app
COPY . .
RUN npm install

CMD ["npm", "start"]