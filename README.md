# Ultimate Splinterlands Bot by PC Jones
A fast, multi-account splinderlands bot

Based on https://github.com/alfficcadenti/splinterlands-bot

## Preamble 
Right now the code is a mess - I just hacked something together so I can release this asap. I'm planning on updating the code soon. 

Feel free to give suggestions for features/code refurbishing via github or on discord/telegram.


## New Features
- Multiple accounts with only one instance
- Login via Email
- Faster Login & Fighting:
- The bot no longer refreshes the page all the time (which often got you blocked from splinterlands for a few minutes)
- The bot clicks away popups
- The bot waits if there is a loading circle from splinterlands
- Disabled requesting the free api because it is always overloaded and slows down the bot (I've supplied a very large history file)
- **Coming Soon**: Better Team Selection - the bot will chose cards with best win rate, not the ones that are most used
- **Coming Soon**: Individual wait time for each account (right now it will battle with all accounts and wait after that)
- **Coming Soon**: Minimum Energy Capture Rate - the bot will pause automatically if the energy capture rate is below a specified percentage
- **Coming Soon**: Option to disable automatic quest reward chest opening
- **Coming Soon**: Statistics on how each account is performing
- Any suggestions?

# Support / Community

[Discord](
https://discord.gg/hwSr7KNGs9)

[Telegram](https://t.me/ultimatesplinterlandsbot) 

## How to install
- Download and install [NodeJs](https://nodejs.org/it/download/)
- Download the [bot](https://github.com/PCJones/ultimate-splinterlands-bot/archive/refs/heads/master.zip) (extract if its .zip)
- Create .env file (see .env-example)
- On windows: Execute `install.bat` in bot folder
- On MacOS/Linux: open terminal in bot folder and execute command `npm install`

## How to start the bot
- On windows: Execute `start.bat` in bot folder
- On MacOS/Linux: open terminal in bot folder and execute command `npm start`

## Bot configuration:

Configuration with default values:

- `QUEST_PRIORITY=true` Disable/Enable quest priority

- `MINUTES_BATTLES_INTERVAL=30` Sleep time before the bot will fight with all accounts again. Subtract 2-3 minutes per account

- `CLAIM_SEASON_REWARD=false` Disable/Enable season reward claiming

- `HEADLESS=true` Disable/Enable headless("visible") browser (e.g. to see where the bot fails)

- `KEEP_BROWSER_OPEN=true` Disable/Enable keeping the browser instances open after fighting. Recommended to have it on true to avoid having each account to login for each fight. Disable if CPU/Ram usage is too high (check in task manager)

- `LOGIN_VIA_EMAIL=false` Disable/Enable login via e-mail adress. See below for further explanation

- `EMAIL=account1@email.com,account2@email.com,account3@email.com` Your login e-mails, each account seperated by comma. Ignore line if `LOGIN_VIA_EMAIL` is `false`

- `ACCUSERNAME=username1,username2,username3` Your login usernames, each account seperated by comma. **Even if you login via email you have to also set the usernames!**

- `PASSWORD=password1,password2,password3` Your login passwords/posting keys. Use password if you login via email, **use the posting key if you login via username**

# Donations

In case you want to donate to me for updating this bot, I would be very happy! Please also consider donating to the original bot creator.

- DEC into the game to the player **pcjones** 
- Bitcoin 3KU85k1HFTqCC4geQz3XUFk84R6uekuzD8
- Ethereum 0xcFE8c78F07e0190EBdD9077cF9d9E3A8DCED8d91 
- Text me on Discord or Telegram for anything other

# FAQ
**Can I have some accounts that login via email and some via username?**

Yes! Config Example:
```
LOGIN_VIA_EMAIL=true
EMAIL=account1@email.com,account2@email.com,username3
ACCUSERNAME=username1,username2,username3
PASSWORD=password1,password2,POST_KEY3
```

**How to extend the newHistory.json without deleting existing data?**

Run `node combine.js` in the data folder to add the data from history.json to the newHistory.json file
