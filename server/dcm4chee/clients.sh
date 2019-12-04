#!/bin/bash

ERROR_MESSAGE='{"errorMessage":"Client dcm4chee-arc-ui already exists"}'
#printf "%s\n" "Connecting to Keycloak, please wait...  "

#until [ "$ARC" == "$ERROR_MESSAGE" ]
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

	  if [ "$ARC" == "$ERROR_MESSAGE" ]; then echo -en "\r(100%)\nConnected to Keycloak!\n"; break; else echo -en "\rConnecting to Keycloak, please wait... "; printf "%s" "($(expr $i \* 5)%)" ; fi
 
done

$(URL2=${URL2}) curl -s -k -X  POST \
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
 }'

 $(URL2=${URL2}) curl -s -k -X  POST \
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
 }'

 $(URL2=${URL2}) curl -s -k -X  POST \
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
}'
printf "\n%s\n" "Installation finished!"
