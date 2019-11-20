#!/bin/bash

echo Creating network dcm-network
  docker network create dcm-network

echo Creating elasticsearch
  docker run --restart unless-stopped --network=dcm-network --name elasticsearch \
           -e ES_JAVA_OPTS="-Xms1024m -Xmx1024m" \
           -e TAKE_FILE_OWNERSHIP=1 \
           -e discovery.type=single-node \
           -p 9200:9200 \
           -p 9300:9300 \
           -v /etc/localtime:/etc/localtime:ro \
           -v /etc/timezone:/etc/timezone:ro \
           -v $(pwd)/persistence/dcm4chee-arc/elasticsearch:/usr/share/elasticsearch/data \
           -d docker.elastic.co/elasticsearch/elasticsearch-oss:7.1.1

echo Creating kibana
  docker run --restart unless-stopped --network=dcm-network --name kibana \
           -v /etc/localtime:/etc/localtime:ro \
           -v /etc/timezone:/etc/timezone:ro \
           -d docker.elastic.co/kibana/kibana-oss:7.1.1

echo Creating logstash
  docker run --restart unless-stopped --network=dcm-network --name logstash \
           -p 12201:12201/udp \
           -p 8514:8514/udp \
           -p 8514:8514 \
           -v /etc/localtime:/etc/localtime:ro \
           -v /etc/timezone:/etc/timezone:ro \
           -v $(pwd)/persistence/dcm4chee-arc/logstash/filter-hashtree:/usr/share/logstash/data/filter-hashtree \
           -d dcm4che/logstash-dcm4chee:7.1.1-9

echo Creating ldap
  docker run --restart unless-stopped --network=dcm-network --name ldap \
           --log-driver gelf \
	   --log-opt gelf-address=udp://$(hostname -I | awk '{print $1}'):12201 \
           --log-opt tag=slapd \
           -p 389:389 \
           -e SYSLOG_HOST=logstash \
           -e SYSLOG_PORT=8514 \
           -e SYSLOG_PROTOCOL=TLS \
           -v /etc/localtime:/etc/localtime:ro \
           -v /etc/timezone:/etc/timezone:ro \
           -v $(pwd)/persistence/dcm4chee-arc/ldap:/var/lib/ldap \
           -v $(pwd)/persistence/dcm4chee-arc/slapd.d:/etc/ldap/slapd.d \
           -d dcm4che/slapd-dcm4chee:2.4.44-17.1

echo Creating keycloak
  docker run --restart unless-stopped --network=dcm-network --name keycloak \
           --log-driver gelf \
           --log-opt gelf-address=udp://$(hostname -I | awk '{print $1}'):12201 \
           --log-opt tag=keycloak \
           -p 8880:8880 \
           -p 8843:8843 \
           -p 8990:8990 \
           -p 8993:8993 \
           -e URL=https://$(hostname -I | awk '{print $1}'):8843/auth/realms/dcm4che/protocol/openid-connect/token \
           -e URL2=https://$(hostname -I | awk '{print $1}'):8843/auth/admin/realms/dcm4che/clients \
           -e URL_ARC=https://$(hostname -I | awk '{print $1}'):8443/dcm4chee-arc/ui2 \
           -e URL_WF=https://$(hostname -I | awk '{print $1}'):9993/console \
           -e URL_KB=https://$(hostname -I | awk '{print $1}'):8643 \
           -e HTTP_PORT=8880 \
           -e HTTPS_PORT=8843 \
           -e MANAGEMENT_HTTP_PORT=8990 \
           -e MANAGEMENT_HTTPS_PORT=8993 \
           -e LOGSTASH_HOST=logstash \
           -e KEYCLOAK_WAIT_FOR="ldap:389 logstash:8514" \
           -v /etc/localtime:/etc/localtime:ro \
           -v /etc/timezone:/etc/timezone:ro \
           -v $(pwd)/persistence/dcm4chee-arc/keycloak:/opt/keycloak/standalone \
           -d dcm4che/keycloak:6.0.1-17.0

echo Copy files ....
docker cp clients.sh keycloak:/

echo Creating Clients
docker exec keycloak chmod +x clients.sh
docker exec keycloak /bin/bash clients.sh 

echo Creating db
 docker run --restart unless-stopped --network=dcm-network --name db \
           --log-driver gelf \
           --log-opt gelf-address=udp://$(hostname -I | awk '{print $1}'):12201 \
           --log-opt tag=postgres \
           -p 5432:5432 \
           -e POSTGRES_DB=pacsdb \
           -e POSTGRES_USER=pacs \
           -e POSTGRES_PASSWORD=pacs \
           -v /etc/localtime:/etc/localtime:ro \
           -v /etc/timezone:/etc/timezone:ro \
           -v $(pwd)/persistence/dcm4chee-arc/db:/var/lib/postgresql/data \
           -d dcm4che/postgres-dcm4chee:11.2-17

echo Creating arc
  docker run --restart unless-stopped --network=dcm-network --name arc \
           --log-driver gelf \
           --log-opt gelf-address=udp://$(hostname -I | awk '{print $1}'):12201 \
           --log-opt tag=dcm4chee-arc \
           -p 8080:8080 \
           -p 8443:8443 \
           -p 9990:9990 \
           -p 9993:9993 \
           -p 11112:11112 \
           -p 2575:2575 \
           -e POSTGRES_DB=pacsdb \
           -e POSTGRES_USER=pacs \
           -e POSTGRES_PASSWORD=pacs \
           -e LOGSTASH_HOST=logstash \
           -e WILDFLY_WAIT_FOR="ldap:389 db:5432 logstash:8514" \
           -e AUTH_SERVER_URL=https://$(hostname -I | awk '{print $1}'):8843/auth \
           -v /etc/localtime:/etc/localtime:ro \
           -v /etc/timezone:/etc/timezone:ro \
           -v $(pwd)/persistence/dcm4chee-arc/wildfly:/opt/wildfly/standalone \
           -d dcm4che/dcm4chee-arc-psql:5.17.1-secure

echo
echo "Configure the clients on: "$(echo https://$(hostname -I | awk '{print $1}'):8843/auth/admin/dcm4che/console)

read -p "Insert SECRET here: " SECRET_VALUE

  docker run --restart unless-stopped --network=dcm-network --name keycloak-gatekeeper \
           --log-driver gelf \
           --log-opt gelf-address=udp://$(hostname -I | awk '{print $1}'):12201 \
           --log-opt tag=keycloak-gatekeeper \
           -p 8643:8643 \
           -e PROXY_LISTEN=:8643 \
           -e PROXY_REDIRECTION_URL=https://$(hostname -I | awk '{print $1}'):8643 \
           -e PROXY_UPSTREAM_URL=http://kibana:5601 \
           -e PROXY_DISCOVERY_URL=https://$(hostname -I | awk '{print $1}'):8843/auth/realms/dcm4che \
           -e PROXY_CLIENT_ID=kibana \
           -e PROXY_CLIENT_SECRET=$SECRET_VALUE \
           -e PROXY_ENCRYPTION_KEY=AgXa7xRcoClDEU0ZDSH4X0XhL5Qy2Z2j \
           -d dcm4che/keycloak-gatekeeper:6.0.1 \
           --openid-provider-timeout=120s \
           --tls-cert=/etc/certs/cert.pem \
           --tls-private-key=/etc/certs/key.pem \
           --skip-openid-provider-tls-verify=true \
           --enable-refresh-tokens=true \
           --resources=uri=/*|roles=auditlog
