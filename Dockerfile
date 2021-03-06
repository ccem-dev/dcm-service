FROM node:10.16.0-alpine AS api
COPY source/. src/
WORKDIR /src
ENV MEMORY 1024
ENV DICOM_REQUEST_HOSTNAME=""
ENV DICOM_REQUEST_PORT="8443"
ENV DICOM_AUTHENTICATION_HOST=""
ENV DICOM_AUTHENTICATION_PORT="8843"
ENV DICOM_SECRET=""
ENV AETS_NAME="DCM4CHEE"
ENV API_PORT="8080"
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
CMD node --max-old-space-size=$MEMORY --optimize-for-size app.js
