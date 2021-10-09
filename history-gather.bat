@echo off
echo Processing gathering battle data.
PAUSE
call node battlesGetData.js
cd data
call node combine.js
echo Done! Will close window now. 
PAUSE