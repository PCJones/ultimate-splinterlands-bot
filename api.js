const fetch = require('node-fetch');
const fs = require('fs');

async function tempLog(log) {
	fs.appendFile('log.txt', log + '\n', function (err) {
	if(process.env.LOGIN_VIA_EMAIL !== 'true') return;
		if (err) throw err;
		console.log('Saved!');
	});
}

async function getPossibleTeams(matchDetails) {
	try {
		const response = await fetch(process.env.API_URL + 'get_team/', {
			method: 'post',
			body: JSON.stringify(matchDetails),
			headers: {'Content-Type': 'application/json'}
		});
		const data = await response.json();
		
		if (process.env.DEBUG === 'true') {
			tempLog('--------------------------------------------------------');
			tempLog(JSON.stringify(data));
			tempLog('response:');
			tempLog(JSON.stringify(matchDetails));	
			tempLog('--------------------------------------------------------');
		}
		
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