FROM node:14
RUN apt update && apt upgrade -y
RUN npm install -y


WORKDIR /morestuff
COPY . .
CMD npm start

