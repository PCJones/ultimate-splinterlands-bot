const misc = require('./misc');
const chalk = require('chalk');

function newquestUpdate (Newquest,logSummary){
    try {
        let claimButton =  page.waitForSelector('#quest_claim_btn', { timeout: 2500, visible: true });
        if (claimButton) {
            misc.writeToLog(chalk.green('Claiming quest reward...'));
            if (claimQuestReward) {
                 claimButton.click().then(()=>logSummary.push(" " + Object.values(Newquest)[1].toString()  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.Green(' Quest reward claimed!')), 60000).then(()=>page.reload());
            }
        }
    } catch (e) {
        misc.writeToLog('Updated Quest Details:' + Object.values(Newquest)[1].toString()  + " Quest: " + Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString());
        logSummary.push(" " + Object.values(Newquest)[1].toString()  + " Quest: " + chalk.yellow(Object.values(Newquest)[3].toString() + "/" + Object.values(Newquest)[2].toString()) + chalk.red(' No quest reward...'));
    }
}  
exports.newquestUpdate = newquestUpdate;