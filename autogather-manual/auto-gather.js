require('dotenv').config()
const fetch = require("cross-fetch");
const fs = require('fs');
const readline = require('readline');

const accountusers = process.env.ACCOUNT.split(',');
const accounts = accountusers;

const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

function uniqueListByKey(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}

function twirlTimer() {
  var P = ["Processing |", "Processing /", "Processing -", "Processing \\"];
  var x = 0;
  return setInterval(function() {
    process.stdout.write("\r" + P[x++]);
    x &= 3;
  }, 250);
};
async function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

twirlTimer();

const URL = [`http://game-api.splinterlands.io/battle/history?player=`,`http://api.splinterlands.io/battle/history?player=`, `http://api.steemmonsters.io/battle/history?player=`];

async function getBattleHistory(player = '', data = {}) {
    const randomURL = URL[Math.floor(Math.random() * URL.length)];
    const battleHistory = await fetch(randomURL + player,{
            method: 'get',
            headers: {'Content-Type': 'application/json'}})
          .then(async (response) => {
              if (!response.ok) {
                  throw new Error('Network response was not ok '+player);
              }
              return await response;
          })
          .then(async (battleHistory) => {
              if (!battleHistory){
                  throw new Error;
              } else {
              return await battleHistory.json();
            }
          })
        .catch((error) => {
            readline.cursorTo(process.stdout, 0);
            console.error('There has been a problem with your fetch operation:', error);
          }); 
    return await battleHistory.battles;
}

const extractGeneralInfo = (x) => {
    return {
        mana_cap: x.mana_cap ? x.mana_cap : '',
        ruleset: x.ruleset ? x.ruleset : '',
    }
}

const extractMonster = (team) => {
    const monster1 = team.monsters[0];
    const monster2 = team.monsters[1];
    const monster3 = team.monsters[2];
    const monster4 = team.monsters[3];
    const monster5 = team.monsters[4];
    const monster6 = team.monsters[5];

    return {
        summoner_id: team.summoner.card_detail_id,
        monster_1_id: monster1 ? monster1.card_detail_id : '',
        monster_2_id: monster2 ? monster2.card_detail_id : '',
        monster_3_id: monster3 ? monster3.card_detail_id : '',
        monster_4_id: monster4 ? monster4.card_detail_id : '',
        monster_5_id: monster5 ? monster5.card_detail_id : '',
        monster_6_id: monster6 ? monster6.card_detail_id : '',
    }
}

let battlesList = [];
let promises = [];
const battles = async (player) =>  await getBattleHistory(player)
.then(u => u.map(x => { 
return [x.player_1, x.player_2] 
}).reduce((acc, val) => acc.concat(val), []).filter(distinct))
.then(ul => ul.map(user => {
    promises.push(
      getBattleHistory(user)
      .then(battles => battles.map(
        battle => {
          const details = JSON.parse(battle.details);
          if (details.type != 'Surrender') {
            if (battle.winner && battle.winner == battle.player_1) {
              const monstersDetails = extractMonster(details.team1)
              const info = extractGeneralInfo(battle)
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_1,
                //winner: battle.player_1,
                //verdict: (winner && winner == battle.player_1)?'w':(winner == 'DRAW')? 'd' :'l',
              }
            } else if (battle.winner && battle.winner == battle.player_2) {
              const monstersDetails = extractMonster(details.team2)
              const info = extractGeneralInfo(battle)
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_2,
                //winner: battle.player_2,
                //verdict: (winner && winner == battle.player_2)?'w':(winner == 'DRAW')? 'd' :'l',
              }
            }
          }
        })
      )
      .then(x => battlesList = [...battlesList, ...x])
    )
  }))
  .then(() => { return Promise.all(promises) })
  .then(() => { return new Promise((res,rej) => {
	  let bb1 = battlesList.length,bb2=bb1;
    fs.readFile(`./${process.env.FILE_NAME}`, 'utf8', (err, data) => {
      if (err) {
        readline.cursorTo(process.stdout, 0);
        console.log(`Error reading file from disk: ${err}`); rej(err)
      } else {
        let battlesList = data ? [...battlesList, ...JSON.parse(data)] : battlesList;
      }
      readline.cursorTo(process.stdout, 0);
      console.log('battles',bb3=battlesList.length-bb2);
      battlesList = uniqueListByKey(battlesList.filter(x => x != undefined), "battle_queue_id")
	    console.log('battles',bb4=battlesList.length-bb3,' added')
	    console.log('total battle',battlesList.length+bb4);
      fs.writeFile(`./${process.env.FILE_NAME}`, JSON.stringify(battlesList), function (err) {
        if (err) {
          readline.cursorTo(process.stdout, 0);
          console.log(err,'a'); rej(err);
        }
        var battlesList = [],
        var promises = [];
      });
      res(battlesList)
    });
  }) }) 
  clearInterval(twirlTimer())
  readline.cursorTo(process.stdout, 0);
module.exports.battlesList = battles;
