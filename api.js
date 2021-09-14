const fetch = require('node-fetch');
const fs = require('fs');

async function tempLog(log) {
	fs.appendFile('log.txt', log + '\n', function (err) {
		//console.log('LogError', log);
	});
}

async function getPossibleTeams(matchDetails) {
	try {
		const response = await fetch(process.env.API_URL + 'get_team/', {
			method: 'post',
			body: JSON.stringify(matchDetails),
			headers: {'Content-Type': 'application/json'}
		});
		
		var dataRaw = await response.text();
		
		if (process.env.DEBUG === 'true') {
			tempLog('--------------------------------------------------------');
			tempLog(JSON.stringify(matchDetails));	
			tempLog('response:');
			tempLog(dataRaw);
			tempLog('--------------------------------------------------------');
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