#!/bin/bash

set -e

git checkout build
git merge master
git checkout master -- src/
yarn tsc-build
git rm -r --cached src/
rm -rf src/
git add --force ./lib/
(git commit -m 'build' && git push origin build) || echo "Nothing to push"
git checkout master
