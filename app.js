const express = require("express");
const app = express();
const port = 4000;
var jwt = require("jsonwebtoken");
var uuid4 = require("uuid4");
const request = require("request");
var cors = require("cors");

app.use(cors());

app.use(express.json());

var rooms = {};
var roomIds = [];
var users = {
  user1: "123a",
  user2: "234b",
  user3: "345c",
  user4: "456d",
  user5: "567e",
  user6: "678f",
  user7: "789g",
  user8: "8910h",
  user9: "91011i",
  user10: "101112j",
};

var app_access_key = "632302e24208780bf6632c9b";
var app_secret =
  "JVhXlKlO04lJy4jHbNLHX6q09Re5dgWhRozydzDv0xsdOR8W7YUx3-l5rrJQO7wcurHrK6fryb_KmpxnXeghX5FykFxH3bMkyBiJA8jpH_5tZT4ceuOugmvYstyryqp6bnVD0caYk_2-xkvOwNU4yFrrL8wzSP7XzokcAmXHZ2M=";
app.post("/createRoom", (req, res) => {
  jwt.sign(
    {
      access_key: app_access_key,
      type: "management",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    app_secret,
    {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: uuid4(),
    },
    function (err, token) {
      var options = {
        method: "POST",
        url: "https://api.100ms.live/v2/rooms",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: req.body.name,
          template_id: "63242b854da877930beaeca7",
          recording_info: {
            enabled: false,
          },
          region: "in",
        }),
      };
      request(options, function (error, response) {
        if (error) {
          res.send(error);
        }
        res.send(response.body);
        let data = JSON.parse(response.body);
        const obj = {};
        obj[data.id] = data;
        obj[data.id].createdBy = req.body.user;
        rooms = { ...rooms, ...obj };
        roomIds = [...roomIds, data.id];
      });
    }
  );
});

app.get("/getRooms", (req, res) => {
  res.send({ rooms: rooms, roomIds: roomIds });
});

app.post("/joinRoomToken", (req, res) => {
  const role =
    rooms[req.body.roomId].createdBy === req.body.user ? "host" : "attendee";
  var payload = {
    access_key: app_access_key,
    room_id: req.body.roomId,
    user_id: users[req.body.user],
    role: role,
    type: "app",
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  };

  jwt.sign(
    payload,
    app_secret,
    {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: uuid4(),
    },
    function (err, token) {
      res.send({ token: token });
    }
  );
});

app.get("/", (req, res) => {
  res.send("hi");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
