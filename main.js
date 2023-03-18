//import { parse } from "qs";
const chatForm = document.getElementById("chat-form");
const input = document.getElementById("msg");
const chatMessages = document.querySelector(".chat-messages");

const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username });

// Message from server
socket.on("message", (message) => {
  //console.log(message);

  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// chat Message from server
socket.on("cmessage", (message) => {
  console.log(message);
  outputChatMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Handle receiving messages from the server
socket.on("bot-message", (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message from server
socket.on("options", ({ msg }) => {
  optionMessage(msg);
});

// Handle sending messages
function sendMessage() {
  const message = inputField.value.trim();
  if (message === "") {
    return;
  }
  //appendMessage(message, "user");
  socket.emit("user-message", message);
  inputField.value = "";
}

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", msg);

  socket.emit("user-message", message);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message;
  div.appendChild(p);

  chatMessages.appendChild(div);
  //chatMessages.innerText = message;
  input.value = " ";
}
// Output message to DOM
function outputChatMessage(message) {
  const div = document.createElement("div");
  div.classList.add("umessage");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message;
  div.appendChild(p);

  //chatMessages.classList.add("chat-house-move");
  chatMessages.appendChild(div);

  //chatMessages.innerText = message;
}
function optionMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = msg.options;
  div.appendChild(p);

  chatMessages.appendChild(div);
  //chatMessages.innerText = message;
  input.value = " ";
}
