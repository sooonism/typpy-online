import { atom } from 'nanostores';
const init_player = {name:"user name", cards:[]}
const init_cards = {cards:[]}

const hello = atom("hello how are you");
const nano_deck = atom(init_cards);
const nano_table = atom(init_cards);

const nano_players = atom();

const updateDeck = (deck) => {
    const current_deck = nano_deck.get();
    nano_deck.set({ ...current_deck, cards: deck });
}
const updateTable = (table) => {
    const current_table = nano_table.get();
    nano_table.set({ ...current_table, cards: table });
}

const updatePlayers = (players) => {
    const current_players = nano_players.get();
    nano_players.set({players});
}

///if index == -1, means table
const addCard = (index, card) => {
  let current_cards
  switch(index){
    case -1:
      const current_table = nano_table.get()
      current_cards = current_table.cards
      current_cards.push(card)
      break
    default:
      const current_players = nano_players.get()
      current_cards = current_players.players[index].cards
      current_cards.push(card)
    break
}
}

const removeCard = (index, card_index) => {
  const current_players = nano_players.get()
  let current_cards = current_players.players[index].cards
  current_cards.splice(card_index, 1)
}

// const  = (index, card) => {
//     ///get role cards
//     ///removecard
// }

export { nano_deck,nano_players, nano_table, updateDeck, updateTable, updatePlayers, addCard, removeCard };
