import { Socket } from "./phoenix.js";
import {
  getChannel,
  setSocket,
  setChannel,
  setStatus,
  setPush,
  setResponse,
  clearConnection,
} from "../../stores/connectdata";

export async function connectSocket(wsUrl, topic, params = {}) {
  const existing = getChannel();
  if (existing && existing.topic === topic) {
    return existing;
  }

  if (existing) {
    clearConnection();
  }

  setStatus("connecting");

  return await new Promise((resolve, reject) => {
    const socket = new Socket(wsUrl, { params });
    socket.connect();

    const channel = socket.channel(topic, params);

    channel
      .join()
      .receive("ok", (res) => {
        setSocket(socket);
        setChannel(channel);
        setStatus("connected");
        setResponse(res);
        resolve(channel);
      })
      .receive("error", (resp) => {
        setStatus("error");
        reject(new Error(`Unable to join ${topic}: ${JSON.stringify(resp)}`));
      })
      .receive("timeout", () => {
        setStatus("timeout");
        reject(new Error(`Join timeout for topic ${topic}`));
      });

    channel.onError((error) => {
      setStatus("channel_error");
      setResponse({ event: "channel_error", payload: error });
    });

    channel.onClose(() => {
      setStatus("closed");
    });
  });
}

export function subscribeToEvent(event, callback) {
  const channel = getChannel();
  if (!channel) {
    throw new Error("Phoenix channel is not connected");
  }

  channel.on(event, (payload) => {
    setResponse({ event, payload });
    callback(payload);
  });
}

export function pushEvent(event, payload) {
  return setPush({ event, parameter: payload });
}

export function disconnectSocket() {
  clearConnection();
}
