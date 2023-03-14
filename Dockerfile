FROM node:18.14.2-alpine as builder
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn config set network-timeout 300000
RUN yarn
COPY . . 
RUN yarn build

FROM nginx:1.22.1-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf :/*
COPY --from=builder /app/build .
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]