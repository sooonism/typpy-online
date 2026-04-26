import { atom } from 'nanostores';

const initUser = {avatar: "", username:"", email: "",}

const user_data = atom(initUser);
const logged_in = atom(false);

const setUser = (user, token)=>{
  const newUser = {
    avatar: user.avatar? user.avatar:initUser.avatar,
    username: user.username? user.username:initUser.username,
    email: user.email? user.email:initUser.email,
  }
  user_data.set(newUser)

  localStorage.setItem("user_token", token)
  localStorage.setItem("user", JSON.stringify(user))
}

function checkUser(){
  // localStorage.getItem("user_token")
  const user = JSON.parse(localStorage.getItem("user"))
  if(user !== null){
    const newUser = {
    avatar: user.avatar? user.avatar:initUser.avatar,
    username: user.username? user.username:initUser.username,
    email: user.email? user.email:initUser.email,
    }
    user_data.set(newUser)
    logged_in.set(true)
  }
}

export {user_data,logged_in, setUser, checkUser};
