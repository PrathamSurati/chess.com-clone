const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard")

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row,rowindex) => {
        row.forEach((square, squaeindex)=>{
            // console.log(square);
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", 
                (rowindex + squaeindex) % 2 === 1 ? "black" : "white"
            );
            squareElement.dataset.row = rowindex;
            squareElement.dataset.square = squaeindex;

            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece",
                    square.color === "w" ? "white" : "black",
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = {row : rowindex, col : squaeindex};
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend",()=>{
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e)=>{
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e)=>{
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row : parseInt(squareElement.dataset.row),
                        col : parseInt(squareElement.dataset.square) 
                    };
                    handlemove(sourceSquare, targetSource);
                }

            });
            boardElement.appendChild(squareElement);
        });
    });
};




const handlemove = (source, target) => {
    const move = {
        from : `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to : `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion : "q"
    }
    socket.emit("move", move);
};

const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        'K': '♔',  // White King
        'k': '♚',  // Black King
        'Q': '♕',  // White Queen
        'q': '♛',  // Black Queen
        'R': '♖',  // White Rook
        'r': '♜',  // Black Rook
        'B': '♗',  // White Bishop
        'b': '♝',  // Black Bishop
        'N': '♘',  // White Knight
        'n': '♞',  // Black Knight
        'P': '♙',  // White Pawn
        'p': '♟'   // Black Pawn
    };
    return unicodePieces[piece.type] || "";
};


socket.on("playerRole", (role)=>{
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", ()=>{
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen)=>{
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move)=>{
    chess.move(move);
    renderBoard();
});

renderBoard();