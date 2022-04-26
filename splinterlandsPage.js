require('dotenv').config()
const misc = require('./misc');
const axios = require('axios');
const Promise = require('bluebird');


async function makeGetRequest(path, setTimeOut) {
    return new Promise(function (resolve, reject) {
        axios.get(path, { timeout: setTimeOut }).then(
            (response) => {
                resolve(response.data);
            },
            (error) => {
                reject(error);
            }
        );
    });
}

async function login(page) {

    try {
        await page.waitForSelector('#log_in_button > button').then(async () => await page.evaluate(async()=>await SM.ShowLogin(SM.ShowAbout)))
        await page.waitForSelector('#email',{visible: true, timeout: 10000})
            .then(() => page.focus('#email'))
            .then(() => page.type('#email', process.env.ACCUSERNAME))
            .then(() => page.focus('#password'))
            .then(async() =>{ 
                await page.waitForTimeout(1000)
                await page.type('#password', process.env.PASSWORD)})
            .then(async ()=> await page.waitForSelector('#loginBtn',{visible: true, timeout: 10000}))
            .then(async button=> await button.click('button#loginBtn.btn.btn-primary.btn-lg'))
            .then(async () => {
                await page.waitForNavigation({timeout:30000}).then(()=>{
                    if (!page.url().includes('?p=about-player')) throw new Error("Page didn't load");
                }).then(()=>{
                        misc.writeToLog('logged in!')
                    })
                    .catch(async()=>{
                        await page.waitForSelector('#log_in_text', {visible: true, timeout: 10000})
                        .then(()=>{
                            misc.writeToLog('logged in!')
                        }).catch(e=>{
                            misc.writeToLog('didnt login');
                            throw new Error('Didnt login');
                        })    
                    })      
                })
    } catch (e) {
        console.log(e)
        throw new Error('Check that you used correctly username and posting key or email and password.');
    }
}


exports.checkMatchSetup  = async function (page) {
    let i = 0, APIurl = ['api2.splinterlands.com', 'api.splinterlands.io', 'game-api.splinterlands.io', 'api.steemmonsters.io']
    while (true) {
        var battleCondition = await makeGetRequest(`https://${APIurl[i]}/players/outstanding_match?username=${process.env.ACCUSERNAME}`, 10000).catch(() => { return undefined })
        if (battleCondition != undefined || battleCondition.mana_cap != null) break;
        if (i > (APIurl.length + 1)) break;
        await page.reload();
        i++;
    }
    
    const splinterRaw = battleCondition.inactive.split(',')
    let inactiveElement = []
    splinterRaw.forEach(element => {
        result = element == 'Red' ? 'fire' : element == 'Blue' ? 'water' : element == 'White' ? 'life' : element == 'Black' ? 'death' : element == 'Green' ? 'earth' : 'dragon';
        inactiveElement.push(result)
    })
    const splinterElement = ['fire', 'water', 'life', 'death', 'earth', 'dragon']
    let availElement = []
    splinterElement.forEach(activeElem => {
        let elementers = inactiveElement.findIndex(o => o == activeElem);
        if (elementers == -1) availElement.push(activeElem)
    })

    return {
        mana: battleCondition.mana_cap,
        rules: battleCondition.ruleset,
        splinters: availElement
    }

}

exports.login = login;
