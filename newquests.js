const misc = require('./misc');
const chalk = require('chalk');

async function newquestUpdate (Newquest, claimQuestReward, page, logSummary){
    try {
        const claimButton =  await page.waitForSelector('#quest_claim_btn', { timeout: 5000, visible: true });
        if (claimButton) {
            if (claimQuestReward) {
                await claimButton.click();
                misc.writeToLog(chalk.green('Claiming quest reward...'));
                logSummary.push(" " + Object.values(Newquests)[1].toString()  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.yellow(' Quest reward claimed!'));
                await page.waitForTimeout(60000);
                await page.reload();
            }
        }
    } catch (e) {
        misc.writeToLog('Updated Quest Details:' + Object.values(Newquest)[1].toString()  + " Quest: " + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString());
        logSummary.push(" " + Object.values(Newquest)[1].toString()  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.red(' No quest reward...'));
    }
}  




exports.newquestUpdate = newquestUpdate;