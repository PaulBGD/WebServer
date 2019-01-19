#!/bin/bash

set -e

git checkout build
git merge master
yarn build
rm -rf src/
git add --force ./lib/
git commit -m 'build'
git push origin build
