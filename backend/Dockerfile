FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
RUN npm install nodemon -g
#RUN npm update
# If you are building your code for production
# RUN npm ci --only=production
RUN apt update
RUN apt install nano

# Bundle app source
COPY ./ .
#RUN cp -a /usr/src/app/. /usr/src/app_backup

EXPOSE 3030
#ENTRYPOINT [ "/usr/src/app/entrypoint.sh" ]
CMD [ "nodemon", "app.js" ]
