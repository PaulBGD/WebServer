#!/bin/bash

set -e

git checkout build
(git merge master || echo "Ignoring error")
git checkout master -- src/
rm -rf lib/
yarn tsc-build
git rm -r --cached src/
rm -rf src/
git add --force ./lib/
(git commit -m 'build' && git push origin build) || echo "Nothing to push"
echo ""
echo "Commit hash: " $(git rev-parse HEAD)
echo ""
git checkout master
