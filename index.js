const express = require('express');
// const http = require('http');
const app = express();
const fs = require('fs');
const path = require('path');

// var options = {
//   key: fs.readFileSync('/home/nitin_goswami/Choira/JammingApp/video-group-jamming/client/ssls/privkey.pem'),
//   cert: fs.readFileSync('/home/nitin_goswami/Choira/JammingApp/video-group-jamming/client/ssls/fullchain.pem')
// };


var privateKey = fs.readFileSync('ssls/privkey.pem', 'utf8').toString();
var certificate = fs.readFileSync('ssls/cert.pem', 'utf8').toString();
var chain = fs.readFileSync('ssls/chain.pem').toString();
var options = {
  cors: {
    origins: ["*"], // 'https://ket-jam.deploy.choira.io',
    methods: ["GET", "POST"]
},
key: fs.readFileSync('./ssls/privkey.pem'),
cert: fs.readFileSync('./ssls/cert.pem'),
ca: fs.readFileSync('./ssls/chain.pem')
};

const http = require('http').createServer(options,app);
// const http = require('http').createServer(app);
// const http = require('http').createServer(options,app);

// const http_proxy = require('http-proxy').createProxyServer({
//   target: "http://localhost:3000",
//   ws: true,
// }).listen(app);

const io = require('socket.io')(http,{path:'/socket.io',cors:{
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Origin", "Content-Type", "X-Auth-Token", "X-Requested-With", "Accept", "Authorization", "X-CSRF-TOKEN", "X-Socket-Id"]
},
transports: ['polling']
}).listen(http);

const PORT = 3001;


const io_options = {
  path:'/jamsocket'
}
// const io = require('socket.io')(http,io_options);
// const io = require('socket.io')(http);

// io.set('transports', ['xhr-polling','polling','websocket']);
io.set('transports', ["websocket"]);

let socketList = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
  next(); 
})

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));

//   app.get('/*', function (req, res) {
//     res.sendFile(path.join(__dirname, '../client/build/index.html'));
//   });
// }

// Route
app.get('/ping', (req, res) => {
  // console.log("PING", req)
  res.send({success: true}).status(200);
});

// Socket
io.on('connection', (socket) => {
  console.log(`New User connected: ${socket.id}`);

  // socket.conn.on("upgrade", () => {
  //   const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
  //   console.log("########### : ",upgradedTransport)

  // });

  socket.on('disconnect', () => {
    socket.disconnect();
    console.log('User disconnected :',socket.id);
    // roomId = socketList[socket.id].roomId;
    // userName = socketList[socket.id].userName;
    delete socketList[socket.id];
    // socket.broadcast.to(roomId).emit('FE-user-leave', { userId: socket.id, userName: [socket.id] });
    // io.sockets.in(roomId).emit('USER-LEFT', { err: true });
  });

  socket.on('BE-check-user', ({ roomId, userName }) => {
    console.log("*****************")

    let error = false;
    let error_msg = 'green_flag'
    io.sockets.in(roomId).clients((err, clients) => {
      console.log("clients", clients)
      clients.forEach((client) => {
        if (socketList[client].userName === userName) {
          error = true;
          error_msg = 'Username already exists :('
        }
      });
      console.log("#######:",error,error_msg)
      socket.emit('FE-error-user-exist', { error,error_msg });
    });
  });

  /**
   * Join Room
   */
  socket.on('BE-join-room', ({ roomId, userName }) => {
    // Socket Join RoomName
    socket.join(roomId);
    socketList[socket.id] = { userName, video: true, audio: true,roomId };
    
    // Set User List
    io.sockets.in(roomId).clients((err, clients) => {
      try {
        const users = [];
        clients.forEach((client) => {
          // Add User List
          // if(clients.includes(client.info.userName)) users.push({ userId: client, info: socketList[client] });
          users.push({ userId: client, info: socketList[client] });
        });
        socket.broadcast.to(roomId).emit('FE-user-join', users);
        // io.sockets.in(roomId).emit('FE-user-join', users);
        // console.log("users", users)
      } catch (e) {
        io.sockets.in(roomId).emit('FE-error-user-exist', { err: true });
      }
    });
  });

  socket.on('BE-call-user', ({ userToCall, from, signal }) => {
    io.to(userToCall).emit('FE-receive-call', {
      signal,
      from,
      info: socketList[socket.id],
    });
  });

  socket.on('BE-accept-call', ({ signal, to }) => {
    io.to(to).emit('FE-call-accepted', {
      signal,
      answerId: socket.id,
    });
  });

  socket.on('BE-send-message', ({ roomId, msg, sender }) => {
    io.sockets.in(roomId).emit('FE-receive-message', { msg, sender });
  });

  socket.on('BE-leave-room', ({ roomId, leaver }) => {
    io.sockets.sockets[socket.id].leave(roomId);
    console.log("BE-leave-room, Room : ",roomId,"Leaver : ",leaver)
    delete socketList[socket.id];
    console.log("Removing socket id :", socket.id)
    console.log(socketList)
    socket.broadcast.to(roomId).emit('FE-user-leave', { userId: socket.id, userName: [socket.id] });
    
  });

  socket.on('BE-toggle-camera-audio', ({ roomId, switchTarget }) => {
    if (switchTarget === 'video') {
      console.log("vvvvvvvvvvvvvvvvvvvv",!socketList[socket.id].video);
      socketList[socket.id].video = !socketList[socket.id].video;
    } else {
      socketList[socket.id].audio = !socketList[socket.id].audio;
    }
    socket.broadcast
      .to(roomId)
      .emit('FE-toggle-camera', { userId: socket.id, switchTarget });
  });


  socket.on('BE-metronome', ({roomId, metroData}) => {

    console.log("SERver metronome", metroData, "roomID", roomId, "socket.id", socket.id)

    socket.broadcast
    .to(roomId)
    .emit('FE-metronome', {userID:socket.id, metroData})
  });


});


http.listen(PORT, () => {
  console.log('Connected : ', PORT);
});

