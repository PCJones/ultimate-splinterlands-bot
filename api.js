const fetch = require('node-fetch');


async function getPossibleTeams(matchDetails) {
	const response = await fetch('http://localhost/buy/', {
		method: 'post',
		body: JSON.stringify(matchDetails),
		headers: {'Content-Type': 'application/json'}
	});
	const data = await response.json();
	
	return data;
}

exports.getPossibleTeams = getPossibleTeams;