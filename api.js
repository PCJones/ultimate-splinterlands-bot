const fetch = require('cross-fetch');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

async function tempLog(log) {
	fs.appendFile('log.txt', log + '\n', function (err) {
		//console.log('LogError', log);
	});
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function response (matchDetails){
	const response = await fetch(process.env.API_URL + 'get_team/', {
		method: 'post',
		body: JSON.stringify(matchDetails),
		headers: {'Content-Type': 'application/json'}
	});
	return response.text()
}

async function getPossibleTeams(matchDetails) {
	try {		
		let dataRaw = await response(matchDetails);
		if (process.env.DEBUG === 'true') {
			tempLog('--------------------------------------------------------');
			tempLog(JSON.stringify(matchDetails));	
			tempLog('response:');
			tempLog(dataRaw);
			tempLog('--------------------------------------------------------');
		}
		let apiResponseCounter = 0;
    	while (JSON.stringify(dataRaw).includes('hash')) {
        	readline.cursorTo(process.stdout, 0); 
            console.log(chalk.yellow(' Waiting 30 seconds for API to calculate team...'));
            await sleep(30000);
            dataRaw =  await response(matchDetails);
            if (++apiResponseCounter >= 4) break;
            }
                 
		const data = JSON.parse(dataRaw);		

		return data;
	} catch(e) {
        console.log('API Error', e);
    }
	
	return false;
}

async function reportLoss(username) {
	fetch(process.env.API_URL + 'report_loss/' + username + "/" + process.env.ACCUSERNAME.split('@')[0]);
}

exports.getPossibleTeams = getPossibleTeams;
exports.reportLoss = reportLoss;