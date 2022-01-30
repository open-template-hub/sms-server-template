#!/usr/bin/env bash

if [ ! -f .env ]; then
  echo "Generating .env file.."
  touch .env
  {
    echo "PORT=4007"

    echo "PROJECT=OTH"
    echo "MODULE=SmsServer"
    echo "ENVIRONMENT=Local"

    echo "MONGODB_URI={Database Connection Url}"
    echo "MONGODB_CONNECTION_LIMIT={MongoDB Connection Limit}"

    echo "CLOUDAMQP_APIKEY={MQ Api Key}"
    echo "CLOUDAMQP_URL={MQ Connection Url}"

    echo "SMS_SERVER_QUEUE_CHANNEL=oth_sms_queue"
    echo "ORCHESTRATION_SERVER_QUEUE_CHANNEL=oth_orchestration_queue"

    echo "ACCESS_TOKEN_SECRET={Access Token Secret}"
    echo "RESPONSE_ENCRYPTION_SECRET={Response Encryption Secret}"

    echo "DEFAULT_LANGUAGE={Language Code}"
  } >>.env
else
  echo ".env file already exists. Nothing to do..."
fi
