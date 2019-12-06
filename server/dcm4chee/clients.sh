#!/bin/bash

ERROR_MESSAGE='{"errorMessage":"Client dcm4chee-arc-ui already exists"}'

for i in {1..20}
do  
    sleep 6
    RESULT=`$(URL=${URL}) curl -s -k \
    --url $URL \
    --data 'grant_type=password' \
    --data 'username=admin' \
    --data 'password=admin' \
    --data 'client_id=admin-cli' `
    TOKEN=`echo $RESULT | sed 's/.*access_token":"\([^"]*\).*/\1/'`
    
    ARC=`$(URL2=${URL2}) curl -s -k -X  POST \
        --url $URL2 \
        -H "Authorization: Bearer $TOKEN" \
        -H 'Content-Type: application/json' \
        -d '{
          "id":"DCM-1",
          "clientId":"dcm4chee-arc-ui",
          "name": "dcm4chee-arc-ui",
          "description": "dcm4chee-arc-ui",
          "enabled": true,
          "redirectUris":[ "'$URL_ARC'/*" ],
          "publicClient": true
          }' ` 

if [ "$ARC" == "$ERROR_MESSAGE" ]
then echo -en "\b\b\b\b\b\b(100%) - Connected to Keycloak!"
  printf "\nClient dcm4che-arc-ui created."
  break 
else echo -en "\rConnecting to Keycloak, please wait... "
  printf "%s" "($(expr $i \* 5)%)"
fi

done

for i in {1..2}
do
WDFLY_CLIENT=`$(URL2=${URL2}) curl -s -k -X  POST \
  --url $URL2 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
 "id":"DCM-2",
 "clientId":"wildfly-console",
 "name": "wildfly-console",
 "description": "wildfly-console",
 "enabled": true,
 "redirectUris":[ "'$URL_WF'/*" ],
 "publicClient": true
 }'`
done

 if [ "$WDFLY_CLIENT" == '{"errorMessage":"Client wildfly-console already exists"}' ] 
    then printf "\nClient wildfly-console created." 
    else printf "\nClient wildfly-console not created."
  fi 

for i in {1..2}
  do
 KIBANA_CLIENT=`$(URL2=${URL2}) curl -s -k -X  POST \
  --url $URL2 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
 "id":"DCM-3",
 "clientId":"kibana",
 "name": "kibana",
 "description": "kibana",
 "enabled": true,
 "redirectUris":[ "'$URL_KB'/*" ],
 "publicClient": false,
 "clientAuthenticatorType": "client-secret",
 "secret": "123456"
 }'`
done

  if [ "$KIBANA_CLIENT" == '{"errorMessage":"Client kibana already exists"}' ] 
    then printf "\nClient Kibana created." 
    else printf "\nClient Kibana not created."
  fi 

for i in {1..2}
do
 CURL_CLIENT=`$(URL2=${URL2}) curl -s -k -X  POST \
  --url $URL2 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
      "id": "DCM-4",
      "clientId": "curl",
      "enabled": true,
      "clientAuthenticatorType": "client-secret",
      "secret": "123456",
      "directAccessGrantsEnabled": true,
      "standardFlowEnabled": false,
      "serviceAccountsEnabled": true,
      "publicClient": false
}'`
done

  if [ "$CURL_CLIENT" == '{"errorMessage":"Client curl already exists"}' ] 
    then printf "\nClient Curl created." 
    else printf "\nClient Curl not created."
  fi 

if [ "$ARC" == "$ERROR_MESSAGE" ]
then printf "\n\nClients created successfully!\n"
printf "\n%s\n" "Installation finished!"
else printf "\n\nClients not created !\n\nRun install.sh again.\n\n"
fi