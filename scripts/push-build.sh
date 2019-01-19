#!/bin/bash

set -e

git checkout build
git merge master
yarn build
git add --force ./lib/
git commit -m 'build'
git push origin build
git checkout master
