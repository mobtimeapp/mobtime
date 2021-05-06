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

if [ ! -d $APP_DIR/next ]; then
  # Pull latest code
  echo Cloning fresh copy of master...
  git clone $GIT_URL $APP_DIR/next
fi

echo Getting latest code...
cd $APP_DIR/next
git fetch
git reset --hard
git checkout $BRANCH
git pull origin $BRANCH
git reset --hard origin/$BRANCH

echo Installing dependencies...

yarn # --prod --non-interactive
yarn tailwind:prod

read -p "Are you sure you want to run this deploy? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo Skipping deploy
  exit 1;
fi

cp -rf $APP_DIR/code $APP_DIR/previous || echo No previous deploy
{
  # do dangerous stuff
  echo Removing current code
  rm -rf $APP_DIR/code

  echo Swapping fresh deploy with current code...
  # cp -rf $APP_DIR/next $APP_DIR/code
  rsync -az $APP_DIR/next/ $APP_DIR/code --exclude .git

  echo Cleanup
  rm -rf $APP_DIR/previous
} || {
  echo Something bad happened, reverting
  rm -rf $APP_DIR/code
  mv -f $APP_DIR/previous $APP_DIR/current
}


echo Restarting passenger app...

# Restart app
sudo passenger-config restart-app --ignore-app-not-running --ignore-passenger-not-running $RESTART_ARGS $APP_DIR/code

echo Done
