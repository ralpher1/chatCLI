ARG VERSION=14
FROM node:$VERSION-alpine
RUN apk update
RUN apk upgrade
RUN apk add tmux
RUN apk add git
EXPOSE 3000
ENV abcd=wtf
RUN apk add zsh
RUN apk add vim
RUN apk add neovim
RUN apk add curl
RUN apk add lynx
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
#RUN apt install tmux
#USER node
WORKDIR /chatapp
COPY . .
