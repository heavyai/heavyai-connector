#!/bin/bash

# show the command being run
set -x

# tell jenkins to fail if any of the commands fail
set -e

# checkout a new temp branch
git checkout -b temp

# bump the version
cd ..
npm --no-git-tag-version version patch

# Add and commit the new version
cd scripts
git commit -a -m "`bash package_version.sh`"

# push the new version to github
git push origin temp:master

# publish the module to npm
cd ..
npm publish

