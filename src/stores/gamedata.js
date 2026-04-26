import { atom } from 'nanostores';
/// user fav games
const initUser = {avatar: "avatar", user_name:"user name"}
const initialValue = [
  {
    "title": "Blacknab",
    "url": "/images/blacknab/cover.png",
    "link": "/game/details?g=blacknab",
    "price": 69.0
        },
        {
    "title": "Slap Rule!",
    "url": "/images/slap_rule/cover.png",
    "link": "/game/details?g=slap_rule",
    "price": 69.0
        },
];

const game_data = atom(initialValue);

const addToGame = (s) => {
    // console.log("game_data addToGame, ", s)
    const current_game = game_data.get();
    // console.log("game_data current_game, ", current_game)
    const v = { user: initUser, content: s }
    game_data.set([...current_game, v])
    // console.log("game_data game_data, ", game_data.get())
}

const collections = atom([
{url:"../images/1-o.jpg"},
{url:"../images/2-o.jpg"},
{url:"../images/3-o.jpg"}
])

export { game_data, addToGame, collections };
