require('dotenv').config()
const battles = require('./auto-gather');
const chalk = require('chalk');
const fs = require('fs');


const sleepingTimeInMinutes = process.env.MINUTES_GATHER_INTERVAL || 30;
const sleepingTime = sleepingTimeInMinutes * 60000;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}

(async () => {
	try {
		const accountusers = process.env.ACCOUNT.split(',');
		const accounts = accountusers;
		console.log(' Loaded ' + chalk.yellow(accounts.length) + ' Accounts')
		console.log(' Accounts: ' + chalk.greenBright(accounts))
    
    while (true) {
	console.time('Total processing time')
    	for (let i = 0; i < accounts.length; i++) {
				console.time('Processing time')
				await sleep(1000);
			if (fs.existsSync(`./${process.env.FILE_NAME}`)){
				let  fileSizeInMegabytes = (await getFilesizeInBytes(`${process.env.FILE_NAME}`) / 1024) // *1024)
				if (fileSizeInMegabytes > process.env.SIZE_LIMIT) {
					process.stdout.clearLine()
     				process.stdout.cursorTo(0);
					console.log('Max size reach. Stop process.')
					process.exit();
				} 
				process.stdout.clearLine()
     			process.stdout.cursorTo(0);
				console.log(' \n' + 'current Data size: ' + fileSizeInMegabytes.toString().split('.')[0] + 'KB')
			}
			process.env['ACCOUNT'] = accountusers[i];
			console.log('processing ' + (accountusers.indexOf(process.env.ACCOUNT) + 1) + ' of ' + accounts.length)
			console.log('Gathering battles of: '+chalk.green(accountusers[i]))
			await battles.battlesList(accountusers[i]).then(x=>x).catch((e) => console.log('Unable to gather data for local.' + e));  
			console.timeEnd('Processing time')
		}
	console.timeEnd('Total processing time')
	console.log('Waiting for the next gather in', sleepingTime / 1000 / 60, ' minutes at ', new Date(Date.now() + sleepingTime).toLocaleString());
	await sleep(sleepingTime);
    }
	} catch (e) {
    console.log(' Routine error at: ', new Date().toLocaleString(), e)
  }

})()