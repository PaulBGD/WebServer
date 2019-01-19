#!/bin/bash

set -e

git checkout build
git merge master
git checkout master -- src/
yarn tsc-build
rm -rf src/
git add --force ./lib/
git commit -m 'build'
git push origin build
git checkout master
