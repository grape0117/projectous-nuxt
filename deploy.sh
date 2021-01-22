#!/bin/sh
npm run build
/usr/bin/rsync -av dist/ projectous@138.68.223.53:/var/www/testing/

