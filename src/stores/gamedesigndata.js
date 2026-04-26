import { atom } from 'nanostores';
/// user gamedesign data
const initUser = {avatar: "avatar", user_name:"user name"}
const initialValue = [
  {
    "title": "Slap Rule!",
    "url": "/images/slap_rule/cover.png",
    "link": "/game/details?g=slap_rule",
    "selected": true,
    "price": 69.0
        },
        {
    "title": "Blacknab",
    "url": "/images/blacknab/cover.png",
    "selected": false,
    "price": 69.0
        },
];

const gamedesign_data = atom(initialValue);

const addToGamedesign = (s) => {
    const current_gamedesign = gamedesign_data.get();
    const v = { user: initUser, content: s }
    gamedesign_data.set([...current_gamedesign, v])
}

export { gamedesign_data, addToGamedesign };
