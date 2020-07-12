FROM node:14-stretch
USER node

WORKDIR /home/node

ADD package.json package-lock.json /home/node/
ADD src/ /home/node/src/

RUN npm ci

CMD ["npm", "start"]
