FROM node:18-slim

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libxss1 \
  libgtk-3-0 \
  libxshmfence1 \
  libglu1 \
  fonts-liberation \
  libappindicator3-1 \
  libu2f-udev \
  xdg-utils \
  --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]
