result=`ps aux | grep -i "alert-processor.js $1" | grep -v "grep" | wc -l`
if [ $result -ge 1 ]
   then
        echo "script is running"
   else
        /home/ec2-user/node-v6.9.1-linux-x64/bin/node /home/ec2-user/ralentage-alerts/alert-processor.js $1
fi
