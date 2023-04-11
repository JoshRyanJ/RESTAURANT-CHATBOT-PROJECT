//importing modules
const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const session = require("express-session");

//creating the server
const server = http.createServer(app);
//socket.io server set up
const io = require("socket.io")(server, { pingTimeout: 60000 });

//to serve static files
app.use(express.static(path.join(__dirname, "public")));

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleware);
io.use((socket, next) =>
  sessionMiddleware(socket.request, socket.request.res, next)
);
//let's define the menulist
const menuList = {
  2: "Moimoi",
  3: "Ghana Jollof",
  4: "Nigerian Jollof",
  5: "Eba and Egusi",
  6: "Chinchin and CoaCola",
};

const menuHTML = `<br> 2: Moimoi<br>
3: Ghana Jollof <br>
4: Nigerian Jollof<br>
5: Eba and Egusi <br>
6: Chinchin and CocaCola<br> `;

//to create how to store the history
let orderHistory = [];

io.on("connection", function (socket) {
  console.log("User with ID: " + socket.id + ", connected!");

  let username = "";


  //listen for message from client side
  socket.on("newuser", (message) => {});

  // Define the bot message function
  const sendBotMessage = (message) => {
    socket.emit("bot-message", message);
  };

  // Ask for user's name
  sendBotMessage("Hello! What's your name?");

  socket.request.session.currentOrder = [];

  // Define user name
  let userName = "";

  // Listen for incoming user messages
  socket.on("chat", (message) => {
    console.log("User message received:", message);

    if (!userName) {
      // Save user's name and update the welcome message
      userName = message.username;
      sendBotMessage(
        `Welcome to Jans Eatery, <b>${userName}! </b> <br> <br>
          Select 1 to place order <br>
          Select 99 to checkout order. <br>

Select 98 to see order History. <br>
          Select 97 to view current order. <br>
          Select 0 to Cancel order`
      );
    } else {
      switch (message.text) {
        case "1":
          // Generate the list of items dynamically
          const itemOptions = Object.keys(menuList)
            .map((key) => `${key}. ${menuList[key]}`)
            .join("\n");
          sendBotMessage(
            `Please take a look at the menu: ${menuHTML} select one by typing its corresponding number.`
          );
          break;
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
          // Parse the number from the user input and add the corresponding item to the current order
          const selectedIndex = parseInt(message.text);
          if (menuList.hasOwnProperty(selectedIndex)) {
            const selectedItem = menuList[selectedIndex];
            socket.request.session.currentOrder.push(selectedItem);
            sendBotMessage(
`${selectedItem} has been added to your order. Do you want to add anthing else to your order?. If no,input 99 to checkout.`
            );
          } else {
            sendBotMessage("Invalid selection.");
          }
          break;
        case "99":
          if (socket.request.session.currentOrder.length === 0) {
            sendBotMessage("No order placed. select 1 to See menu");
          } else {
            orderHistory.push(socket.request.session.currentOrder);
            sendBotMessage("Order placed");
            socket.request.session.currentOrder = [];
          }
          break;
        case "98":
          if (orderHistory.length === 0) {
            sendBotMessage("No previous orders");
          } else {
            const orderHistoryString = orderHistory
              .map((order, index) => `Order ${index + 1}: ${order.join(", ")}`)
              .join("\n");
            socket.emit(
              "bot-message",
`Here is your order history: ${orderHistoryString}`
            );
          }
          break;

        case "97":
          if (socket.request.session.currentOrder.length === 0) {
            sendBotMessage("No current order. See menu");
          } else {
            const currentOrderString =
              socket.request.session.currentOrder.join(", ");
            sendBotMessage(`Here is your current order: ${currentOrderString}`);
          }
          break;
        case "0":
          socket.request.session.currentOrder = [];
          sendBotMessage("Order cancelled. Send 1 to See menu");
          break;
        default:
          sendBotMessage("Invalid selection. Please try again.");
          break;
      }
    }
  });

socket.on("newuser", function (username) {
    console.log("User connected:", username);
    socket.broadcast.emit("update", username + " joined the conversation");
  });

  socket.on("exituser", function (username) {
    socket.emit("update", username + " left the conversation");
  });

  //   socket.on("chat", function (message) {
  //     console.log("user started chatting!");
  //     socket.emit("chat", message);
  //   });
});

server.listen(5000, () => {
  console.log("Server listening on: 5000");
});
