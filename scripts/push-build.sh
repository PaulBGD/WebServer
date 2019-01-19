#!/bin/bash

set -e

git checkout build
git merge -X master
yarn build
git add --all
git commit -m 'build'
git push origin build
