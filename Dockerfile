FROM node:10.16.0-alpine AS api
COPY source/. src/
WORKDIR /src
ENV MEMORY 2048
ENV DICOM_HOSTNAME="dicom-api"
ENV DICOM_REQUEST_PORT="8443"
ENV DICOM_TOKEN_PORT="8843"
ENV DICOM_SECRET=""
EXPOSE 8080
CMD node --max-old-space-size=$MEMORY --optimize-for-size app.js

