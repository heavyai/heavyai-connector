#!/bin/bash

# show the command being run
set -x

# tell Jenkins to fail if any of the commands fail
set -e

# If the last commit was from jenkins, do nothing
if git log -1 --pretty="%an" | grep -q "Jenkins MapD" &&
    ! git log -1 --pretty="%B" | grep -q "Update Thrift" ; then
  echo "Ignoring superfluous build spawned by Jenkins"
  exit 0
fi

# temporary branch is used since Jenkins checks out detached heads, not named branches
TMP_BRANCH="temp"

# remove the previous temp branch
while [[ $(git rev-parse --verify $TMP_BRANCH 2>/dev/null) ]]; do
  TMP_BRANCH="temp-$RANDOM"
done

# checkout a new temp branch
git checkout -b $TMP_BRANCH

# bump the version
SEM_VAR=$(bash get_latest_semvar_tag.sh | tail -n 1)
cd ..
npm --no-git-tag-version version "$SEM_VAR"

# Build the library
npm install
npm run build

# Add and commit the new version
pushd scripts
git commit --all --message="$(bash package_version.sh)"
popd

# push the new version to github
git push origin $TMP_BRANCH:master

# publish the module to npm
npm publish
