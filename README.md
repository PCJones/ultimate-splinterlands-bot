# Ultimate Splinterlands Bot by PC Jones
A fast, multi-account splinderlands bot

Based on https://github.com/alfficcadenti/splinterlands-bot

## How to install
- Download and install [NodeJs](https://nodejs.org/it/download/)
- Download the bot (extract if its .zip)
- Create .env file (see .env-example)
- On windows: Execute `install.bat` in bot folder
- On MacOS/Linux: open terminal in bot folder and execute command `npm install`

## How to start the bot
- On windows: Execute `start.bat` in bot folder
- On MacOS/Linux: open terminal in bot folder and execute command `npm start`

### Bot configuration:

The BOT will make a battle every 30 minutes by default, you can change the custom value specifying in the .env the variable `MINUTES_BATTLES_INTERVAL`.

Configuration with default values:

- `QUEST_PRIORITY=true` Disable/Enable quest priority

- `MINUTES_BATTLES_INTERVAL=30` Sleep time before the bot will fight with all accounts again

- `CLAIM_SEASON_REWARD=false` Disable/Enable season reward claiming

- `HEADLESS=true` Disable/Enable headless("visible") browser (e.g. to see where the bot fails)

- `KEEP_BROWSER_OPEN=true` Disable/Enable keeping the browser instance open after fighting. Recommended to have it on true to avoid having each account to login for each fight. Disable if CPU/Ram usage is too high (check in task manager)

- `LOGIN_VIA_EMAIL=false` Disable/Enable login via e-mail adress. See below for further explanation

- `EMAIL=account1@email.com,account2@email.com,account3@email.com` Your login e-mails, each account seperated by comma. Ignore line if `LOGIN_VIA_EMAIL` is `false`

- `USERNAME=username1,username2,username3` Your login usernames, each account seperated by comma. Ignore line if `LOGIN_VIA_EMAIL` is `true`

- `PASSWORD=password1,password2,password3` Your login passwords/posting keys. Use password if you login via email, **use the posting key if you login via username**


# Support / Community

[Discord](
https://discord.gg/hwSr7KNGs9)

[Telegram](https://t.me/ultimatesplinterlandsbot) 

# Donations

In case you want to donate to me for updating this bot, I would be very happy! Please also consider donating to the original bot creator.

- DEC into the game to the player **pcjones** 
- Bitcoin 3KU85k1HFTqCC4geQz3XUFk84R6uekuzD8
- Ethereum 0xcFE8c78F07e0190EBdD9077cF9d9E3A8DCED8d91 
- Text me on Discord or Telegram for anything other

