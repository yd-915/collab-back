const axios = require("axios");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  removePassword,
} = require("../utils/Users");

module.exports = function (io) {
  try {
    io.on("connection", (socket) => {
      socket.on("join", ({ username, room, password }, callback) => {
        try {
          const { error, user } = addUser({
            id: socket.id,
            username,
            room,
            password,
          });

          if (error) {
            return callback({ error });
          }
          try {
            socket.join(user.room);

            console.log("A new user joined", user.room, user.username);
          } catch (e) {
            return console.log("cant join");
          }

          //To get data for newly connected client from the room
          const socketsInstances = async () => {
            try {
              const clients = await io.in(user.room).fetchSockets();
              const teamMembers = getUsersInRoom(user.room);
              io.to(user.room).emit("peopleInRoom", {
                teamMembers,
                userJoin: user.username,
              });
              //counts how many users are active in room
              let res = "";
              if (clients.length > 1) {
                //make functions for getting data
                let askedCnt = 0;

                for (const client of clients) {
                  if (askedCnt == 5) break;
                  if (client.id === socket.id) continue;

                  askedCnt++;
                  io.to(client.id).emit("sendInitialIO", { id: socket.id });
                }
              }
            } catch (e) {}
          };

          socketsInstances();
          return callback({ user });
        } catch (e) {
          console.log(e);
        }
      });

      socket.on("takeInitialIO", (data) => {
        try {
          if (data.reason === "code-editor") {
            console.log("takeInitialIO", data.inputText, data.outputText);
            io.to(data.id).emit("IO_recieved", {
              inputText: data.inputText,
              outputText: data.outputText,
            });
          }
        } catch (e) {
          console.log(e);
        }
      });
      //real-time updates on the change in IO 
      socket.on("changeIO", (data) => {
        try {
          if (data.reason === "code-editor") {
            const sids = io.of("/").adapter.sids; //sids gives map of every user socketid to its room
            const room = [...sids.get(socket.id)][1];
            if (!room) return;
            socket.broadcast.to(room).emit("IO_recieved", data);
          }
        } catch (e) {
          console.log(e);
        }
      });
      //Disconnecting the user and updating , notifying other people in the room about the user
      socket.on("disconnect", () => {
        try {
          const user = removeUser(socket.id);

          if (!user) return;

          console.log("disconnecting", user);

          if (user) {
            try {
              const socketsInstances = async () => {
                const clients = await io.in(user.room).fetchSockets();
                const teamMembers = getUsersInRoom(user.room);
                if (clients.length) {
                  io.to(user.room).emit("peopleInRoom", {
                    teamMembers,
                    userLeft: user.username,
                  });
                }

                if (clients.length == 0) {
                  removePassword(user.room);
                }
                socket.leave(user.room);
                console.log("Disconnected");
              };
              socketsInstances();
            } catch (e) {
              console.log(e);
            }
          }
        } catch (e) {
          console.log(e);
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
};
