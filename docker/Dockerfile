FROM node:current-alpine

EXPOSE 1234

WORKDIR /home/node/app

RUN apk --no-cache add git \
    && chown node:node /home/node/app

USER node

RUN git clone https://github.com/govizlora/optical-breacher.git . \
    && yarn install

ENTRYPOINT [ "sh", "-c", "yarn start" ]