require('dotenv').config()
if (process.env.TELEGRAM_NOTIF === 'true'){
const fs = require('fs')
const chalk = require('chalk');
const TeleBot = require('telebot');
const bot = new TeleBot({
    token: process.env.TELEGRAM_TOKEN, // Required. Telegram Bot API token.
    polling: {
        proxy: ''
    } 
});
function startTG() {
    return bot.start();
}


async function battlesummary(logSummary,tet,sleepingTime){
    try {
            message = 'Battle result summary: \n' + " " + new Date().toLocaleString() + ' \n' + tet.replace(/\u001b[^m]*?m/g,"") + ' \n';
            for (let i = 0; i < logSummary.length; i++) {
                message = message + logSummary[i].replace(/\u001b[^m]*?m/g,"") +' \n';
            }
            message = message + ' \n' + ' Next battle in '+ sleepingTime / 1000 / 60 + ' minutes at ' + new Date(Date.now() +sleepingTime).toLocaleString() + ' \n';

            message = message + ' \n' +'Telegram https://t.me/ultimatesplinterlandsbot' + ' \n' + 'Discord https://discord.gg/hwSr7KNGs9'
            const max_size = 4096
            var messageString = message
            var amount_sliced = messageString.length / max_size
            var start = 0
            var end = max_size
            if (amount_sliced>1) {
                for (let i = 0; i < amount_sliced; i++) {
                    message = messageString.slice(start, end) 
                    await bot.sendMessage(process.env.TELEGRAM_CHATID, message)
                    start = start + max_size
                    end = end + max_size
                }
            } else {
                await bot.sendMessage(process.env.TELEGRAM_CHATID, message)
            }
            //notify.send(message);
            console.log(chalk.green(' \n' + ' Battle result sent to telegram'));

        } catch (e) {
                console.log(chalk.red(' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.'));
                bot.sendMessage(ChatId, ' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.');
                return;
        }   
        message = '';	
}

function sender (logMessage) {  
    bot.sendMessage(process.env.TELEGRAM_CHATID, logMessage); 
    //notify.send(logMessage);
    logMessage= '';
   return 
}

module.exports.startTG = startTG;
exports.sender =sender; 
exports.battlesummary = battlesummary;
}