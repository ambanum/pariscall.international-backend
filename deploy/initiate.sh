#!/bin/bash
set -e

### Configuration ###

SERVER=cloud@84.39.33.94
APP_DIR=/home/cloud/paris-call-server
REMOTE_SCRIPT_PATH=/tmp/deploy-paris-call-server.sh


### Library ###

function run()
{
  echo "Running: $@"
  "$@"
}


### Automation steps ###

run scp $KEYARG deploy/work.sh $SERVER:$REMOTE_SCRIPT_PATH
echo
echo "---- Running deployment script on remote server ----"
run ssh $SERVER bash $REMOTE_SCRIPT_PATH
