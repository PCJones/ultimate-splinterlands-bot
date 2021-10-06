
const cardsDetails = require("./data/cardsDetails.json");
const card = require("./cards")

// const teamIdsArray = [167, 192, 160, 161, 163, 196, '', 'fire'];

//cardColor = (id) => cardsDetails.find(o => o.id === id) ? cardsDetails.find(o => o.id === id).color : '';

// const tes = teamIdsArray.forEach(id => {
//     console.log('DEBUG', id, cardColor(id))
//     if (validDecks.includes(cardColor(id))) {
//         return colorToDeck[cardColor(id)];
//     }
// })

function teamActualSplinterToPlay(splinters,teamIdsArray) {

    const validDecks = ['Red', 'Blue', 'White', 'Black', 'Green']
    const colorToDeck = { 'Red': 'Fire', 'Blue': 'Water', 'White': 'Life', 'Black': 'Death', 'Green': 'Earth' }
    const deckValidColor = (accumulator, currentValue) => validDecks.includes(card.color(currentValue)) ? colorToDeck[card.color(currentValue)] : accumulator;

    if (!teamIdsArray.reduce(deckValidColor, '')){
        colorElement = splinters[0].charAt(0).toUpperCase() + splinters[0].slice(1).toLowerCase()
    } else { 
      colorElement = teamIdsArray.reduce(deckValidColor, '')
    }
    return colorElement
}


module.exports.teamActualSplinterToPlay = teamActualSplinterToPlay;