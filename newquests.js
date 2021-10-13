require('dotenv').config()
const misc = require('./misc');
const chalk = require('chalk');
const fetch = require("node-fetch");

async function newquestUpdate (Newquest, claimQuestReward, page, logSummary, allCardDetails, searchFromJSON, newlogvisual){

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
                await claimButton.click();
                misc.writeToLog(chalk.green('Claiming quest reward. This will take 1.7 minutes.'));
                await page.waitForTimeout(60000);
                misc.writeToLog('Checking quest reward chest. Please wait....')
                await page.reload();
                await page.waitForTimeout(10000);

                // added by boart2k
                await fetch('https://api.steemmonsters.io/players/history?username=' + process.env.ACCUSERNAME + '&types=claim_reward', {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })
                .then(response => response.json())
                .then((data) => {
                    let questRewards = JSON.parse(searchFromJSON(data,["data","type"],"quest").result).rewards[0];
                    let questRewardsMessage = "";

                    if(questRewards.type == "potion"){
                        questRewardsMessage = ` Quest Reward: Recieved ${questRewards.quantity} ${questRewards.potion_type == 'gold' ? 'Alchemy' : 'Legendary'} Potion!`;
                        forNLV =  `${questRewards.quantity} ${questRewards.potion_type == 'gold' ? 'Alchemy' : 'Legendary'} Potion`
                        misc.writeToLog( `You recieved ${questRewards.quantity} ${questRewards.potion_type == 'gold' ? 'Alchemy' : 'Legendary'} Potion!` )
                    }

                    if(questRewards.type == 'credits'){
                        questRewardsMessage = ` Quest Reward: Recieved ${questRewards.quantity} Credits!`;
                        forNLV =  questRewards.quantity + ' Credits'
                        misc.writeToLog(`You recieved ${questRewards.quantity} Credits!`);
                    }

                    if (questRewards.type === 'dec'){
                        questRewardsMessage = ` Quest Reward: Recieved ${questRewards.quantity} DEC!`;
                        forNLV =  questRewards.quantity + ' DEC'
                        misc.writeToLog(`You recieved ${questRewards.quantity} DEC!`);
                    }   

                    if(questRewards.type == 'reward_card'){
                        let card_id = questRewards.card.card_detail_id;
                        let cardName = allCardDetails[(parseInt(card_id))-1].name.toString();
                        if(questRewards.card.gold){
                            questRewardsMessage = " Quest Reward: Recieved " + chalk.yellow(`Gold Foil ${cardName}`) + " card!";
                            forNLV = 'Gold foil ' + cardName
                            misc.writeToLog( "You recieved " + chalk.yellow(`Gold Foil ${cardName}`) + " card!");
                        }else{
                            questRewardsMessage = " Quest Reward: Recieved " + chalk.grey(cardName) + " card!";
                            forNLV = cardName
                            misc.writeToLog( "You recieved " + chalk.grey(cardName) + " card!");
                        }
                    }

                    logSummary.push(" " + coloredElement  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.yellow(' Quest reward claimed!') + ' \n' + questRewardsMessage);

                    newlogvisual['Quest'] = coloredElement.replace(/\u001b[^m]*?m/g,"") + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()
                    newlogvisual['Reward'] = forNLV
                })
                .catch(err=>{
                    misc.writeToLog("Failed to get claim rewards information. " + err)
                    logSummary.push(" " + coloredElement  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.yellow(' Quest reward claimed but failed to get claim rewards information.') );  
                    newlogvisual['Quest'] = coloredElement.replace(/\u001b[^m]*?m/g,"") + ' ' + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()
                    newlogvisual['Reward'] = 'Reward claimed, no info'
                });
                // boart2k end



            } 
        }
    } catch (e) {
        misc.writeToLog('Updated Quest Details:' + coloredElement  + " Quest: " + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString());
        logSummary.push(" " + coloredElement  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.red(' No quest reward...'));
        newlogvisual['Quest'] = coloredElement.replace(/\u001b[^m]*?m/g,"") + ' ' + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()
        newlogvisual['Reward'] = 'No quest reward'
    }
}  




exports.newquestUpdate = newquestUpdate;