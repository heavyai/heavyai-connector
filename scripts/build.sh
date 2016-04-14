npm run babel | tee build.log
if [ "${PIPESTATUS[0]}" != "0" ]; then exit 1; fi

npm run webpack | tee build.log
if [ "${PIPESTATUS[0]}" != "0" ]; then exit 1; fi

