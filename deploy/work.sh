#!/bin/bash
set -e

### Configuration ###

APP_DIR=/home/cloud/paris-call-server
GIT_URL=https://github.com/ambanum/paris-call-server.git

### Automation steps ###

set -x

# Pull latest code
if [[ -e $APP_DIR ]]; then
  cd $APP_DIR
  git pull
else
  git clone $GIT_URL $APP_DIR
  cd $APP_DIR
fi

# Install dependencies
npm install --production
npm prune --production

# Restart app
PORT=3030 forever restart app/server.js || PORT=3030 forever start app/server.js
