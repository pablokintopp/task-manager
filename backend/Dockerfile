FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY backend/package*.json ./

RUN npm install
RUN npm install nodemon -g
# If you are building your code for production
# RUN npm ci --only=production
RUN apt update
RUN apt install nano

# Bundle app source
COPY ./backend/ .

EXPOSE 3030
CMD [ "nodemon", "app.js" ]
