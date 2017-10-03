sudo mongod --fork --logpath /var/log/mongod.log --dbpath /home/ec2-user/data
forever stopall
forever start app.js

