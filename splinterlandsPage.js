const misc = require('./misc');
require('dotenv').config()

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

async function checkMana(page) {
    var manas = await page.evaluate(() => {
        var manaCap = document.querySelectorAll('div.mana-total > span.mana-cap')[0].innerText;
        var manaUsed = document.querySelectorAll('div.mana-total > span.mana-used')[0].innerText;
        var manaLeft = manaCap - manaUsed
        return { manaCap, manaUsed, manaLeft };
    });
    misc.writeToLog('manaLimit', manas);
    return manas;
}

async function checkMatchMana(page) {
    const mana = await page.$$eval("div.col-md-12 > div.mana-cap__icon", el => el.map(x => x.getAttribute("data-original-title")));
    let manaValue = parseInt(mana[0].split(':')[1], 10);
    if (manaValue == 0) {
        page.reload();
        page.waitForTimeout(5000)
        manaValue = parseInt(mana[0].split(':')[1], 10);
    }
    return manaValue;
}

async function checkMatchRules(page) {
    const rules = await page.$$eval("div.combat__rules > div.row > div>  img", el => el.map(x => x.getAttribute("data-original-title")));
    return rules.map(x => x.split(':')[0]).join('|')
}

async function checkMatchActiveSplinters(page) {
    const splinterUrls = await page.$$eval("div.col-sm-4 > img", el => el.map(x => x.getAttribute("src")));
    return splinterUrls.map(splinter => splinterIsActive(splinter)).filter(x => x);
}

//UNUSED ?
const splinterIsActive = (splinterUrl) => {
    const splinter = splinterUrl.split('/').slice(-1)[0].replace('.svg', '').replace('icon_splinter_', '');
    return splinter.indexOf('inactive') === -1 ? splinter : '';
}

exports.login = login;
exports.checkMana = checkMana;
exports.checkMatchMana = checkMatchMana;
exports.checkMatchRules = checkMatchRules;
exports.checkMatchActiveSplinters = checkMatchActiveSplinters;
exports.splinterIsActive = splinterIsActive;