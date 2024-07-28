FROM node:20-alpine

WORKDIR /app

COPY . .

RUN apk --no-cache add curl bash \
    && curl -o /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /usr/local/bin/wait-for-it.sh \
    && chmod +x scripts/start.sh \
    && npm install \
    && npm run build

ENTRYPOINT ["/bin/bash", "/app/scripts/start.sh"]
