const express = require("express");
const http = require("http");
const { Chess } = require( 'chess.js' );
const socket = require("socket.io");
const path = require("path");

const app = express();

const server = http.createServer(app);

const io = socket(server);


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const chess = new Chess();
const players = {};  //object
const currentPlayer = 'W';

app.get("/", (req, res) => {
  res.render("index.ejs", {title: "Chess Game"});
});

io.on("connection", function (uniquesocket){
    console.log("connected");

    // uniquesocket.on("new-game",()=>{
    //     // console.log("received new-game event");
    //     io.emit("new-game begin");
    // })


    
    
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if(!players.black){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }



    uniquesocket.on("disconnect",()=>{
        // console.log("disconnected");
        if(uniquesocket.id === players.white){
            delete players.white;
        }else if (uniquesocket.id === players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move", (move) => {
        try{
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen()); // fen is besically a string that represents the state of the board 
            }else{
                console.log("invalid move");
                uniquesocket.emit("invalidMove", move);
            }       
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("invalid move:", move);
        }
    });

});



server.listen(3000, () => {
    console.log("Server is running on port 3000");
});

// module.exports = app;
