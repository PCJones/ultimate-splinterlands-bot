require('dotenv').config()
const misc = require('./misc');
const chalk = require('chalk');
const fetch = require("cross-fetch");
const axios = require('axios');
const readline = require('readline');

  


async function newquestUpdate (Newquest, claimQuestReward, page, logSummary, allCardDetails, newlogvisual){

    const questElement = Object.values(Newquest)[1].toString();
    if (questElement === "life") {
        coloredElement = chalk.white("Life");
    } else if (questElement === "water")  {
        coloredElement =chalk.cyanBright("Water");
    } else if (questElement === "earth")  {
        coloredElement = chalk.green("Earth");
    } else if (questElement === "fire")  {
        coloredElement =chalk.red("Fire");
    } else if (questElement === "death")  {
        coloredElement =chalk.magenta("Death");
    } else if (questElement === "dragon")  {
        coloredElement =chalk.yellow("Dragon");
    } else if (questElement === "neutral")  {
        coloredElement =chalk.grey("Neutral");
    } else if (questElement === "sneak")  {
        coloredElement =chalk.grey("Sneak");
    }else if (questElement === "snipe")  {
        coloredElement =chalk.grey("Snipe");
    }

    try {
        const claimButton =  await page.waitForSelector('#quest_claim_btn', { timeout: 5000, visible: true });
        if (claimButton) {
            if (claimQuestReward) {
                var twirlTimer = (function() {
                    var P = ["Please wait |", "Please wait /", "Please wait -", "Please wait \\"];
                    var x = 0;
                    return setInterval(function() {
                      process.stdout.write("\r" + P[x++]);
                      x &= 3;
                    }, 250); })();

                await claimButton.click();
                readline.cursorTo(process.stdout, 0);
                misc.writeToLog(chalk.green('Claiming quest reward. This will take 1.7 minutes.'));
                await page.waitForTimeout(60000);
                readline.cursorTo(process.stdout, 0);
                misc.writeToLog('Checking quest reward chest. Please wait....')
                await page.reload();
                await page.waitForTimeout(30000);

                // added by boart2k
                await fetch(`https://api.steemmonsters.io/players/history?username=${process.env.ACCUSERNAME}&types=claim_reward`, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })
                .then(response => response.json())
                .then((data) => {
                    const generalResult = Object.values(JSON.parse(Object.values(data[0])[11]).rewards) // general result
                    let detailer1 = [];
                    let forlogVisual = []
                    let message1 = ' Daily rewards claimed: \n'
                    let forNLV = ''
                        for (let i = 0; i < generalResult.length; i++) {
                            rewardcard = Object.values(generalResult[i])[0]
                            if (rewardcard === 'reward_card'){
                                cardNumber = Object.values(Object.values(generalResult[i])[2])[1]
                                goldFoil = Object.values(Object.values(generalResult[i])[2])[3]
                                if (goldFoil == false ) {
                                    detailer1.push(' Received ' + allCardDetails[(parseInt(cardNumber))-1].name.toString() + " card")
                                } else {
                                    detailer1.push(' Received GoldFoil' + allCardDetails[(parseInt(cardNumber))-1].name.toString() + " card")
                                } 
                            } else if (rewardcard === 'potion'){
                                detailer1.push(' Received' + Object.values(generalResult[i])[2] + ' Potion Qty: ' + Object.values(generalResult[i])[1])
                            } else if (rewardcard === 'dec'){
                                detailer1.push(' Received' + Object.values(generalResult[i])[1] + ' DEC')
                            } else if (rewardcard === 'credits'){ 
                                detailer1.push(' Received' + Object.values(generalResult[i])[1] + ' Credits')
                            }
                        }

                        for (let i = 0; i < detailer1.length; i++) {
                            message1 = message1 + detailer1[i] +' \n';
                            forlogVisual.push({['Daily quest rewards :'] : detailer1[i]})
                            forNLV = forNLV + detailer1[i] +' \n';
                        }                        
                    clearInterval(twirlTimer);
                    readline.cursorTo(process.stdout, 0);
                    console.table(forlogVisual)
                    logSummary.push(" " + coloredElement  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.yellow(' Quest reward claimed!') + ' \n' + message1);
                    newlogvisual['Quest'] = coloredElement.replace(/\u001b[^m]*?m/g,"") + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()
                    newlogvisual['Reward'] = forNLV
                })
                .catch(err=>{
                    clearInterval(twirlTimer);
                    readline.cursorTo(process.stdout, 0);
                    misc.writeToLog("Failed to get claim rewards information. " + err)
                    logSummary.push(" " + coloredElement  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.yellow(' Quest reward claimed but failed to get claim rewards information.') );  
                    newlogvisual['Quest'] = coloredElement.replace(/\u001b[^m]*?m/g,"") + ' ' + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()
                    newlogvisual['Reward'] = 'Reward claimed, no info'
                });
                // boart2k end

            } 
        }
    } catch (e) {
        readline.cursorTo(process.stdout, 0);
        misc.writeToLog('Updated Quest Details:' + coloredElement  + " Quest: " + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString());
        logSummary.push(" " + coloredElement  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.red(' No quest reward...'));
        newlogvisual['Quest'] = coloredElement.replace(/\u001b[^m]*?m/g,"") + ' ' + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()
        newlogvisual['Reward'] = 'No quest reward'
    }
}  

async function seasonQuest (page, logSummary, allCardDetails, seasonRewards){
    function makeGetRequest(path) {
        return new Promise(function (resolve, reject) {
            axios.get(path).then(
                (response) => {
                    var result = response.data;
                    resolve(result);
                },
                    (error) => {
                    reject(error);
                }
            );
        });
      }

    if (JSON.parse(process.env.CLAIM_SEASON_REWARD.toLowerCase()) == true) {
        try {
            misc.writeToLog('Season reward check: ');
            var twirlTimer = (function() {
                var P = ["Please wait |", "Please wait /", "Please wait -", "Please wait \\"];
                var x = 0;
                return setInterval(function() {
                  process.stdout.write("\r" + P[x++]);
                  x &= 3;
                }, 250); })();

            const seasonClaimButton = await page.waitForSelector('#claim-btn.reward_claim_btn', {
                visible: true,
                timeout: 5000
            })
                await seasonClaimButton.click().then(() => {
                readline.cursorTo(process.stdout, 0);
                misc.writeToLog('Season reward button clicked.')});
                readline.cursorTo(process.stdout, 0);
                misc.writeToLog('Claiming the season reward. Please Wait... ');
                await page.waitForTimeout(100000);
                await page.reload();

                const data = await makeGetRequest('https://api.steemmonsters.io/players/history?username=' + process.env.ACCUSERNAME + '&types=claim_reward')
                            try{
                                const generalResult = Object.values(JSON.parse(Object.values(data[0])[11]).rewards) // general result
                                let detailer1 = [];
                                let forVisual = []
                                let message1 = ' Season rewards claimed: \n'
                                for (let i = 0; i < generalResult.length; i++) {
                                    rewardcard = Object.values(generalResult[i])[0]
                                    if (rewardcard === 'reward_card'){
                                        cardNumber = Object.values(Object.values(generalResult[i])[2])[1]
                                        goldFoil = Object.values(Object.values(generalResult[i])[2])[3]
                                        if (goldFoil == false ) {
                                            detailer1.push(' received card: ' + allCardDetails[(parseInt(cardNumber))-1].name.toString())
                                        } else {
                                            detailer1.push(' received card: GoldFoil' + allCardDetails[(parseInt(cardNumber))-1].name.toString())
                                        } 
                                    } else if (rewardcard === 'potion'){
                                        detailer1.push(' received ' + Object.values(generalResult[i])[2] + ' Potion Qty: ' + Object.values(generalResult[i])[1])
                                    } else if (rewardcard === 'dec'){
                                        detailer1.push(' received DEC Qty: ' + Object.values(generalResult[i])[1])
                                    } else if (rewardcard === 'credits'){ 
                                        detailer1.push(' received Credits Qty: ' + Object.values(generalResult[i])[1])
                                    }
                                }
                   
                                    for (let i = 0; i < detailer1.length; i++) {
                                        message1 = message1 + detailer1[i] +' \n';
                                        seasonRewards.push({['Season rewards claimed:'] : process.env.ACCUSERNAME + detailer1[i]})
                                        forVisual.push({['Season rewards claimed:'] : detailer1[i]})
                                    }
                                    clearInterval(twirlTimer);
                                    readline.cursorTo(process.stdout, 0); 
                                    logSummary.push(message1)
                                    console.table(forVisual)
                            } catch {
                                clearInterval(twirlTimer);
                                readline.cursorTo(process.stdout, 0);
                                logSummary.push(' ' + Object.values(data1)[8] + ' \n')   
                                misc.writeToLog('Unabled to get details of season rewards, but you can still check your data here https://peakmonsters.com/@' + process.env.ACCUSERNAME + '/explorer');
                            }             
        } catch (e) {
            clearInterval(twirlTimer);
            readline.cursorTo(process.stdout, 0);
            misc.writeToLog('no season reward to be claimed');
        }
   
    }
}


exports.seasonQuest = seasonQuest;
exports.newquestUpdate = newquestUpdate;