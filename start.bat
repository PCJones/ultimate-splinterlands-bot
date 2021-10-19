@echo off
echo --------------------------------------------------------------------------
echo Ultimate Splinderlands Bot by PC Jones (Based on bot by alfficcadenti)
echo Join the telegram group https://t.me/ultimatesplinterlandsbot
echo Join the discord server https://discord.gg/hwSr7KNGs9
echo                    Close this window to stop the bot
echo --------------------------------------------------------------------------
:start
SET choice=
SET /p choice=Want to change DNS to googleDNS? [Y/N]: 
IF NOT '%choice%'=='' SET choice=%choice:~0,1%
IF /i '%choice%'=='Y' GOTO yes
IF /i '%choice%'=='N' GOTO no
ECHO "%choice%" is not valid
ECHO.
GOTO start

:no
call node --max-old-space-size=8192 index.js

:yes
ECHO Starting bot - have fun!
call npm config set dns 8.8.4.4
call node --max-old-space-size=8192 index.js
