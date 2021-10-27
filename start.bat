@echo off
echo --------------------------------------------------------------------------
echo Ultimate Splinderlands Bot by PC Jones (Based on bot by alfficcadenti)
echo Join the telegram group https://t.me/ultimatesplinterlandsbot
echo Join the discord server https://discord.gg/hwSr7KNGs9
echo                    Close this window to stop the bot
echo --------------------------------------------------------------------------
ECHO.
ECHO 1. Cloudflare 1.1.1.1
ECHO 2. Cloudflare 1.0.0.1
ECHO 3. Google 8.8.8.8
ECHO 4. Google 8.8.4.4
ECHO 5. Quad9 9.9.9.9
ECHO 6. Quad9 149.112.112.112
ECHO 7. Don't use a DNS
ECHO c. Cancel
ECHO.
ECHO please note that all of this are public DNS which is free and trusted. 
ECHO.
:start
SET choice=
SET /p choice=Please choose the number you wish to use for DNS: 

if not '%choice%'=='' set choice=%choice:~0,1%
if '%choice%'=='1' goto Cloud1
if '%choice%'=='2' goto Cloud2
if '%choice%'=='3' goto Google1
if '%choice%'=='4' goto Google2
if '%choice%'=='5' goto Quad1
if '%choice%'=='6' goto Quad2
if '%choice%'=='7' goto normal
if /i '%choice%'=='c' GOTO cancelled

ECHO "%choice%" is not valid, try again
ECHO.

GOTO start
:Cloud1
ECHO Bot will use Cloudflare 1.1.1.1 for DNS
call npm config set dns 1.1.1.1
call node --max-old-space-size=8192 index.js
exit
:Cloud2
ECHO Bot will use Cloudflare 1.0.0.1 for DNS
call npm config set dns 1.0.0.1
call node --max-old-space-size=8192 index.js
exit
:Google1
ECHO Bot will use Google 8.8.8.8 for DNS
call npm config set dns 8.8.8.8
call node --max-old-space-size=8192 index.js
exit
:Google2
ECHO Bot will use Google 8.8.4.4 for DNS
call npm config set dns 8.8.4.4
call node --max-old-space-size=8192 index.js
exit
:Quad1
ECHO Bot will use Quad9 9.9.9.9 for DNS
call npm config set dns 9.9.9.9
call node --max-old-space-size=8192 index.js
exit
:Quad2
ECHO Bot will use Quad9 149.112.112.112 for DNS
call npm config set dns 149.112.112.112
call node --max-old-space-size=8192 index.js
exit
:normal
ECHO Bot will use normal connection set up.
call node --max-old-space-size=8192 index.js
exit
:cancelled
ECHO Cancelling bot startup
ECHO.
Pause