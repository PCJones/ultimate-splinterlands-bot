require('dotenv').config()
const misc = require('./misc');
const chalk = require('chalk');
const axios = require('axios');
const readline = require('readline');

async function clickOnElement(page, selector, timeout = 20000, delayBeforeClicking = 0) {
    try {
        const elem = await page.waitForSelector(selector, {
                timeout: timeout
            });
        if (elem) {
            await sleep(delayBeforeClicking);
            misc.lineToLog('Clicking element ' + selector);
            await elem.click().then(()=>misc.clearliners());
            return true;
        }
    } catch (e) {
        misc.clearliners()
    }
    return false;
}
async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function makeGetRequest(path,setTimeOut) {
    return new Promise(function (resolve, reject) {
        axios.get(path, {timeout: setTimeOut}).then(
            (response) => {
                resolve(response.data);
            },
                (error) => {
                reject(error);
            }
        );
    });
  }

async function getRewardsDetails(rewardType){
    let api= ['splinterlands','steemmonsters']
    let counter = 0;
    var apiURL = api[0];
    while(true){
        var data = await makeGetRequest(`https://api.${apiURL}.io/players/history?username=${process.env.ACCUSERNAME}&types=claim_reward`,10000)
        .then(data=>data[0]).catch(()=>false)
            if (data!=false && JSON.parse(data.data).type == rewardType) break;
                await sleep(10000);
            if (++counter>2) apiURL = api[1];
            if (++counter>4) {
                data = '';
                break;
            }
        }
    return data
}  
  
async function openChestReward(page, timeout){
    await page.waitForSelector('button#btnCloseOpenPack.new-button', {visible: true,timeout: timeout}).then(async()=>{ 
        let i=1
        while(true){
           const clickChest = await page.waitForXPath(`//*[@id="open_pack_dialog"]/div/div/div[1]/div/div[${i}]`, {timeout: 1000}).then(button => button.click()).catch(()=>false)
           if (clickChest == false ) break;
           i++;
        } 
    await page.reload()}).catch(async()=> await page.reload())
}

async function newquestUpdate (Newquest, claimQuestReward, page, logSummary, allCardDetails, newlogvisual, powerThreshold, powerRaw){

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
            if (claimQuestReward == true && powerRaw > powerThreshold) {
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
                await openChestReward(page, 60000)
                readline.cursorTo(process.stdout, 0);
                misc.writeToLog('Checking quest reward chest. Please wait....')
                await page.waitForTimeout(100000);

                await getRewardsDetails("quest").then(async data=>{
                    let detailer1 = [];
                    let forlogVisual = [];
                    let message1 = ' Daily rewards claimed: ';
                    let forNLV = '';
                    if (data && data.success== true){
                        const generalResult = JSON.parse(data.result).rewards // general result
                            for (let i = 0; i < generalResult.length; i++) {
                                rewardcard = generalResult[i].type
                                if (rewardcard === 'reward_card'){
                                    cardNumber = generalResult[i].card.card_detail_id
                                    goldFoil = generalResult[i].card.gold
                                    if (goldFoil == false ) {
                                        detailer1.push(`${allCardDetails[(parseInt(cardNumber))-1].name.toString()} card`)
                                    } else {
                                        detailer1.push(`GoldFoil ${allCardDetails[(parseInt(cardNumber))-1].name.toString()} card`)
                                    } 
                                } else if (rewardcard === 'potion'){
                                    detailer1.push(`${generalResult[i].potion_type} Potion Qty: ${generalResult[i].quantity}`)
                                } else if (rewardcard === 'dec'){
                                    detailer1.push(`${generalResult[i].quantity} DEC`)
                                } else if (rewardcard === 'credits'){ 
                                    detailer1.push(`${generalResult[i].quantity} Credits`)
                                }
                            }

                            for (let i = 0; i < detailer1.length; i++) {
                                message1 = message1 + detailer1[i] +' \n';
                                forlogVisual.push({['Daily quest rewards :'] : detailer1[i]})
                                if (detailer1.length>1){
                                    forNLV = forNLV.concat(`${detailer1[i]},`);
                                } else {
                                    forNLV = detailer1[i]
                                }
                            }

                    } else if (data && data.success!=true) {
                        data.error  
                        forlogVisual.push({['Daily quest rewards :'] : data.error })
                        forNLV = data.error;
                    } else if (!data){
                        throw new Error ('Error on getting rewards data.');
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

            } else {
                if (powerRaw > powerThreshold) {
                    misc.writeToLog('Updated Quest Details:' + coloredElement  + " Quest: " + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString());
                    misc.writeToLog('Unable to claim reward, below set power threshold.');
                    logSummary.push(" " + coloredElement  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.red(' Unable to claim reward, below set power threshold.'));
                    newlogvisual['Quest'] = coloredElement.replace(/\u001b[^m]*?m/g,"") + ' ' + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()
                    newlogvisual['Reward'] = 'Unable to claim reward, below set power threshold.'
                }
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
                await openChestReward(page, 120000).then(async()=>await page.waitForTimeout(60000))

                            try{
                                const data = await getRewardsDetails("league_season");
                                let detailer1 = [];
                                let forVisual = []
                                let message1 = ' Season rewards claimed: \n'
                                if (data && data.success== true){  
                                        const generalResult = JSON.parse(data.result).rewards // general result
                                        for (let i = 0; i < generalResult.length; i++) {
                                            rewardcard = generalResult[i].type
                                            if (rewardcard === 'reward_card'){
                                                cardNumber = generalResult[i].card.card_detail_id
                                                goldFoil = generalResult[i].card.gold
                                                if (goldFoil == false ) {
                                                    detailer1.push(` Received card: ${allCardDetails[(parseInt(cardNumber))-1].name.toString()}`)
                                                } else {
                                                    detailer1.push(` Received card: GoldFoil ${allCardDetails[(parseInt(cardNumber))-1].name.toString()}`)
                                                } 
                                            } else if (rewardcard === 'potion'){
                                                detailer1.push(` Received ${generalResult[i].potion_type} Potion Qty: ${generalResult[i].quantity}`)
                                            } else if (rewardcard === 'dec'){
                                                detailer1.push(` Received DEC Qty: ${generalResult[i].quantity}`)
                                            } else if (rewardcard === 'credits'){ 
                                                detailer1.push(` Received Credits Qty: ${generalResult[i].quantity}`)
                                            }
                                        }
                                            for (let i = 0; i < detailer1.length; i++) {
                                                message1 = message1 + detailer1[i] +' \n';
                                                seasonRewards.push({['Season rewards claimed:'] : process.env.ACCUSERNAME + detailer1[i]})
                                                forVisual.push({['Season rewards claimed:'] : detailer1[i]})
                                            }
                                } else if (data && data.success!=true) { 
                                    seasonRewards.push({['Season rewards claimed:'] : process.env.ACCUSERNAME + data.error})
                                    forVisual.push({['Season rewards claimed:'] : data.error}) 
                                } else if (!data){
                                    throw new Error ('Error on getting rewards data.');
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