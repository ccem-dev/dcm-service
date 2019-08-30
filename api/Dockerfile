FROM node:10.16-alpine
LABEL tiago.matana@gmail.com

RUN apk upgrade --update && apk add \
            libpng  \
            libpng-dev \
            bzip2 \
            g++ \
            gcc \
            gnupg \
            libgcc \
            make \
            autoconf \
            automake \
            libtool \
            nasm && \
            rm /var/cache/apk/*

COPY src/. src/
WORKDIR /src

ENV PORT 5555
ENV MEMORY 2048
EXPOSE ${PORT}
CMD node --max-old-space-size=$MEMORY --optimize-for-size app.js