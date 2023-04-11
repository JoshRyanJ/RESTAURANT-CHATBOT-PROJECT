(function () {
    const home = document.querySelector(".home");
    const socket = io("localhost:5000");
  
    let uname;
  
    home
      .querySelector(".join-screen #join-user")
      .addEventListener("click", function () {
        let username = home.querySelector(".join-screen #username").value;
        if (username.length == 0) {
          return;
        }
        socket.emit(`newuser`, username);
        uname = username;
        home.querySelector(".join-screen").classList.remove("active");
        home.querySelector(".chat-screen").classList.add("active");
      });
  
    home
      .querySelector(".chat-screen #send-message")
      .addEventListener("click", function () {
        let message = home.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) {
          return;
        }
        renderMessage("my", {
          username: uname,
          text: message,
        });
  
        socket.emit("chat", {
          username: uname,
          text: message,
        });
  
        //   socket.on("bot-message", {
        //     botName: "Alec",
        //     text: message,
        //   });
  
        // socket.on('bot-message', (message) => {
        //     Message('Alec',
        //         botName = 'Alec',
        //         text = message
        //     )
        // })
  
        home.querySelector(".chat-screen #message-input").value = "";
      });
    //   console.log(home.querySelector("#exit-chat"));
    home.querySelector("#exit-chat").addEventListener("click", function () {
      socket.emit("exituser", uname);
      window.location.href = window.location.href;
    });
    socket.on("bot-message", function (message) {
      renderMessage("bot", message);
    });
  
    socket.on("chat", function (message) {
      console.log("bot response here!");
    });
    function renderMessage(type, message) {
      let messageContainer = home.querySelector(".chat-screen .messages");
      if (type == "my") {
        let el = document.createElement("div");
        el.setAttribute("class", "message my-message");
        el.innerHTML = `
             <div>
                <div class="name">You</div>
                <div class='text'>${message.text}</div>
             </div>
             `;
        messageContainer.appendChild(el);
      } else if (type == "bot") {
        let el = document.createElement("div");
        el.setAttribute("class", "message bot-message");
        el.innerHTML = `
              <div>
                 <div class="name">Bot</div>
                 <div class='text'>${message}</div>
              </div>
              `;
        messageContainer.appendChild(el);
      } else if (type == "update") {
        let el = document.createElement("div");
        el.setAttribute("class", "update");
        el.innerTEXT = message;
        messageContainer.appendChild(el);
      }
  
      // const div = document.createElement('div')
      // div.classList.add('message');
      // div.innerText =
      messageContainer.scrollTop =
        messageContainer.scrollHeight - messageContainer.clientHeight;
    }
  })();
  