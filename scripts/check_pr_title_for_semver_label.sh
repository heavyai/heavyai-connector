#!/bin/bash

# show the command being run
set -x

# tell jenkins to fail if any of the commands fail
set -e

echo PR TITLE: $ghprbPullTitle

# Check the PR title for semver tag
SEM_VER=$(echo $ghprbPullTitle \
    | awk '{print tolower($0)}' \
    | grep -o '\[\(patch\|major\|minor\)\]')
if [[ ${#SEM_VER} > 1 ]]; then
    HAS_SEMVER=true
else
    HAS_SEMVER=false
fi

# print the semver tag
echo BUMP LABEL: $SEM_VER

# Exit with error if no semver tag is present in the pull request
if [ "$HAS_SEMVER" = false ]; then
    echo ERROR: No semver tag specified in this pull request.
    exit 1
fi

