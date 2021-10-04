const fs = require('fs')
const chalk = require('chalk');
const TeleBot = require('telebot');
const bot = new TeleBot({
    token: process.env.TELEGRAM_TOKEN, // Required. Telegram Bot API token.
    polling: {
        proxy: ''
    } 
});
bot.start();


function battlesummary(logSummary,tet,sleepingTime){
    try {
            message = 'Battle result summary: \n' + " " + new Date().toLocaleString() + ' \n' + tet.replace(/\u001b[^m]*?m/g,"") + ' \n';
            for (let i = 0; i < logSummary.length; i++) {
                message = message + logSummary[i].replace(/\u001b[^m]*?m/g,"") +' \n';
            }
            message = message + ' \n' + ' Next battle in '+ sleepingTime / 1000 / 60 + ' minutes at ' + new Date(Date.now() +sleepingTime).toLocaleString() + ' \n';

            message = message + ' \n' +'Telegram https://t.me/ultimatesplinterlandsbot' + ' \n' + 'Discord https://discord.gg/hwSr7KNGs9'
            bot.sendMessage(process.env.TELEGRAM_CHATID, message);
            //notify.send(message);
            console.log(chalk.green(' \n' + ' Battle result sent to telegram'));

        } catch (e) {
                console.log(chalk.red(' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.'));
                bot.sendMessage(ChatId, ' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.');
        }   
        message = '';	
}

function sender (logMessage) {  
    bot.sendMessage(process.env.TELEGRAM_CHATID, logMessage); 
    //notify.send(logMessage);
    logMessage= '';
   return 
}

bot.on(['/start'], (msg) => {
    //console.log(msg);
    message = ' /checkenv - to check current env setting. \n' +
              ' /battledata - To see the battle details (battle rule, summoner, monster used) \n'  +
              ' /clearbattledata - To clear currently stored battle data.  \n'       
      bot.sendMessage(msg.from.id, message);
});

bot.on(['/battledata', '/clearbattledata'], (msg) => {  
    const command = msg.text
    if (fs.existsSync('./data/BattleHistoryData.json')) {
        fs.readFile('./data/BattleHistoryData.json','utf8',(err, rawStoredData) => {
            if (err) {
                misc.writeToLog(`Error reading file from disk: ${err}`); rej(err)
            } else {
                let storedData = JSON.parse(rawStoredData);
                if (command === '/battledata') {
                    if (storedData == "") {
                       bot.sendMessage(msg.from.id, 'No battle data yet.');
                    } else {
                        let message = 'Battle Data summary: \n' + ' \n';
                        for (let i = 0; i < storedData.length; i++) {
                              message = message + storedData[i].replace(/\u001b[^m]*?m/g,"") +' \n';
                        }
                        message = message + ' \n' + ' Please see full battle details in log.';
                        bot.sendMessage(msg.from.id, message);
                        message = '';
                    } 
                } else if (command === '/clearbattledata') {
                    fs.unlink('./data/BattleHistoryData.json', (err => {
                        if (err) console.log(err) , bot.sendMessage(msg.from.id, 'Error occured while deleting stored battle data. Please see log for details');
                        else {
                            bot.sendMessage(msg.from.id, 'Stored battle data cleared.');
                        }
                      }));
                }    
            }   
        });
    } else {
        bot.sendMessage(msg.from.id, 'No Battle data yet stored.' );
    }   
});  


async function tbotResponse(envStatus) {
  

    bot.on(['/checkenv'], (msg) => {
        message = '.ENV Setting status: \n' + ' \n';
        for (let i = 0; i < envStatus.length; i++) {
            message = message + envStatus[i].replace(/\u001b[^m]*?m/g,"") + ' \n';   
        }    
          bot.sendMessage(msg.from.id, message);
    });   


}
 
  
    
  

exports.sender =sender; 
exports.battlesummary = battlesummary;
exports.tbotResponse = tbotResponse;

