import { atom } from 'nanostores';


const prefix = "http://192.168.50.152:4000/static/uploads"
const game_id = atom()

const nano_socket = atom();
const nano_channel = atom();
const nano_response = atom();
const nano_status = atom();
const nano_device = atom();

const setSocket = (s)=>{
  nano_socket.set(s)
}
const setChannel = (s)=>{
  nano_channel.set(s)
}

//s -> {event: "ping", parameter: {}}
const setPush = (s)=>{
  const activeChannel = nano_channel.get()
  if (!activeChannel) {
    throw new Error("Phoenix channel is not connected")
  }
  return activeChannel.push(s.event, s.parameter)
}
const setStatus = (s)=>{
  nano_status.set(s)
}
const setDevice = (s)=>{
  nano_device.set(s)
}
const setResponse = (s)=>{
  nano_response.set(s)
}

const resetResponse = (s)=>{
  const current_response = nano_response.get()
nano_response.set({...current_response, event: ""})
}

const getSocket = ()=> nano_socket.get()
const getChannel = ()=> nano_channel.get()

const clearConnection = ()=>{
  const activeChannel = nano_channel.get()
  const activeSocket = nano_socket.get()

  if (activeChannel) {
    activeChannel.leave()
  }

  if (activeSocket) {
    activeSocket.disconnect()
  }

  nano_channel.set(undefined)
  nano_socket.set(undefined)
  nano_status.set("disconnected")
}

export {
  prefix,
  game_id,
  nano_socket,
  nano_channel,
  nano_status,
  nano_device,
  nano_response,
  setSocket,
  setChannel,
  setStatus,
  setPush,
  setResponse,
  resetResponse,
  setDevice,
  getSocket,
  getChannel,
  clearConnection,
};
