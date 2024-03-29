# !/bin/bash
if [ "$TRAVIS_BRANCH" = "master" ]
  then
  REPO_PATH=git@github.com:heavyai/heavyai-connector.git
  DOWNLOAD_PATH=build_docs
  COMMIT_USER="heavyai-bot"
  COMMIT_EMAIL="machines@heavy.ai"

  git config --global user.name "${COMMIT_USER}"
  git config --global user.email "${COMMIT_EMAIL}"
  rm -rf ${DOWNLOAD_PATH}
  git clone "${REPO_PATH}" ${DOWNLOAD_PATH}
  
  cd ${DOWNLOAD_PATH}
    npm install
    git checkout package-lock.json
    git fetch --all
    git checkout gh-pages
    git pull --rebase origin master
    npm run build
    npm run clean:docs
    npm run docs:build
    git add docs -f
    CHANGESET=$(git rev-parse --verify HEAD)
    git commit -m "Automated documentation build for changeset ${CHANGESET}."
    git push -f origin gh-pages
  cd ..
  rm -rf ${DOWNLOAD_PATH}
fi
