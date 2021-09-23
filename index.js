//'use strict';
require('dotenv').config()
const puppeteer = require('puppeteer');
const fetch = require("node-fetch");
const chalk = require('chalk');
const Telegram = require('telegram-notify');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./user');
const card = require('./cards');
const helper = require('./helper');
const quests = require('./quests');
const ask = require('./possibleTeams');
const api = require('./api');
const misc = require('./misc');
const version = 0.41;



async function checkForUpdate() {
	await misc.writeToLogNoUsername('------------------------------------------------------------------------------------------------');
	await fetch('http://jofri.pf-control.de/prgrms/splnterlnds/version.txt')
	.then(response=>response.json())
	.then(newestVersion=>{ 
		if (newestVersion > version) {
			misc.writeToLogNoUsername('New Update! Please download on https://github.com/PCJones/ultimate-splinterlands-bot');
			misc.writeToLogNoUsername('New Update! Please download on https://github.com/PCJones/ultimate-splinterlands-bot');
			misc.writeToLogNoUsername('New Update! Please download on https://github.com/PCJones/ultimate-splinterlands-bot');
		} else {
			misc.writeToLogNoUsername('No update available');
		}
	})
	misc.writeToLogNoUsername('------------------------------------------------------------------------------------------------');
}

async function checkForMissingConfigs() {
	if (!process.env.TELEGRAM_NOTIF) {
		misc.writeToLogNoUsername("Missing TELEGRAM_NOTIF parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	if (!process.env.LOGIN_VIA_EMAIL) {
		misc.writeToLogNoUsername("Missing LOGIN_VIA_EMAIL parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	if (!process.env.HEADLESS) {
		misc.writeToLogNoUsername("Missing HEADLESS parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	if (!process.env.KEEP_BROWSER_OPEN) {
		misc.writeToLogNoUsername("Missing KEEP_BROWSER_OPEN parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	if (!process.env.CLAIM_QUEST_REWARD) {
		misc.writeToLogNoUsername("Missing CLAIM_QUEST_REWARD parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	if (!process.env.USE_CLASSIC_BOT_PRIVATE_API) {
		misc.writeToLogNoUsername("Missing USE_CLASSIC_BOT_PRIVATE_API parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	if (!process.env.USE_API) {
		misc.writeToLogNoUsername("Missing USE_API parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	if (!process.env.API_URL || (process.env.USE_API === 'true' && !process.env.API_URL.includes('http'))) {
		misc.writeToLogNoUsername("Missing API_URL parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
	
	if (process.env.USE_API === 'true' && process.env.USE_CLASSIC_BOT_PRIVATE_API === 'true') {
		misc.writeToLogNoUsername('Please only set USE_API or USE_CLASSIC_BOT_PRIVATE_API to true');
		await sleep(60000);
	}
	if (!process.env.ERC_THRESHOLD) {
		misc.writeToLogNoUsername("Missing ERC_THRESHOLD parameter in .env - see updated .env-example!");
		await sleep(60000);
	}
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Close popups by Jones
async function closePopups(page) {
	if (await clickOnElement(page, '.close', 4000) ) return;
	await clickOnElement(page, '.modal-close-new', 1000);
}

// await loading circle by Jones
async function waitUntilLoaded(page) {
	try {
        await page.waitForSelector('.loading', { timeout: 6000 })
            .then(() => {
				misc.writeToLog('Waiting until page is loaded...');
			});
    } catch (e) {
        misc.writeToLog('No loading circle...')
		return;
    }
	
	await page.waitForFunction(() => !document.querySelector('.loading'), { timeout: 120000 });
}

async function clickMenuFightButton(page) {
	try {
        await page.waitForSelector('#menu_item_battle', { timeout: 6000 })
            .then(button => button.click());
    } catch (e) {
        misc.writeToLog('fight button not found')
    }
	
}

// LOAD MY CARDS
async function getCards() {
    const myCards = await user.getPlayerCards(process.env.ACCUSERNAME.split('@')[0]) //split to prevent email use
    return myCards;
} 

async function getQuest() {
    return quests.getPlayerQuest(process.env.ACCUSERNAME.split('@')[0])
        .then(x=>x)
        .catch(e=>misc.writeToLog('No quest data, splinterlands API didnt respond, or you are wrongly using the email and password instead of username and posting key'))
}

async function createBrowsers(count, headless) {
	let browsers = [];
	for (let i = 0; i < count; i++) {
		const browser = await puppeteer.launch({
			headless: headless,
			args: process.env.CHROME_NO_SANDBOX === 'true' ? ["--no-sandbox"] : ['--disable-web-security',
			'--disable-features=IsolateOrigins', 
			' --disable-site-isolation-trials'],
			product: "chrome",
			//executablePath:"/Program Files/BraveSoftware/Brave-Browser/Application/brave",
		});
		const page = await browser.newPage();
		await page.setDefaultNavigationTimeout(500000);
		await page.on('dialog', async dialog => {
			await dialog.accept();
		});
		
		browsers[i] = browser;
	}
	
	return browsers;
}

async function getElementText(page, selector, timeout=20000) {
	const element = await page.waitForSelector(selector,  { timeout: timeout });
	const text = await element.evaluate(el => el.textContent);
	return text;
}

async function getElementTextByXpath(page, selector, timeout=20000) {
	const element = await page.waitForXPath(selector,  { timeout: timeout });
	const text = await element.evaluate(el => el.textContent);
	return text;
}

async function clickOnElement(page, selector, timeout=20000, delayBeforeClicking = 0) {
	try {
        const elem = await page.waitForSelector(selector, { timeout: timeout });
		if(elem) {
			await sleep(delayBeforeClicking);
			misc.writeToLog('Clicking element ' + selector);
			await elem.click();
			return true;
		}
    } catch (e) {
    }
	misc.writeToLog('Error: Could not find element ' + selector);
	return false;
}

async function selectCorrectBattleType(page) {
	try {
		await page.waitForSelector("#battle_category_type", { timeout: 20000 })
		let battleType = (await page.$eval('#battle_category_type', el => el.innerText)).trim();
		while (battleType !== "RANKED") {
			misc.writeToLog("Wrong battleType! battleType is " +  battleType +  " - Trying to change it");
			try {
				await page.waitForSelector('#right_slider_btn', { timeout: 500 })
					.then(button => button.click());
			} catch (e) {
				misc.writeToLog('Slider button not found ', e)
			}
			await page.waitForTimeout(1000);
			battleType = (await page.$eval('#battle_category_type', el => el.innerText)).trim();
		}
	} catch (error) {
		misc.writeToLog("Error: couldn't find battle category type ", error);
	}
}

async function startBotPlayMatch(page, myCards, quest, claimQuestReward, prioritizeQuest, useAPI, logSummary) {
    
	const ercThreshold = process.env.ERC_THRESHOLD;
    logSummary.push(' -----' + process.env.ACCUSERNAME + '-----')
    if(myCards) {
        misc.writeToLog('Deck size: ' + myCards.length)
    } else {
        misc.writeToLog('Playing only basic cards')
    }
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.setViewport({
        width: 1800,
        height: 1500,
        deviceScaleFactor: 1,
    });

    await page.goto('https://splinterlands.io');
    await page.waitForTimeout(4000);

    let username = await getElementText(page, '.dropdown-toggle .bio__name__display', 10000);

    if (username == process.env.ACCUSERNAME) {
		misc.writeToLog('Already logged in!');
	} else {
		misc.writeToLog('Login')
        await splinterlandsPage.login(page).catch(e=>{
            misc.writeToLog(e);
			logSummary.push(chalk.red(' No records due to login error'));
            throw new Error('Login Error');
        });
    }
	await waitUntilLoaded(page);
	const erc = (await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 100)).split('%')[0];
	if (erc >= 50){
		misc.writeToLog('Current Energy Capture Rate is ' + chalk.green(erc + "%"));
	}
	else {
		misc.writeToLog('Current Energy Capture Rate is ' + chalk.red(erc+ "%"));
	}

	if (parseInt(erc) < ercThreshold) {
		misc.writeToLog('ERC is below threshold of ' + ercThreshold + '- skipping this account');
		logSummary.push(' Account skipped: ERC is below threshold of ' + ercThreshold )
		return;
	}
	await page.waitForTimeout(1000);
    await closePopups(page);
	await page.waitForTimeout(2000);
	if (!page.url().includes("battle_history")) {
		await clickMenuFightButton(page);
		await page.waitForTimeout(3000);
	}

    //check if season reward is available
    if (process.env.CLAIM_SEASON_REWARD === 'true') {
        try {
            misc.writeToLog('Season reward check: ');
            await page.waitForSelector('#claim-btn', { visible:true, timeout: 3000 })
            .then(async (button) => {
                button.click();
                misc.writeToLog(`claiming the season reward. you can check them here https://peakmonsters.com/@${process.env.ACCUSERNAME}/explorer`);
                await page.waitForTimeout(20000);
            })
            .catch(()=>misc.writeToLog('no season reward to be claimed, but you can still check your data here https://peakmonsters.com/@${process.env.ACCUSERNAME}/explorer'));
        }
        catch (e) {
            misc.writeToLog('no season reward to be claimed');
        }
    }
	const curRating = await getElementText(page, 'span.number_text', 100)
	await misc.writeToLog('Current Rating is ' + chalk.yellow(curRating));

    //if quest done claim reward
    misc.writeToLog('Quest details: ' + chalk.yellow(JSON.stringify(quest)));
	const questerNameRaw = await getElementText(page, 'div#quest_title1.quest_title_text', 1000);
	const questerName = questerNameRaw.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase());
	try {
		const claimButton = await page.waitForSelector('#quest_claim_btn', { timeout: 2500, visible: true });
		if (claimButton) {
			misc.writeToLog(chalk.green('Quest reward can be claimed!'));
			if (claimQuestReward) {
				await claimButton.click();
				logSummary.push(" " + questerName + ": " + chalk.yellow(Object.values(quest)[3].toString() + "/" + Object.values(quest)[2].toString()) + chalk.yellow(' Quest reward claimed!'));
				await page.waitForTimeout(60000);
				await page.reload();
				await page.waitForTimeout(10000);
			}
		}
	} catch (e) {
		misc.writeToLog('No quest reward to be claimed waiting for the battle...')
		logSummary.push(" " + questerName + ": " + chalk.yellow(Object.values(quest)[3].toString() + "/" + Object.values(quest)[2].toString()) + chalk.red(' No quest reward...'));
	}

	if (!page.url().includes("battle_history")) {
		misc.writeToLog("Seems like battle button menu didn't get clicked correctly - try again");
		misc.writeToLog('Clicking fight menu button again');
		await clickMenuFightButton(page);
		await page.waitForTimeout(5000);
	}

    // LAUNCH the battle
    try {
        misc.writeToLog('waiting for battle button...')
		await selectCorrectBattleType(page);
		
        await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 3000 })
            .then(button => {
				misc.writeToLog('Battle button clicked'); button.click()
				})
            .catch(e=>misc.writeErrorToLog('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));
        await page.waitForTimeout(5000);

        misc.writeToLog('waiting for an opponent...')
        await page.waitForSelector('.btn--create-team', { timeout: 25000 })
            .then(()=>misc.writeToLog('start the match'))
            .catch(async (e)=> {
            misc.writeErrorToLog('[Error while waiting for battle]');
				misc.writeToLog('Clicking fight menu button again');
				await clickMenuFightButton(page);
				misc.writeToLog('Clicking battle button again');
				await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 3000 })
            .then(button => {
					misc.writeToLog('Battle button clicked'); button.click()
					})
            .catch(e=>misc.writeErrorToLog('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));

            misc.writeErrorToLog('Refreshing the page and retrying to retrieve a battle');
            await page.waitForTimeout(5000);
            await page.reload();
            await page.waitForTimeout(5000);
            await page.waitForSelector('.btn--create-team', { timeout: 50000 })
                .then(()=>misc.writeToLog('start the match'))
                .catch(async ()=>{
                    misc.writeToLog('second attempt failed reloading from homepage...');
                    await page.goto('https://splinterlands.io/');
                    await page.waitForTimeout(5000);
                    await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 20000 })
                        .then(button => button.click())
                        .catch(e=>misc.writeErrorToLog('[ERROR] waiting for Battle button second time'));
                    await page.waitForTimeout(5000);
                    await page.waitForSelector('.btn--create-team', { timeout: 25000 })
                        .then(()=>misc.writeToLog('start the match'))
                        .catch((e)=>{
                            misc.writeToLog('third attempt failed');
                            throw new Error(e);})
                        })
        })
    } catch(e) {
        misc.writeErrorToLog('[Battle cannot start]:', e)
        throw new Error('The Battle cannot start');

    }
    await page.waitForTimeout(10000);
    let [mana, rules, splinters] = await Promise.all([
        splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(() => 'no mana'),
        splinterlandsPage.checkMatchRules(page).then((rulesArray) => rulesArray).catch(() => 'no rules'),
        splinterlandsPage.checkMatchActiveSplinters(page).then((splinters) => splinters).catch(() => 'no splinters')
    ]);

    const matchDetails = {
        mana: mana,
        rules: rules,
        splinters: splinters,
        myCards: myCards,
			quest: (prioritizeQuest && quest && (quest.total != quest.completed)) ? quest : '',
     }
	
    await page.waitForTimeout(1000);   
    //TEAM SELECTION
    let teamToPlay;
	misc.writeToLog(chalk.green('starting team selection'));
	if (useAPI) {
		const apiResponse = await api.getPossibleTeams(matchDetails);
		if (apiResponse && !JSON.stringify(apiResponse).includes('api limit reached')) {
			misc.writeToLog(chalk.magenta('API Response: ' + JSON.stringify(apiResponse)));
		
			teamToPlay = { summoner: Object.values(apiResponse)[1], cards: [ Object.values(apiResponse)[1], Object.values(apiResponse)[3], Object.values(apiResponse)[5], Object.values(apiResponse)[7], Object.values(apiResponse)[9], 
							Object.values(apiResponse)[11], Object.values(apiResponse)[13], Object.values(apiResponse)[15] ] };
							
			misc.writeToLog(chalk.cyan('Team picked by API: ' + JSON.stringify(teamToPlay)));
			// TEMP, testing
			if (Object.values(apiResponse)[1] == '') {
				misc.writeToLog('Seems like the API found no possible team - using local history');
				const possibleTeams = await ask.possibleTeams(matchDetails).catch(e=>misc.writeToLog('Error from possible team API call: ',e));
				teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
			}
		}
		else {
			if (apiResponse && JSON.stringify(apiResponse).includes('api limit reached')) {
				misc.writeToLog('API limit per hour reached, using local backup!');
				misc.writeToLog('Visit discord or telegram group to learn more about API limits: https://t.me/ultimatesplinterlandsbot and https://discord.gg/hwSr7KNGs9');
			}
			else {
				misc.writeToLog('API failed, using local history with most cards used tactic');
			}	
			const possibleTeams = await ask.possibleTeams(matchDetails).catch(e=>misc.writeToLog('Error from possible team API call: ',e));
	
			if (possibleTeams && possibleTeams.length) {
				//misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
				misc.writeToLog('Possible Teams based on your cards: ' + possibleTeams.length);
			} else {
				misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
				throw new Error('NO TEAMS available to be played');
			}
			teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
			useAPI = false;
		}
	} else {
		const possibleTeams = await ask.possibleTeams(matchDetails).catch(e=>misc.writeToLog('Error from possible team API call: ',e));

		if (possibleTeams && possibleTeams.length) {
			//misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
			misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
		} else {
			misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
			throw new Error('NO TEAMS available to be played');
		}
		teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
		useAPI = false;
	}

    if (teamToPlay) {
        page.click('.btn--create-team')[0];
    } else {
        throw new Error('Team Selection error');
    }
    await page.waitForTimeout(5000);
    try {
        await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, { timeout: 10000 }).then(summonerButton => summonerButton.click());
        if (card.color(teamToPlay.cards[0]) === 'Gold') {
			misc.writeToLog('Dragon play TEAMCOLOR ' + helper.teamActualSplinterToPlay(teamToPlay.cards.slice(0, 6)))
            await page.waitForXPath(`//div[@data-original-title="${helper.teamActualSplinterToPlay(teamToPlay.cards.slice(0, 6))}"]`, { timeout: 8000 })
                .then(selector => selector.click())
        }
        await page.waitForTimeout(5000);
        for (i = 1; i <= 6; i++) {
            misc.writeToLog('play: ' + teamToPlay.cards[i].toString())
			await teamToPlay.cards[i] ? page.waitForXPath(`//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]`, { timeout: 10000 })
                .then(selector => selector.click()) : misc.writeToLog('nocard ' + i);
            await page.waitForTimeout(1000);
        }

        await page.waitForTimeout(5000);
        try {
            await page.click('.btn-green')[0]; //start fight
        } catch {
            misc.writeToLog('Start Fight didnt work, waiting 5 sec and retry');
            await page.waitForTimeout(5000);
            await page.click('.btn-green')[0]; //start fight
        }
        await page.waitForTimeout(5000);
        await page.waitForSelector('#btnRumble', { timeout: 160000 }).then(()=>misc.writeToLog('btnRumble visible')).catch(()=>misc.writeToLog('btnRumble not visible'));
        await page.waitForTimeout(5000);
        await page.$eval('#btnRumble', elem => elem.click()).then(()=>misc.writeToLog('btnRumble clicked')).catch(()=>misc.writeToLog('btnRumble didnt click')); //start rumble
        await page.waitForSelector('#btnSkip', { timeout: 10000 }).then(()=>misc.writeToLog('btnSkip visible')).catch(()=>misc.writeToLog('btnSkip not visible'));
        await page.$eval('#btnSkip', elem => elem.click()).then(()=>misc.writeToLog('btnSkip clicked')).catch(()=>misc.writeToLog('btnSkip not visible')); //skip rumble
		try {
			const winner = await getElementText(page, 'section.player.winner .bio__name__display', 15000);
			if (winner.trim() == process.env.ACCUSERNAME.trim()) {
				const decWon = await getElementText(page, '.player.winner span.dec-reward span', 100);
				misc.writeToLog(chalk.green('You won! Reward: ' + decWon + ' DEC'));
				logSummary.push(' Battle result:' + chalk.green(' Win Reward: ' + decWon + ' DEC'));
			}
			else {
				misc.writeToLog(chalk.red('You lost :('));
				logSummary.push(' Battle result:' + chalk.red(' Lose'));
				if (useAPI) {
					api.reportLoss(winner);
				}
			}
		} catch(e) {
			misc.writeToLog(e);
			misc.writeToLog(chalk.blueBright('Could not find winner - draw?'));
			logSummary.push(chalk.blueBright(' Could not find winner - draw?'));
		}
		await clickOnElement(page, '.btn--done', 2000, 2500);

		await page.waitForTimeout(5000)	
		try {
			if (!page.url().includes("battle_history")) {
				await page.reload()
				await page.waitForTimeout(5000);
			} else { 
				await page.goto('https://splinterlands.com/?p=battle_history');
				await page.waitForTimeout(5000)	
			}
			let curRating = await getElementText(page, 'span.number_text', 1000);
			misc.writeToLog('Updated Rating after battle is ' + chalk.yellow(curRating));
			logSummary.push(' New rating: ' + chalk.yellow(curRating));
		const newERC = (await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 2000)).split('%')[0];
			let e = parseInt(newERC);
				if (e >= 50) {
					logSummary.push(' Remaining ERC: ' + chalk.green(newERC + '%'));
				}
				else {
					logSummary.push(' Remaining ERC: ' + chalk.red(newERC + '%'));
				}

				
		} catch (e){
			misc.writeToLog(e);
			misc.writeToLog(chalk.blueBright('Unable to get new rating'));
			logSummary.push(chalk.blueBright(' Unable to get new rating'));
			logSummary.push(chalk.blueBright(' Unable to get remaining ERC '));
		}
    } catch (e) {
        throw new Error(e);
    }


}

// 30 MINUTES INTERVAL BETWEEN EACH MATCH (if not specified in the .env file)
const sleepingTimeInMinutes = process.env.MINUTES_BATTLES_INTERVAL || 30;
const sleepingTime = sleepingTimeInMinutes * 60000;

(async () => {
	try {
		await checkForUpdate();
		await checkForMissingConfigs();
		const loginViaEmail = JSON.parse(process.env.LOGIN_VIA_EMAIL.toLowerCase());
		const teleNotif = JSON.parse(process.env.TELEGRAM_NOTIF.toLowerCase());
		const accountusers = process.env.ACCUSERNAME.split(',');
		const accounts = loginViaEmail ? process.env.EMAIL.split(',') : accountusers;
		const passwords = process.env.PASSWORD.split(',');
		const headless = JSON.parse(process.env.HEADLESS.toLowerCase());
		const useAPI = JSON.parse(process.env.USE_API.toLowerCase());
		const keepBrowserOpen = JSON.parse(process.env.KEEP_BROWSER_OPEN.toLowerCase());
		const claimQuestReward = JSON.parse(process.env.CLAIM_QUEST_REWARD.toLowerCase());
		const prioritizeQuest = JSON.parse(process.env.QUEST_PRIORITY.toLowerCase());
		
		let browsers = [];
		misc.writeToLogNoUsername('Headless: ' + headless);
		misc.writeToLogNoUsername('Keep Browser Open: ' + keepBrowserOpen);
		misc.writeToLogNoUsername('Login via Email: ' + loginViaEmail);
		misc.writeToLogNoUsername('Telegram Notification: ' + teleNotif);
		misc.writeToLogNoUsername('Claim Quest Reward: ' + claimQuestReward);
		misc.writeToLogNoUsername('Prioritize Quests: ' + prioritizeQuest);
		misc.writeToLogNoUsername('Use API: ' + useAPI);
		misc.writeToLogNoUsername('Loaded ' + chalk.yellow(accounts.length) + ' Accounts')
		misc.writeToLogNoUsername('START '+ chalk.greenBright(accounts))

		// edit by jones, neues while true
		while (true) {
			let logSummary = [];
			startTimer = new Date().getTime();
			for (let i = 0; i < accounts.length; i++) {
				process.env['EMAIL'] = accounts[i];
				process.env['PASSWORD'] = passwords[i];
				process.env['ACCUSERNAME'] = accountusers[i];
				
				if (keepBrowserOpen && browsers.length == 0) {
					misc.writeToLog('Opening browsers');
					browsers = await createBrowsers(accounts.length, headless);
				} else if (!keepBrowserOpen) { // close browser, only have 1 instance at a time
					misc.writeToLog('Opening browser');
					browsers = await createBrowsers(1, headless);
				}
							
				const page = (await (keepBrowserOpen ? browsers[i] : browsers[0]).pages())[1];
				
				//page.goto('https://splinterlands.io/');
				misc.writeToLog('getting user cards collection from splinterlands API...')
				const myCards = await getCards()
					.then((x)=>{misc.writeToLog('cards retrieved'); return x})
					.catch(()=>misc.writeToLog('cards collection api didnt respond. Did you use username? avoid email!'));
				misc.writeToLog('getting user quest info from splinterlands API...');
				const quest = await getQuest();
				if(!quest) {
					misc.writeToLog('Error for quest details. Splinterlands API didnt work or you used incorrect username')
				}
				await startBotPlayMatch(page, myCards, quest, claimQuestReward, prioritizeQuest, useAPI, logSummary)
					.then(() => {
						misc.writeToLog('Closing battle');
					})
					.catch((e) => {
						misc.writeToLog(e)
					})

				await page.waitForTimeout(5000);
				if (keepBrowserOpen) {
					await page.goto('about:blank');	
				} else {
					let pages = await browsers[0].pages();
					await Promise.all(pages.map(page =>page.close()));
					await browsers[0].close();
				}
			}
			// battle result summary
			endTimer = new Date().getTime();
			totalTime = endTimer - startTimer;
			tet = ' Total execution time: ' + chalk.green((totalTime / 1000 / 60).toFixed(2) + ' mins')
			console.log('--------------------------Battle Results Summary:----------------------');
			console.log(tet);
			if (accounts.length > 1) {
				logSummary.forEach(x => console.log(x));
			};

			// telegram notification 
			if (process.env.TELEGRAM_NOTIF === 'true') {
				try {
					const notify = new Telegram({token: process.env.TELEGRAM_TOKEN, chatId: process.env.TELEGRAM_CHATID});
					message = 'Battle result summary: \n' + new Date().toLocaleString() + ' \n' + tet.replace(/\u001b[^m]*?m/g,"") + ' \n';
					for (let i = 0; i < logSummary.length; i++) {
						message = message + logSummary[i].replace(/\u001b[^m]*?m/g,"") +' \n';
			
					}
					message = message + ' \n' + ' Next battle in '+ sleepingTime / 1000 / 60 + ' minutes at ' + new Date(Date.now() +sleepingTime).toLocaleString() +' \n';;

					await notify.send(message);
					console.log(chalk.green(' Battle result sent to telegram'));
					message = '';	
				}
				catch (e) {
					console.log(chalk.red(' [ERROR] Unable to send battle result to Telegram. Please make sure telegram setting is correct.'));
				}
			}
			console.log('-----------------------------------------------------------------------');

			console.log(' Waiting for the next battle in ' + chalk.yellow(sleepingTime / 1000 / 60) + ' minutes at ' + new Date(Date.now() +sleepingTime).toLocaleString() );
			console.log(chalk.green(' Interested in a bot that transfers all cards, dec and sps to your main account? Visit the discord or telegram!'));
			console.log(' Join the telegram group https://t.me/ultimatesplinterlandsbot and discord https://discord.gg/hwSr7KNGs9')
			console.log('--------------------------End of Battle--------------------------------');
			await new Promise(r => setTimeout(r, sleepingTime));
		}
	} catch (e) {
		console.log('Routine error at: ', new Date().toLocaleString(), e)
	}
	
})();