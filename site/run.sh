#sudo mongod --fork --logpath /var/log/mongod.log --dbpath /home/ec2-user/data
#sudo mongod --dbpath /home/ec2-user/data --shutdown
forever stopall
forever start app.js

