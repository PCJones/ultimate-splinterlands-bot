//'use strict';
require('dotenv').config()
const puppeteer = require('puppeteer');
const fetch = require("cross-fetch");
const chalk = require('chalk');
const fs = require('fs');
const readline = require('readline');
const figlet = require('figlet');
const { table } = require('table');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./user');
const card = require('./cards');
const helper = require('./helper');
const quests = require('./quests');
const ask = require('./possibleTeams');
const api = require('./api');
const misc = require('./misc');
const tn = require('./telnotif');
const nq = require('./newquests');
const fnAllCardsDetails  = ('./data/cardsDetails.json');
const battles = require('./auto-gather');
const version = 11.3;
const unitVersion = 'desktop'

async function readJSONFile(fn){
    const jsonString = fs.readFileSync(fn);
    const ret = JSON.parse(jsonString);
    return ret;
}	


async function checkForUpdate(teleNotif) {
    console.log(figlet.textSync('USBpc', {
        //font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
      }));
    let config = {columns: [ { width: 25 , alignment: 'center'}]};
    let updateNews = [[chalk.green('USBpc Version ' + version)]];
    console.log(table(updateNews, config));  
    console.log('---------------------------------------------------------------------------------')
      await fetch('https://raw.githubusercontent.com/virgaux/USBpc/master/USBpc-Version.json')
      .then(newestVersion => newestVersion.json())
      .then(newestVersion => {
          if (newestVersion.Version > version) {
            if (teleNotif == true){tn.sender('New Update! Please download on https://github.com/virgaux/USBpc')}
            console.log(chalk.green('      New Update! Please download on https://github.com/virgaux/USBpc'))
            console.table(newestVersion)
          } else {
            console.log(chalk.yellow('                                No update available'))
          }
      })
    console.log('--------------------------------------------------------------------------------- \n')  

}

async function checkForMissingConfigs(teleNotif) {
    if (!process.env.TELEGRAM_NOTIF) {
		misc.writeToLogNoUsername(chalk.red("Missing TELEGRAM_NOTIF parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing TELEGRAM_NOTIF parameter in .env - see updated .env-example!")}
		await sleep(60000);
	}
    if (!process.env.LOGIN_VIA_EMAIL) {
        misc.writeToLogNoUsername(chalk.red("Missing LOGIN_VIA_EMAIL parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing LOGIN_VIA_EMAIL parameter in .env - see updated .env-example!")}
        await sleep(60000);
    }
    if (!process.env.HEADLESS) {
        misc.writeToLogNoUsername(chalk.red("Missing HEADLESS parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing HEADLESS parameter in .env - see updated .env-example!")}
        await sleep(60000);
    }
    if (!process.env.KEEP_BROWSER_OPEN) {
        misc.writeToLogNoUsername(chalk.red("Missing KEEP_BROWSER_OPEN parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing KEEP_BROWSER_OPEN parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.CLAIM_QUEST_REWARD) {
        misc.writeToLogNoUsername(chalk.red("Missing CLAIM_QUEST_REWARD parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing KEEP_BROWSER_OPEN parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.USE_CLASSIC_BOT_PRIVATE_API) {
        misc.writeToLogNoUsername(chalk.red("Missing USE_CLASSIC_BOT_PRIVATE_API parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing USE_CLASSIC_BOT_PRIVATE_API parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.USE_API) {
        misc.writeToLogNoUsername(chalk.red("Missing USE_API parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing USE_API parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.API_URL || (process.env.USE_API === 'true' && !process.env.API_URL.includes('http'))) {
        misc.writeToLogNoUsername(chalk.red("Missing API_URL parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing API_URL parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (process.env.USE_API === 'true' && process.env.USE_CLASSIC_BOT_PRIVATE_API === 'true') {
        misc.writeToLogNoUsername(chalk.red('Please only set USE_API or USE_CLASSIC_BOT_PRIVATE_API to true'));
        if (teleNotif === 'true'){tn.sender('ALERT: Please only set USE_API or USE_CLASSIC_BOT_PRIVATE_API to true')};
        await sleep(60000);
    }
    if (!process.env.ERC_THRESHOLD) {
        misc.writeToLogNoUsername(chalk.red("Missing ERC_THRESHOLD parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing ERC_THRESHOLD parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
    if (!process.env.GET_DATA_FOR_LOCAL) {
        misc.writeToLogNoUsername(chalk.red("process.env.GET_DATA_FOR_LOCAL parameter in .env - see updated .env-example!"));
        if (teleNotif === 'true'){tn.sender("ALERT: Missing process.env.GET_DATA_FOR_LOCAL parameter in .env - see updated .env-example!")};
        await sleep(60000);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const withTimeout = (millis, promise) => {
    const timeout = new Promise((resolve, reject) =>
        setTimeout(
            () => reject(`Timed out after ${millis} ms.`),
            millis));
    return Promise.race([
        promise,
        timeout
    ]);
};
// Close popups by Jones
async function closePopups(page) {
    if (await clickOnElement(page, '.close', 4000))
        return;
    await clickOnElement(page, '.modal-close-new', 1000);
}

// await loading circle by Jones
async function waitUntilLoaded(page) {
    try {
        await page.waitForSelector('.loading', {
            timeout: 6000
        })
        .then(() => {
            misc.writeToLog('Waiting until page is loaded...');
        });
    } catch (e) {
        misc.writeToLog('No loading circle...')
        return;
    }

    await page.waitForFunction(() => !document.querySelector('.loading'), {
        timeout: 120000
    });
}

async function clickMenuFightButton(page) {
    try {
        await page.waitForSelector('#menu_item_battle', {
            timeout: 6000
        })
        .then(button => button.click());
    } catch (e) {
        misc.writeToLog('fight button not found')
    }

}
// file size checker
async function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
}


// LOAD MY CARDS
async function getCards() {
    const myCards = await user.getPlayerCards(process.env.ACCUSERNAME, new Date(Date.now() - 86400000)) // 86400000 = 1 day in milliseconds
        return myCards;
}

async function getQuest() {
    return quests.getPlayerQuest(process.env.ACCUSERNAME.split('@')[0])
    .then(x => x)
    .catch(e => misc.writeToLog('No quest data, splinterlands API didnt respond, or you are wrongly using the email and password instead of username and posting key'))
}

async function createBrowsers(count, headless) {
    let browsers = [];
    for (let i = 0; i < count; i++) {
        const browser = await puppeteer.launch({
               product: 'chrome',
               headless: headless,
               args: headless === true ? [
                "--no-sandbox",
                '--disable-features=IsolateOrigins',
                '--disable-site-isolation-trials',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-canvas-aa', // Disable antialiasing on 2d canvas
                '--disable-2d-canvas-clip-aa', // Disable antialiasing on 2d canvas clips
                '--disable-gl-drawing-for-tests', // BEST OPTION EVER! Disables GL drawing operations which produce pixel output. With this the GL output will not be correct but tests will run faster.
                '--no-first-run',
                '--no-zygote', // wtf does that mean ?
                '--disable-dev-shm-usage', // ???
                '--use-gl=desktop', // better cpu usage with --use-gl=desktop rather than --use-gl=swiftshader, still needs more testing.
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu',
                '--hide-scrollbars',
                '--mute-audio',
                '--disable-infobars',
                '--disable-breakpad',
                '--enable-low-end-device-mode',
                '--disable-web-security'
            ] : ["--no-sandbox",
            '--disable-accelerated-2d-canvas',
            '--disable-canvas-aa', // Disable antialiasing on 2d canvas
            '--disable-2d-canvas-clip-aa',
            '--hide-scrollbars',
            '--mute-audio',
            '--disable-web-security']
           });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(500000);
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        browsers[i] = browser;
    }

    return browsers;
}

async function getElementText(page, selector, timeout = 20000) {
    const element = await page.waitForSelector(selector, {
            timeout: timeout
        });
    const text = await element.evaluate(el => el.textContent);
    return text;
}

async function getElementTextByXpath(page, selector, timeout = 20000) {
    const element = await page.waitForXPath(selector, {
            timeout: timeout
        });
    const text = await element.evaluate(el => el.textContent);
    return text;
}

async function clickOnElement(page, selector, timeout = 20000, delayBeforeClicking = 0) {
    try {
        const elem = await page.waitForSelector(selector, {
                timeout: timeout
            });
        if (elem) {
            await sleep(delayBeforeClicking);
            misc.writeToLog('Clicking element ' + selector);
            await elem.click();
            return true;
        }
    } catch (e) {}
    misc.writeToLog('Error: Could not find element ' + selector);
    return false;
}

async function selectCorrectBattleType(page) {
    try {
        await page.waitForSelector("#battle_category_type", {
            timeout: 20000
        })
        let battleType = (await page.$eval('#battle_category_type', el => el.innerText)).trim();
        while (battleType !== "RANKED") {
            misc.writeToLog("Wrong battleType! battleType is " + battleType + " - Trying to change it");
            try {
                await page.waitForSelector('#right_slider_btn', {
                    timeout: 500
                })
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

async function startBotPlayMatch(page, myCards, quest, claimQuestReward, prioritizeQuest, useAPI, logSummary, getDataLocal, logSummary1, seasonRewards) {
  try{
    let newlogvisual = {};
    const ercThreshold = process.env.ERC_THRESHOLD;
    const allCardDetails = await readJSONFile(fnAllCardsDetails);
    logSummary.push(' \n -----' + process.env.ACCUSERNAME + '-----')
    logSummary1[process.env.ACCUSERNAME] = newlogvisual
    if (myCards) {
        misc.writeToLog('Deck size: ' + myCards.length)
    } else {
        misc.writeToLog('Playing only basic cards')
    }
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36');
    await page.setViewport({
        width: 1800,
        height: 1500,
        deviceScaleFactor: 1,
    });

    await page.goto('https://splinterlands.io');
    await page.waitForTimeout(4000);
    //check if maintenance 
    const maintenance = page.url()
    if (maintenance == 'https://splinterlands.com/?p=maintenance') {
        await page.reload()
        if (maintenance == 'https://splinterlands.com/?p=maintenance'){
            return misc.writeToLog('Game is currently on maintenance.')  
        }    
    } else {
        const username = await getElementText(page, '.dropdown-toggle .bio__name__display', 10000).catch(async () => {
            await page.goto('https://splinterlands.io');
            await page.waitForTimeout(4000);
            await getElementText(page, '.dropdown-toggle .bio__name__display', 10000)
        });
        if (username == process.env.ACCUSERNAME) {
            misc.writeToLog('Already logged in!');
        } else {
            misc.writeToLog('Login')
            await splinterlandsPage.login(page).catch(async () => {
            misc.writeToLog('Unable to login. Trying to reload page again.');
            await page.goto('https://splinterlands.io/?p=battle_history');
            await page.waitForTimeout(4000);
            await getElementText(page, '.dropdown-toggle .bio__name__display', 10000)
                await splinterlandsPage.login(page).catch(e => {
                misc.writeToLog(e);
                logSummary.push(chalk.red(' No records due to login error'));
                throw new Error ('Skipping this account due to to login error.');
                }); 
            });
        }    
    }    

    await page.goto('https://splinterlands.io/?p=battle_history');
    await page.reload();
    await closePopups(page);
    await waitUntilLoaded(page);
    const ercCurrentraw = await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 1000).catch(async () =>{
        misc.writeToLog('unable to get ECR via browser. Will get info via API call.')
        await page.evaluate(()=>SM.Player.capture_rate).then(x=>(x.toString()).slice(0, 2)+ "." + (x.toString()).slice(2))
    });
    let ecrInitial = ercCurrentraw.includes('%')? ercCurrentraw.split('%')[0] : ercCurrentraw
    if ( ecrInitial >= 50) {
        misc.writeToLog('Current ECR is ' + chalk.green(ecrInitial + "%"));
    } else {
        misc.writeToLog('Current ECR is ' + chalk.red(ecrInitial + "%"));
    }
    if (ecrInitial < ercThreshold) {
        misc.writeToLog('ECR is below threshold of ' + chalk.red(ercThreshold + '% ') + '- Skipping this account');
        logSummary.push(' Account skipped: ' + chalk.red('ECR is below threshold of ' + ercThreshold))
        return;
    }

    //if quest done claim reward
    let quester = {}
    quester['Quest:'] = quest;
    console.table(quester);

    // boart2k added
    const powerThreshold = process.env.POWER_THRESHOLD;
    const powerRaw = await page.evaluate(()=>SM.Player.collection_power);

    if(powerRaw < powerThreshold){
        misc.writeToLog('Collection Power: ' + chalk.red(powerRaw) + ' is lower than the ' + chalk.red(powerThreshold) + ' you have set.');
        logSummary.push(' Collection Power: ' + chalk.red(powerRaw) + ' is lower than the ' + chalk.red(powerThreshold) + ' you have set.');
        newlogvisual['Power'] = powerRaw
    } else {
        misc.writeToLog('Collection Power: ' + chalk.green(powerRaw));
        logSummary.push(' Collection Power: ' + chalk.green(powerRaw));
        newlogvisual['Power'] = powerRaw
    }
    // boart2k end

    //check if season reward is available
    await page.waitForTimeout(1000);
    await closePopups(page).catch(()=>misc.writeToLog('No pop up to be closed.'));
    await page.waitForTimeout(2000);
    await nq.seasonQuest(page, logSummary, allCardDetails, seasonRewards, powerThreshold, powerRaw);
    if (!page.url().includes("battle_history")) {
        await clickMenuFightButton(page);
        await page.waitForTimeout(3000);
    }

    const curRating = await page.evaluate(()=>SM.Player.rating).catch(() => {misc.writeToLog('Unable to get current Rating')} );
    misc.writeToLog('Current Rating is ' + chalk.yellow(curRating));

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

        await page.waitForXPath("//button[contains(., 'BATTLE')]", {
            timeout: 3000
        })
        .then(button => {
            misc.writeToLog('Battle button clicked');
            button.click()
        })
        .catch(e => misc.writeErrorToLog('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));
        await page.waitForTimeout(5000);

        misc.writeToLog('waiting for an opponent...')
        await page.waitForSelector('.btn--create-team', {
            timeout: 25000
        })
        .then(() => misc.writeToLog('start the match'))
        .catch(async(e) => {
            misc.writeErrorToLog('[Error while waiting for battle]');
            misc.writeToLog('Clicking fight menu button again');
            await clickMenuFightButton(page);
            misc.writeToLog('Clicking battle button again');
            await page.waitForXPath("//button[contains(., 'BATTLE')]", {
                timeout: 3000
            })
            .then(button => {
                misc.writeToLog('Battle button clicked');
                button.click()
            })
            .catch(e => misc.writeErrorToLog('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));

            misc.writeErrorToLog('Refreshing the page and retrying to retrieve a battle');
            await page.waitForTimeout(5000);
            await page.reload();
            await page.waitForTimeout(5000);
            await page.waitForSelector('.btn--create-team', {
                timeout: 50000
            })
            .then(() => misc.writeToLog('start the match'))
            .catch(async() => {
                misc.writeToLog('second attempt failed reloading from homepage...');
                await page.goto('https://splinterlands.io/?p=battle_history');
                await page.waitForTimeout(5000);
                await page.waitForXPath("//button[contains(., 'BATTLE')]", {
                    timeout: 20000
                })
                .then(button => button.click())
                .catch(e => misc.writeErrorToLog('[ERROR] waiting for Battle button second time'));
                await page.waitForTimeout(5000);
                await page.waitForSelector('.btn--create-team', {
                    timeout: 25000
                })
                .then(() => misc.writeToLog('start the match'))
                .catch((e) => {
                    misc.writeToLog('Third attempt failed');
                    misc.writeToLog('Skipping account due to error')
                    logSummary.push(' Skipping account due to error')
                    throw new Error;
                })
            })
        })
    } catch (e) {
        misc.writeErrorToLog('[Battle cannot start]:', e)
        logSummary.push(chalk.red(' No records due to battle error'));
        return;

    }
    await page.waitForTimeout(5000);
    let[mana, rules, splinters] = await Promise.all([
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
    if (mana == 'no mana') { 
        logSummary.push(' No Mana error. Skipping account.')
        throw new Error(" No mana. Game server error.");
    }
        let priorityCards = process.env.PRIORITY_CARD;
		if (priorityCards) {
            priorityCards = priorityCards.split(',')
            priorityCards = priorityCards.filter(x => myCards.includes(parseInt(x.trim())))
		}
    misc.writeToLog(chalk.green('Battle details:'));  
    misc.writeToLog('Mana:'+  chalk.yellow(mana) + ' Rules:' + chalk.yellow(rules) + ' Splinters:' + chalk.yellow(splinters))
    misc.writeToLog(chalk.green('starting team selection'));
    var twirlTimer = (function() {
        var P = ["Please wait |", "Please wait /", "Please wait -", "Please wait \\"];
        var x = 0;
        return setInterval(function() {
          process.stdout.write("\r" + P[x++]);
          x &= 3;
        }, 250); })(); 
    if (useAPI) {
       try {
            const apiResponse = await withTimeout(100000, api.getPossibleTeams(matchDetails));
            if (apiResponse && !JSON.stringify(apiResponse).includes('api limit reached')) {
                readline.cursorTo(process.stdout, 0); 
                misc.writeToLog(chalk.magenta('API Response Result: ')); 
                console.log(chalk.cyan(' Team picked by API: '));
                    console.table({
                        'Play for quest': Object.values(apiResponse)[0],
                        'Team Rank': Object.values(apiResponse)[16],
                        'Win Percentage' : (Object.values(apiResponse)[2].replace(',','.')* 100).toFixed(2) + '%',   
                        'Element' : Object.values(apiResponse)[15],  
                        'Summoner': Object.values(apiResponse)[1],
                        'Cards 1': Object.values(apiResponse)[3], 
                        'Cards 2': Object.values(apiResponse)[5],
                        'Cards 3': Object.values(apiResponse)[7],
                        'Cards 4': Object.values(apiResponse)[9],
                        'Cards 5': Object.values(apiResponse)[11],
                        'Cards 6': Object.values(apiResponse)[13]         
                    });
                teamToPlay = {
                    summoner: Object.values(apiResponse)[1],
                    cards: [Object.values(apiResponse)[1], Object.values(apiResponse)[3], Object.values(apiResponse)[5], Object.values(apiResponse)[7], Object.values(apiResponse)[9],
                        Object.values(apiResponse)[11], Object.values(apiResponse)[13], Object.values(apiResponse)[15]]
                };

                   subElement = helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6)).toLowerCase()
                if (Object.values(apiResponse)[15] === 'dragon' && splinters.includes(subElement) == false ) {
                    misc.writeToLog('Sub-element is ' + subElement + ' but not included on available splinters.')
                    misc.writeToLog('API choose inappropriate splinter sub-element. Reverting to local history.');
                    const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));
                    if (possibleTeams && possibleTeams.length) {
                        //misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
                        misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
                    } else {
                        misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                        logSummary.push(' NO TEAMS available to be played')
                        throw new Error ('NO TEAMS available to be played');
                    }
                    teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
                    useAPI = false;  

                } else {
                   const winPercent = (Object.values(apiResponse)[2].replace(',','.')* 100).toFixed(2)
                if  (winPercent < process.env.SWITCH_THRESHOLD && JSON.parse(process.env.AUTO_SWITCH.toLowerCase()) == true) {  // auto-select to local if win percentage is below 50%
                        readline.cursorTo(process.stdout, 0);
                        misc.writeToLog('API choose low winning percentage splinter . Reverting to local history.');
                        const possibleTeams = await ask.possibleTeams(matchDetails, priorityCards).catch(e => misc.writeToLog('Error from possible team API call: ', e));
                        if (possibleTeams && possibleTeams.length) {
                            //misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length, '\n', possibleTeams);
                            misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
                        } else {
                            readline.cursorTo(process.stdout, 0); 
                            misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                            logSummary.push(' NO TEAMS available to be played')
                            throw new Error (' NO TEAMS available to be played');
                        }
                        teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
                        useAPI = false; 
                    } else {
                        apiSelect = true;
                        // TEMP, testing
                        if (Object.values(apiResponse)[1] == '') {
                            readline.cursorTo(process.stdout, 0); 
                            misc.writeToLog('Seems like the API found no possible team - using local history');
                            const possibleTeams = await ask.possibleTeams(matchDetails).catch(e => misc.writeToLog('Error from possible team API call: ', e));
                            teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);  
                        }
                    }    
                }
            } else {
                if (apiResponse && JSON.stringify(apiResponse).includes('api limit reached')) {
                    readline.cursorTo(process.stdout, 0); 
                    misc.writeToLog('API limit per hour reached, using local backup!');
                    misc.writeToLog('Visit discord or telegram group to learn more about API limits: https://t.me/ultimatesplinterlandsbot and https://discord.gg/hwSr7KNGs9');
                    apiSelect = 'false'  
                } else {
                    misc.writeToLog('API failed, using local history with most cards used tactic');
                    
                }
                const possibleTeams = await ask.possibleTeams(matchDetails, priorityCards).catch(e => misc.writeToLog('Error from possible team API call: ', e));

                if (possibleTeams && possibleTeams.length) {
                    readline.cursorTo(process.stdout, 0); 
                    misc.writeToLog('Possible Teams based on your cards: ' + possibleTeams.length);
                } else {
                    readline.cursorTo(process.stdout, 0); 
                    misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                    logSummary.push(' NO TEAMS available to be played')
                    throw new Error;
                }
                teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
                useAPI = false;
            }
        } catch (e){
            misc.writeToLog('API taking too long. Reverting to use local history' + e);
            const possibleTeams = await ask.possibleTeams(matchDetails, priorityCards).catch(e => misc.writeToLog('Error from possible team API call: ', e));
            if (possibleTeams && possibleTeams.length) {
                readline.cursorTo(process.stdout, 0); 
                misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
            } else {
                misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
                logSummary.push(' NO TEAMS available to be played');
                throw new Error;
            }
            teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
            useAPI = false;
        }         
    } else {
        const possibleTeams = await ask.possibleTeams(matchDetails, priorityCards).catch(e => misc.writeToLog('Error from possible team API call: ', e));
        if (possibleTeams && possibleTeams.length) {
            readline.cursorTo(process.stdout, 0); 
            misc.writeToLog('Possible Teams based on your cards: ', possibleTeams.length);
        } else {
            readline.cursorTo(process.stdout, 0); 
            misc.writeToLog('Error: ', JSON.stringify(matchDetails), JSON.stringify(possibleTeams))
            logSummary.push(' NO TEAMS available to be played')
            throw new Error (' NO TEAMS available to be played');
        }
        teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);
        useAPI = false;
    }

    if (teamToPlay) {
        try{
            await page.click('.btn--create-team')[0];
        } catch {
            await page.reload().then(async () =>{
                await page.waitForTimeout(5000); 
                await page.click('.btn--create-team')[0];   
                }).catch((e) => {
                    logSummary.push('Team Selection error')
                    return ('Team Selection error');
                })
        } 
    } else {
            logSummary.push('Team Selection error')
    }
    await page.waitForTimeout(5000);
    try {
        await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, {
            timeout: 15000
        }).then(summonerButton => summonerButton.click()).catch( async (error) =>{ 
          await page.reload()
          await page.waitForTimeout(5000);
          page.click('.btn--create-team')[0];
          await page.waitForTimeout(5000);
          await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, {
            timeout: 30000
            }).then(summonerButton => summonerButton.click())
        });
        if (card.color(teamToPlay.cards[0]) === 'Gold') {
            readline.cursorTo(process.stdout, 0); 
            misc.writeToLog(' Dragon play TEAMCOLOR ' + helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6)))
            await page.waitForXPath(`//div[@data-original-title="${helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6))}"]`, {
                timeout: 8000
            })
            .then(selector => selector.click()).catch( async (error) =>{ 
                await page.reload()
                await page.waitForTimeout(5000);
                page.click('.btn--create-team')[0];
                await page.waitForTimeout(5000);
                await page.waitForXPath(`//div[@data-original-title="${helper.teamActualSplinterToPlay(splinters,teamToPlay.cards.slice(0, 6))}"]`, {
                timeout: 30000
            })
            .then(selector => selector.click())
            }); 
        }
        await page.waitForTimeout(10000);
        clearInterval(twirlTimer);
        readline.cursorTo(process.stdout, 0); 
        misc.writeToLog('Summoner: ' + chalk.yellow(teamToPlay.summoner.toString().padStart(3)) + ' Name: ' + chalk.green(allCardDetails[(parseInt(teamToPlay.summoner))-1].name.toString()));
                for (i = 1; i <= 6; i++) {
                    await sleep(300);
                    let strCard = 'nocard';
                    if(teamToPlay.cards[i] != ''){ strCard = allCardDetails[(parseInt(teamToPlay.cards[i]))-1].name.toString(); }
                      if(strCard !== 'nocard'){
                        misc.writeToLog('Play: ' + chalk.yellow(teamToPlay.cards[i].toString().padStart(3)) + ' Name: ' + chalk.green(strCard));
                      } else {
                        misc.writeToLog(' ' + strCard);
                      }  
                    if (teamToPlay.cards[i]){
                        await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]`, {timeout: 20000})
                        .then(selector => selector.click())}
                    await page.waitForTimeout(1000);
                }
        await page.waitForTimeout(2000);
        try {
            misc.writeToLog('Team submit. Please wait for the result.');
            await page.click('.btn-green')[0]; //start fight
        } catch {
            misc.writeToLog('Start Fight didnt work, waiting 5 sec and retry');
            await page.waitForTimeout(2000);
            await page.click('.btn-green')[0]; //start fight
        }
        var twirlTimer = (function() {
            var P = ["Please wait |", "Please wait /", "Please wait -", "Please wait \\"];
            var x = 0;
            return setInterval(function() {
              process.stdout.write("\r" + P[x++]);
              x &= 3;
            }, 250); })(); 
        await page.waitForTimeout(2000);
        await page.waitForSelector('#btnRumble', {
            timeout: 160000
        }).then(() => {
            clearInterval(twirlTimer);
            readline.cursorTo(process.stdout, 0); 
            misc.writeToLog('btnRumble visible')
        }).catch(() => {
            clearInterval(twirlTimer);
            readline.cursorTo(process.stdout, 0);
            misc.writeToLog('btnRumble not visible')});
        await page.waitForTimeout(5000);
        await page.$eval('#btnRumble', elem => elem.click()).then(() => misc.writeToLog('btnRumble clicked')).catch(() => misc.writeToLog('btnRumble didnt click')); //start rumble
        await page.waitForSelector('#btnSkip', {
            timeout: 10000
        }).then(() => misc.writeToLog('btnSkip visible')).catch(() => misc.writeToLog('btnSkip not visible'));
        await page.$eval('#btnSkip', elem => elem.click()).then(() => misc.writeToLog('btnSkip clicked')).catch(() => misc.writeToLog('btnSkip not visible')); //skip rumble

        //getting battle result
            misc.writeToLog('Getting battle result...');
            await page.goto('https://splinterlands.io/?p=battle_history');
            const bURL = [`https://api2.splinterlands.com/battle/history?player=`,`https://api.splinterlands.io/battle/history?player=`, `https://api.steemmonsters.io/battle/history?player=`];
            const battleURL = bURL[Math.floor(Math.random() * bURL.length)];
            await fetch(battleURL + process.env.ACCUSERNAME)
                .then(response => response.json())
                .then(async data  => {
                        const winner = data.battles[0].winner
                        const decWon = data.battles[0].reward_dec
                        const SPSwon = data.battles[0].reward_sps
            await waitUntilLoaded(page);
            if (winner.trim() == process.env.ACCUSERNAME.trim()) {
                misc.writeToLog(chalk.green('You won!'));
                let battleRewards = []
                battleRewards.reward = {DEC : decWon, SPS : SPSwon}
                console.table(battleRewards)
				logSummary.push(' Battle result:' + chalk.green(' Win Reward: DEC ' + decWon + ' SPS ' + SPSwon));
                newlogvisual['Battle Result'] = 'Win ' + decWon
            } else if (winner.trim() === "DRAW") {
                misc.writeToLog(chalk.yellow("It's a draw"));
                logSummary.push(' Battle result:' + chalk.blueBright(' Draw'));
                newlogvisual['Battle Result'] = 'Draw'
            } else {
                misc.writeToLog(chalk.red('You lost :('));
				logSummary.push(' Battle result:' + chalk.red(' Lose'));
                newlogvisual['Battle Result'] = 'Lose'
                if (useAPI) {
                    api.reportLoss(winner);
                }
            }
            if (getDataLocal == true) {
                let  fileSizeInMegabytes = (await getFilesizeInBytes("data/newHistory.json") / 1024) // *1024)

				if (fileSizeInMegabytes.toString().split('.')[0]  >= 490000) {
					misc.writeToLog("Unable to gather data as newHistory file is now 500MB") 
				} else {
                    misc.writeToLog("Gathering winner's battle data for local history backup")
                    await battles.battlesList(winner).then(x=>x).catch((e) => misc.writeToLog('Unable to gather data for local.' + e));
                }
            } 
        }).catch((e) => {
                misc.writeToLog(e);
                misc.writeToLog(chalk.blueBright('Could not find winner'));
                logSummary.push(chalk.blueBright(' Could not find winner'));
                newlogvisual['Battle Result'] = 'Could not find winner' 
        })
        try {
            await closePopups(page).catch(()=>misc.writeToLog('No pop up to be closed.'));
			const UpDateDec = (await page.evaluate(()=>SM.Player.balances.find(x=>x.token=='DEC').balance)).toFixed(2);
            const newERCRaw = await page.evaluate(()=>SM.Player.balances.find(x=>x.token=='ECR').balance);
            let newERC = (newERCRaw.toString()).slice(0, 2)+ "." + (newERCRaw.toString()).slice(2)
            const newRating = await page.evaluate(()=>SM.Player.rating);
            misc.writeToLog('Updated Rating after battle is ' + chalk.yellow(newRating));
            logSummary.push(' New rating: ' + chalk.yellow(newRating));
			logSummary.push(' New DEC Balance: ' + chalk.cyan(UpDateDec + ' DEC'));
            newlogvisual['Rating'] = newRating
            newlogvisual['DEC Balance'] = UpDateDec + ' dec'
			let e = parseInt(newERC);
                if (e >= 50) {
                    newERC = chalk.green(newERC + '%')
                }
                else {
                    newERC = chalk.red(newERC + '%')
                }
                logSummary.push(' Remaining ERC: ' + newERC);
                misc.writeToLog('Remaining ERC: ' + newERC);
                newlogvisual['ECR'] = newERC.replace(/\u001b[^m]*?m/g,"")

        } catch (e) {
            misc.writeToLog(e);
            misc.writeToLog(chalk.blueBright(' Unable to get new rating'));
            misc.writeToLog(chalk.blueBright(' Unable to get remaining ERC'));
            logSummary.push(chalk.blueBright(' Unable to get new rating'));
            logSummary.push(chalk.blueBright(' Unable to get remaining ERC '));
            newlogvisual['Rating'] = 'n/a'
            newlogvisual['DEC Balance'] = 'n/a'
            newlogvisual['ECR']= 'n/a'
        }
        let Newquest = await getQuest();	
		await nq.newquestUpdate(Newquest, claimQuestReward, page, logSummary, allCardDetails, newlogvisual, powerThreshold);
        teamToPlay = '';
        erc='';
        useAPI ='';
        winPercent ='';
        newERC = '';
    } catch (e) {
        clearInterval(twirlTimer);
        readline.cursorTo(process.stdout, 0);
        misc.writeToLog(' Unable to proceed due to error.' + e)
        logSummary.push(chalk.red(' Unable to proceed due to error. Please see logs'));
        return;
    }
  } catch (e) {
      clearInterval(twirlTimer);
      readline.cursorTo(process.stdout, 0);
      misc.writeToLog(' Unable to proceed due to error.' + e)
      return;
  }
}

// 30 MINUTES INTERVAL BETWEEN EACH MATCH (if not specified in the .env file)
const sleepingTimeInMinutes = process.env.MINUTES_BATTLES_INTERVAL || 30;
const sleepingTime = sleepingTimeInMinutes * 60000;

(async() => {
    try {
        if (process.env.TELEGRAM_NOTIF === 'true') { tn.startTG()}
        const loginViaEmail = JSON.parse(process.env.LOGIN_VIA_EMAIL.toLowerCase());
        const accountusers = process.env.ACCUSERNAME.split(',');
        const accounts = loginViaEmail ? process.env.EMAIL.split(',') : accountusers;
        const passwords = process.env.PASSWORD.split(',');
        const headless = JSON.parse(process.env.HEADLESS.toLowerCase());
        const useAPI = JSON.parse(process.env.USE_API.toLowerCase());
        const claimQuestReward = JSON.parse(process.env.CLAIM_QUEST_REWARD.toLowerCase());
        const prioritizeQuest = JSON.parse(process.env.QUEST_PRIORITY.toLowerCase());
        const teleNotif = JSON.parse(process.env.TELEGRAM_NOTIF.toLowerCase());
        const getDataLocal = JSON.parse(process.env.GET_DATA_FOR_LOCAL.toLowerCase());
        const autoSwitch = JSON.parse(process.env.AUTO_SWITCH.toLowerCase());
        await checkForUpdate(teleNotif);
        await checkForMissingConfigs(teleNotif);

        let browsers = [];
        misc.writeToLogNoUsername('Headless: ' + headless);
        misc.writeToLogNoUsername('Login via Email: ' + loginViaEmail);
        misc.writeToLogNoUsername('Get data for local history: ' + getDataLocal);
        misc.writeToLogNoUsername('Claim Quest Reward: ' + claimQuestReward);
        misc.writeToLogNoUsername('Prioritize Quests: ' + prioritizeQuest);
        misc.writeToLogNoUsername('Auto Switch to Local: ' + autoSwitch);
        misc.writeToLogNoUsername('Telegram Notification: ' + teleNotif);
        misc.writeToLogNoUsername('Use API: ' + useAPI);
        misc.writeToLogNoUsername('Loaded ' + chalk.yellow(accounts.length) + ' Accounts');
        misc.writeToLogNoUsername('Accounts: ' + chalk.greenBright(accounts));

        while (true) {
            let logSummary = [];
            let logSummary1 = [];
            let seasonRewards = [];
			let startTimer = new Date().getTime();
			if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender(' Bot Initiated: Battle now starting.' + ' \n' + ' Please wait for the battle results.')};
            for (let i = 0; i < accounts.length; i++) {
                process.env['EMAIL'] = accounts[i];
                process.env['PASSWORD'] = passwords[i];
                process.env['ACCUSERNAME'] = accountusers[i];

                if (browsers.length == 0){
                    misc.writeToLog('Opening browser');
                    browsers = await createBrowsers(1, headless);
                }

                const page = (await browsers[0].pages())[1];

                //page.goto('https://splinterlands.io/');
                misc.writeToLog('getting user cards collection from splinterlands API...')
                const myCards = await getCards()
                    .then((x) => {
                        misc.writeToLog('cards retrieved');
                        return x
                    })
                    .catch(() => misc.writeToLog('cards collection api didnt respond. Did you use username? avoid email!'));
                misc.writeToLog('getting user quest info from splinterlands API...');
                const quest = await getQuest();
                if (!quest) {
                    misc.writeToLog('Error for quest details. Splinterlands API didnt work or you used incorrect username');
                }
                await startBotPlayMatch(page, myCards, quest, claimQuestReward, prioritizeQuest, useAPI, logSummary, getDataLocal , logSummary1, seasonRewards)
                .then(() => {
                    misc.writeToLog('Closing battle \n');
                })
                .catch((e) => {
                    misc.writeToLog(e)
                })

                await page.waitForTimeout(5000);
                if (accounts.indexOf(process.env.ACCUSERNAME) + 1 === accounts.length) {
                    await browsers[0].close();
                    browsers[0].process().kill('SIGKILL');
                    browsers = [];
                } else {
                  
                    await page.evaluate(async function () {
                        await SM.Logout(); // this makes puppeteer faster.
                    }).catch(async function(){ 
                        await browsers[0].close();  // in case game maintenance
                        await browsers[0].process().kill('SIGKILL'); 
                        browsers = [];
                    });        
                } 
            }
            let endTimer = new Date().getTime();
			let totalTime = endTimer - startTimer;
			let tet = ' Total execution time: ' + chalk.green((totalTime / 1000 / 60).toFixed(2) + ' mins')
            console.log('--------------------------Battle Result Summary:----------------------');
            console.log(tet);
			if (unitVersion == 'default'){
                if (accounts.length > 1) {
                    logSummary.forEach(x => console.log(x));
                }
            } else if (unitVersion == 'desktop') {
                console.table(logSummary1)
                if (seasonRewards.length > 0){
                    console.table(seasonRewards)
               }
            } else if (unitVersion == 'mobile') {
                console.table(logSummary1,["Power",'Battle Result','Rating','DEC Balance'])
                console.table(logSummary1,['ERC', 'Quest','Reward'])
                if (seasonRewards.length > 0){
                    console.table(seasonRewards)
               }
            }
			// telegram notification 
			if (process.env.TELEGRAM_NOTIF === 'true') {
				tn.battlesummary(logSummary,tet,sleepingTime, sleep)
			}               
            console.log('----------------------------------------------------------------------');
            console.log('Waiting for the next battle in', sleepingTime / 1000 / 60, ' minutes at ', new Date(Date.now() + sleepingTime).toLocaleString());
            console.log(chalk.green('Interested in a bot that transfers all cards, dec and sps to your main account? Visit the discord or telegram!'));
            console.log(chalk.green('Join the telegram group https://t.me/ultimatesplinterlandsbot and discord https://discord.gg/hwSr7KNGs9'));
            console.log('--------------------------End of Battle--------------------------------');
            browsers = [];
            seasonRewards = [];
            startTimer = '';
            logSummary1= [];
            await new Promise(r => setTimeout(r, sleepingTime));
            
        }
    } catch (e) {
        let browsers = await puppeteer.launch({product: 'chrome'})
        await browsers.close().then(()=> console.log('Chromium is a bitch, have to kill it to save CPU memory.')); 
        await browsers.process().kill('SIGKILL'); 
        if (process.env.TELEGRAM_NOTIF === 'true'){tn.sender("Bot stops due to error. Please see logs for details.")};
        console.log('Routine error at: ', new Date().toLocaleString(), e)
    }
})();