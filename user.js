const fetch = require("cross-fetch");
const basicCards = require('./data/basicCards'); //phantom cards available for the players but not visible in the api endpoint

const getPlayerCards = async (username, oneDayAgo, APIs) => (await fetch(`${APIs}${username}`)
  .then(async x => x && await x.json())
  .then(x => x['cards'] ? x['cards'].filter(x=>(x.delegated_to === null || x.delegated_to === username)
  && (x.market_listing_type === null || x.delegated_to === username)
  && (!(x.last_used_player !== username && Date.parse(x.last_used_date) > oneDayAgo))).map(card => card.card_detail_id) : '')
  .then(advanced => basicCards.concat(advanced)).catch(e => {return undefined})  
)

exports.getPlayerCards = getPlayerCards;