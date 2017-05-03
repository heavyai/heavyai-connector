#!/bin/bash
# if [ "$TRAVIS_BRANCH" == "marc/auto_gen_docs" ]; then
  REPO_PATH=git@github.com:mapd/mapd-connector.git
  DOWNLOAD_PATH=build_docs
  COMMIT_USER="Documentation Builder"
  COMMIT_EMAIL="bot@mapd.com"
  CHANGESET=$(git rev-parse --verify HEAD)

  git config user.name "${COMMIT_USER}"
  git config user.email "${COMMIT_EMAIL}"


  git clone -b gh-pages "${REPO_PATH}" ${DOWNLOAD_PATH}
  cd ${DOWNLOAD_PATH}
    rm -rf ${DOWNLOAD_PATH}
    git pull --rebase origin marc/auto_gen_docs
    
    npm run clean:docs
    yarn
    npm run docs:build
    git add docs -f
    git commit -m "Automated documentation build for changeset ${CHANGESET}."
    git push origin gh-pages
  cd ..
  rm -rf ${DOWNLOAD_PATH}
# fi
