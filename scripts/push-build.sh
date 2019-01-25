#!/bin/bash

set -e

git checkout build
(git merge master || echo "Ignoring error")
git checkout master -- src/
yarn tsc-build
git rm -r --cached src/
rm -rf src/
git add --force ./lib/
(git commit -m 'build' && git push origin build) || echo "Nothing to push"
echo "\nCommit hash: " $(git rev-parse HEAD)
git checkout master
