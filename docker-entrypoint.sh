#!/bin/sh
set -e

: "${API_UPSTREAM:=http://host.docker.internal:4000}"

envsubst '${API_UPSTREAM}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec "$@"
