npm run babel | tee build_output.txt
grep -q -i 'error' build_output.txt
if [ "$?" == "0" ]; then
  exit 1
fi

npm run webpack | tee build_output.txt
grep -q -i 'error' build_output.txt
if [ "$?" == "0" ]; then
  exit 1
fi

rm build_output.txt

