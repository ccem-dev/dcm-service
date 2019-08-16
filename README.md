Readme.md

Instalação dos containers para servidor dcm4chee:
https://github.com/dcm4che/dcm4chee-arc-light/wiki/Run-secured-archive-services-and-Elastic-Stack-on-a-single-host

#####################################################################
Passo 1: Desabilitar swapping de memória
https://www.elastic.co/guide/en/elasticsearch/reference/current/setup-configuration-memory.html

Ação Recomendada (reduz a tendência de ocorrer swapping, salvo em emergências):
$ sudo -i
# sysctl -w vm.swappiness=1
# echo 'vm.swappiness=1' >> /etc/sysctl.conf
# exit


Alternativas para desabilitar swapping:
a) Temporariamente:
$ sudo swapoff -a

b) Permanentemente:
$ sudo vim /etc/fstab
Comentar (com #) as linhas que contenham a palavra "swap"

#####################################################################
Passo 2: Reservar memória para o Elasticsearch

$ sudo -i
# sysctl -w vm.max_map_count=262144
# echo 'vm.max_map_count=262144' >> /etc/sysctl.conf (to persist reboots)
# exit

#####################################################################
Passo 3: Permissão de escrita para o Logstash
$ sudo mkdir -p ./persistence/dcm4chee-arc/logstash
$ sudo chown 1000:1000 ./persistence/dcm4chee-arc/logstash

#####################################################################
Passo 4: Criação e execução dos containers
$ sudo /bin/bash install.sh

#####################################################################
Passo 5: Configuração dos clientes

Determine seu IP:
$ ip -4 addr show eno1 | grep -Po 'inet \K[\d.]+'


5.1) Login no Keycloak
- Execute o comando:
$ echo https://$(ip -4 addr show eno1 | grep -Po 'inet \K[\d.]+'):8843/auth/admin/dcm4che/console

- Abra um navegador e acesse o URL apresentado pelo comando anterior. Exemplo: https://<Seu_IP_aqui>:8843/auth/admin/dcm4che/console

- Entre com as credenciais:
Username: admin
Password: admin


5.2) dcm4chee-arc-ui
- Clique em "Clients" no menu da esquerda e aperte no botão Create na aba Lookup

- Preencha os campos
CLIENT ID*: dcm4chee-arc-ui
Root URL  : https://<Seu_IP_aqui>/dcm4chee-arc/ui2

- Save


5.3) wildfly-console
- Novamente clique em "Clients" no menu da esquerda e aperte no botão Create na aba Lookup

- Preencha os campos
CLIENT ID*: wildfly-console
Root URL  : https://<Seu_IP_aqui>:9993/console

- Save


5.4) kibana
- Pela última vez, clique em "Clients" no menu da esquerda e aperte no botão Create na aba Lookup

- Preencha os campos
CLIENT ID*: kibana
Root URL  : https://<Seu_IP_aqui>:8643

- Save

- Na aba Settings, altere Access Type de public para confidential. Pressione Save no fim da página.

- Na aba Credentials, copie o valor do campo Secret.

- Na aba Mappers, pressione Create e preencha os campos conforme abaixo:
Name:			  audience
Mapper Type:		  Audience
Included Client Audience: kibana

- Save


5.5) keycloak-gatekeeper
-Insira o valor (obtido no passo 5.4) quando solicitado na linha de comando do terminal.

*Em caso de erro, atribua o valor na variável "PROXY_CLIENT_SECRET" do comando abaixo:

sudo docker run --restart unless-stopped --network=dcm4chee_default --name keycloak-gatekeeper \
           --log-driver gelf \
           --log-opt gelf-address=udp://$(ip -4 addr show eno1 | grep -Po 'inet \K[\d.]+'):12201 \
           --log-opt tag=keycloak-gatekeeper \
           -p 8643:8643 \
           -e PROXY_LISTEN=:8643 \
           -e PROXY_REDIRECTION_URL=https://$(ip -4 addr show eno1 | grep -Po 'inet \K[\d.]+'):8643 \
           -e PROXY_UPSTREAM_URL=http://kibana:5601 \
           -e PROXY_DISCOVERY_URL=https://$(ip -4 addr show eno1 | grep -Po 'inet \K[\d.]+'):8843/auth/realms/dcm4che \
           -e PROXY_CLIENT_ID=kibana \
           -e PROXY_CLIENT_SECRET=<Cole_aqui_Secret_do_passo_5.4> \
           -e PROXY_ENCRYPTION_KEY=AgXa7xRcoClDEU0ZDSH4X0XhL5Qy2Z2j \
           -d dcm4che/keycloak-gatekeeper:6.0.1 \
           --openid-provider-timeout=120s \
           --tls-cert=/etc/certs/cert.pem \
           --tls-private-key=/etc/certs/key.pem \
           --skip-openid-provider-tls-verify=true \
           --enable-refresh-tokens=true \
           --resources=uri=/*|roles=auditlog
#####################################################################
Comandos úteis:

$ sudo docker network create dcm4chee_default
$ sudo docker start elasticsearch kibana logstash ldap keycloak keycloak-gatekeeper db arc
$ sudo docker stop elasticsearch kibana logstash ldap keycloak keycloak-gatekeeper db arc

Mostrar condição dos containers criados.
$ clear && echo && docker ps -a && echo && echo "UP:" && docker ps --format {{.Names}} && echo && echo "Exited:" && docker ps -q -f "status=exited" --format {{.Names}} && echo && echo

