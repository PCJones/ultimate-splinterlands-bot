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

exports.getPossibleTeams = getPossibleTeams;