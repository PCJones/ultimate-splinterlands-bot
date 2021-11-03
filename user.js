const fetch = require("cross-fetch");
const basicCards = require('./data/basicCards'); //phantom cards available for the players but not visible in the api endpoint

getPlayerCards = async (username, oneDayAgo) => (await fetch(`https://api.splinterlands.io/cards/collection/${username}`)//,
  //{ "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(async x => {if (!x.ok){throw new Error('Network response was not ok ');} x && x.json()})
  .then(x => x['cards'] ? x['cards'].filter(x=>(x.delegated_to === null || x.delegated_to === username)
  && (x.market_listing_type === null || x.delegated_to === username)
  && (!(x.last_used_player !== username && Date.parse(x.last_used_date) > oneDayAgo))).map(card => card.card_detail_id) : '')
  .then(advanced => basicCards.concat(advanced))
   .catch(async (e)=> {
    console.log('Error: api.splinterlands did not respond trying game-api.slinterlands... '); //2nd try
    await fetch(`https://game-api.splinterlands.io/cards/collection/${username}`)
    .then(async x => {if (!x.ok){throw new Error('Network response was not ok ');} x && x.json()})
    .then(x => x['cards'] ? x['cards'].filter(x=>(x.delegated_to === null || x.delegated_to === username) 
	  && (x.market_listing_type === null || x.delegated_to === username)
	  && (!(x.last_used_player !== username && Date.parse(x.last_used_date) > oneDayAgo))).map(card => card.card_detail_id) : '')
      .then(advanced => basicCards.concat(advanced))
      .catch(async (e)=> {
        console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... '); //3rd try
        await fetch(`https://api.steemmonsters.io/cards/collection/${username}`)
        .then(async x => {if (!x.ok){throw new Error('Network response was not ok ');} x && x.json()})
        .then(x => x['cards'] ? x['cards'].filter(x=>(x.delegated_to === null || x.delegated_to === username) 
        && (x.market_listing_type === null || x.delegated_to === username)
        && (!(x.last_used_player !== username && Date.parse(x.last_used_date) > oneDayAgo))).map(card => card.card_detail_id) : '')
          .then(advanced => basicCards.concat(advanced))
          .catch(async (e)=> {
            console.log('Error: api.steemmonsters did not respond trying api2.slinterlands... '); //4th try
            await fetch(`https://api2.splinterlands.com/cards/collection/${username}`)
            .then(async x => {if (!x.ok){throw new Error('Network response was not ok ');} x && x.json()})
            .then(x => x['cards'] ? x['cards'].filter(x=>(x.delegated_to === null || x.delegated_to === username) 
            && (x.market_listing_type === null || x.delegated_to === username)
            && (!(x.last_used_player !== username && Date.parse(x.last_used_date) > oneDayAgo))).map(card => card.card_detail_id) : '')
              .then(advanced => basicCards.concat(advanced))
        .catch(e => {
          console.log('Using only basic cards due to error when getting user collection from splinterlands: ',e); 
          return basicCards
        })  
      })    
    })         
  })
)

module.exports.getPlayerCards = getPlayerCards;