#!/bin/bash

# Loop over the log and check for the newest semver tag
i=0;
while read commit; do

    i=$(($i+1))

    # Parse the commit
    HASH=`echo $commit | cut -d '|' -f1`
    MESSAGE=`echo $commit | cut -d '|' -f2`

    # Print out the commit
    echo $i. $'\t' $HASH $MESSAGE

    # Check the commit for semver tag
    SEM_VER=$(echo $MESSAGE \
            | grep -o '\[\(patch\|major\|minor\)\]')

    # Set semver tag to variable
    if [ "$SEM_VER" ]; then
        SEM_VER_TAG=$(echo $SEM_VER \
            | grep -o '\(patch\|major\|minor\)')
        break
    fi

done < <( git log --pretty="%H|%B" )

#print the variable
echo $SEM_VER_TAG

