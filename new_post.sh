#!/bin/bash
git add .
git commit -m "new post at $(date)"
git push origin master
git checkout coding-pages
git merge master
git push coidng-net-pages coding-pages
