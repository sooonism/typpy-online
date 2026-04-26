import { atom } from 'nanostores';

const initUser = {avatar: "avatar", user_name:"user name"}
const initialValue = [{ user: initUser, content:"hello" }];

const chatdata = atom(initialValue);

const addChat = (s) => {
    // console.log("chatdata addchat, ", s)
    const currentArray = chatdata.get();
    // console.log("chatdata currentArray, ", currentArray)
    const v = { user: initUser, content: s }
    chatdata.set([...currentArray, v])
    // console.log("chatdata chatdata, ", chatdata.get())
}

const collections = atom([
{url:"../images/1-o.jpg"},
{url:"../images/2-o.jpg"},
{url:"../images/3-o.jpg"}
])

export { chatdata, addChat, collections };
