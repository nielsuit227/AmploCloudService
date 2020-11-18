# The first stage
# Build React static files
FROM node:12.18.3-alpine3.9 as builder

WORKDIR /usr/src/app/frontend

COPY ./frontend/react-app/package.json .
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp
COPY ./frontend/react-app/ .
RUN npm run build

# The second stage
# Copy React static files and start nginx
FROM nginx:stable-alpine
COPY --from=builder /usr/src/app/frontend/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]