#!/bin/sh

chmod +x /usr/local/bin/wait-for-it.sh

/usr/local/bin/wait-for-it.sh mysql:3306
/usr/local/bin/wait-for-it.sh rabbitmq:5672
/usr/local/bin/wait-for-it.sh redis:6379

npm start