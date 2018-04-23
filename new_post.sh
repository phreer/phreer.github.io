#!/bin/bash
git add .
git commit -m ${1}
git push origin master
git checkout coding-pages
git merge master -m ${1}
git push coding-net-pages coding-pages
git checkout master
