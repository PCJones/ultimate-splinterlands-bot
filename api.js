const fetch = require('node-fetch');

async function getPossibleTeams(matchDetails) {
	try {
		const response = await fetch(process.env.API_URL + 'get_team/', {
			method: 'post',
			body: JSON.stringify(matchDetails),
			headers: {'Content-Type': 'application/json'}
		});
		const data = await response.json();
		
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