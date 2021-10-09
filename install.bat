@echo off
ECHO Bot created by PC Jones (based on bot by alfficcadenti) - have fun
ECHO Press any key to start the installation
PAUSE
call npm install
call npm update
cd node_modules/puppeteer
if exist .local-chromium (
  cd ..\..\ 
) else (
  call node install
cd ..\..\ 
)
ECHO.
ECHO Installation complete!
ECHO.
:start
SET choice=
SET /p choice=Want to start the bot now? [Y/N]: 
IF NOT '%choice%'=='' SET choice=%choice:~0,1%
IF /i '%choice%'=='Y' GOTO yes
IF /i '%choice%'=='N' GOTO no
IF '%choice%'=='' GOTO no
ECHO "%choice%" is not valid
ECHO.
GOTO start

:no
EXIT

:yes
ECHO Starting bot - have fun!
call start.bat
