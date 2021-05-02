#!/bin/bash

set -e

### Configuration ###

APP_NAME=mobtime
APP_DIR="${APP_DIR-/var/www/$APP_NAME}"
GIT_URL="git://github.com/mrozbarry/$APP_NAME.git"
BRANCH="${BRANCH:-master}"
RESTART_ARGS=
NODE_ENV=production

echo "Performing deploy"
echo "==================="
echo "DIR: $APP_DIR"
echo "GIT: $GIT_URL#$BRANCH"

### Automation steps ###

set -x

# Pull latest code
echo Cloning fresh copy of master...
git clone --depth=1 --branch=$BRANCH $GIT_URL $APP_DIR/next

echo Removing .git directory...
rm -rf $APP_DIR/next/.git

echo Installing dependencies...
cd $APP_DIR/next
yarn # --prod --non-interactive
yarn tailwind:prod

read -p "Are you sure you want to run this deploy? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  rm -rf $APP_DIR/next
  exit 1;
fi
# do dangerous stuff
echo Swapping fresh deploy with current code...
rm -rf $APP_DIR/previous
mv $APP_DIR/code $APP_DIR/previous
mv $APP_DIR/next $APP_DIR/code

echo Restarting passenger app...

# Restart app
passenger-config restart-app --ignore-app-not-running --ignore-passenger-not-running $RESTART_ARGS $APP_DIR/code

echo Done
