#!/bin/bash

set -e

git checkout build
git merge master
yarn tsc-build
git add --force ./lib/
git commit -m 'build'
git push origin build
git checkout master
