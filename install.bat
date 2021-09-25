@echo off
ECHO Bot created by PC Jones (based on bot by alfficcadenti) - have fun
ECHO Press any key to start the installation
PAUSE
call npm install
call npm install --save telegram-notify
cd node_modules/puppeteer
call node install
cd ..\..\ 
ECHO Installation complete!