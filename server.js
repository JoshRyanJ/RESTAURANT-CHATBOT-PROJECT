const express = require("express");
const path = require("path");
require("dotenv").config();
const http = require("http");
const socketio = require("socket.io");
const session = require("express-session");
const sharedsession = require("express-socket.io-session");

const PORT = process.env.PORT || 4000;
const secret_key = process.env.SESSION_SECRET;
const app = express();
const msg = require("./utils/messages");

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = socketio(server);

const sessionMiddleware = session({
  secret: secret_key,
  resave: false,
  saveUninitialized: true,
});

//app.use(express.static("public"));
app.use(sessionMiddleware);

io.use(
  sharedsession(sessionMiddleware, {
    autoSave: true,
  })
);

const fastFoods = {
  2: "Banku",
  3: "Ghana Jollof",
  4: "Moimoi",
  5: "Burger",
};

// io.use((socket, next) => {
//   sessionMiddleware(socket.request, socket.request.res, next);
// });

// Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username }) => {
    //console.log(username);

    const orderHistory = [];
    const state = {
      userName: "",
      currentOrder: [],
    };

    const botMessage = async (message) => {
      console.log("Bot message received:", message);
      socket.emit("bot-message", message);
    };

    const userMessage = async (message) => {
      try {
        switch (message) {
          case "1":
            // Generate the list of items dynamically
            const itemOptions = Object.keys(fastFoods)
              .map((key) => `${key}. ${fastFoods[key]}`)
              .join("\n");
            await botMessage(
              `Here is a list of items you can order:\n ${itemOptions} \nPlease select one by typing its number.`
            );
            break;
          case "2":
          case "3":
          case "4":
          case "5":
            // Parse the number from the user input and add the corresponding item to the current order
            const selectedIndex = parseInt(message);
            if (fastFoods.hasOwnProperty(selectedIndex)) {
              const selectedItem = fastFoods[selectedIndex];
              state.currentOrder.push(selectedItem);
              console.log(`current orde: ${state.currentOrder}`);
              orderHistory.push(state.currentOrder);
              await botMessage(
                `${selectedItem} has been added to your order. Do you want to add more items to your order? Type numbers. If not, type 99 to checkout.`
              );
            } else {
              await botMessage("Invalid selection.");
            }
            break;
          case "99":
            if (state.currentOrder.length === 0) {
              await botMessage(
                "No order to place. Please Place an order\n1. See menu"
              );
            } else {
              orderHistory.push(state.currentOrder);
              await botMessage("Order placed");
              // socket.handshake.session.orderHistory = orderHistory;
              // socket.handshake.session.save();
              //await botMessage("Order placed");
              state.currentOrder = [];
            }
            break;
          case "98":
            if (orderHistory.length === 0) {
              await botMessage("No previous orders");
            } else {
              //const orderHistoryString = socket.handshake.session.orderHistory
              const orderHistoryString = orderHistory
                .map(
                  (order, index) => `Order ${index + 1}. ${order.join(", ")}`
                )
                .join("\n");
              await botMessage(
                `Here are your previous orders:\n${orderHistoryString}`
              );
            }
            break;
          case "97":
            if (state.currentOrder.length === 0) {
              await botMessage("No current order");
            } else {
              const currentOrderString = state.currentOrder.join(", ");
              await botMessage(
                `Here is your current order:\n${currentOrderString}`
              );
            }
            break;
          case "0":
            if (state.currentOrder.length === 0) {
              await botMessage("No order to cancel");
            } else {
              state.currentOrder = [];
              await botMessage("Order canceled");
            }
            break;
          default:
            await botMessage("Invalid input");
        }
      } catch (err) {
        console.log(err);
        await botMessage("An error occurred while processing your request.");
      }
    };

    socket.on("chatMessage", userMessage);

    // Broadcast when a user connects
    socket.emit("message", `Welcome ${username}`);
    // Broadcast when a user connects
    socket.emit("options", { msg });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    socket.emit("chatMessage", msg);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
