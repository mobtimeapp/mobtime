#!/bin/bash

HOST_DIR=/var/www/mobtime
DEPLOY_DIR="$HOST_DIR/deploys"
CONFIG_DIR="$HOST_DIR/config"
CURRENT_LINK="$HOST_DIR/current"

CURRENT_TIMESTAMP=`date +%s`

CURRENT_DEPLOY="$DEPLOY_DIR/$CURRENT_TIMESTAMP"

function install() {
  yarn install
}

function ensureHostDirIsCreated() {
  mkdir -p $CONFIG_DIR
}

function copySelfIntoDeploy() {
  mkdir -p $CURRENT_DEPLOY
  cp -r . "$CURRENT_DEPLOY/"
}

function setupCurrentDeploy() {
  ln -sf $CURRENT_DEPLOY $CURRENT_LINK
  if [ "$(ls -A $CONFIG_DIR)" ]; then
    cp -R "$CONFIG_DIR/." $CURRENT_LINK
  fi
}

install
ensureHostDirIsCreated
copySelfIntoDeploy
setupCurrentDeploy

