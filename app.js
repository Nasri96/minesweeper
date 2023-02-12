// class Game
class Game {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.field = [];
        this.mines = 0;
        this.flags = 0;
        this.checkedNearbyMines = false;
        this.minesPlanted = false;
        this.gameOver = false;
        this.difficultyMenu = {
            easy: {
                mines: 10,
                fieldWidth: "400px",
                fieldHeight: "400px",
                rows: 10,
                columns: 10
            },
            medium: {
                mines: 20,
                fieldWidth: "640px",
                fieldHeight: "480px",
                rows: 12,
                columns: 12
            },
            hard: {
                mines: 30,
                fieldWidth: "800px",
                fieldHeight: "600px",
                rows: 16,
                columns: 16
            }
        },
        this.timer = {
            running: false,
            interval: undefined,
            seconds: 0,
            secondsStart: function() {
                this.interval = setInterval(() => {
                    this.seconds++;
                    UI.showTimer();
                }, 1000)
                this.running = true;
            },
            clear: function() {
                clearInterval(this.interval);
                this.seconds = 0;
                this.running = false;
                this.interval = undefined;
                UI.clearTimer();
            },
            minutes: function() {
                return Math.floor(this.seconds / 60);
            }
        }
    }
    
    getTime() {
        console.log(this.timer.seconds, this.timer.minutes());
    }

    resetGame() {
        this.field = [];
        this.mines = 0;
        this.flags = 0;
        this.checkedNearbyMines = false;
        this.minesPlanted = false;
        this.gameOver = false;
        this.timer.clear();
    }

    createField() {
        UI.removeField();
            // field creation
            for(let i = 0; i < this.difficultyMenu[this.difficulty].rows; i++) {
                this.field[i] = [];
                for(let j = 0; j < this.difficultyMenu[this.difficulty].columns; j++) {
                    const newSquareEl = document.createElement("div");
                    newSquareEl.classList = `square`;
                    newSquareEl.game = {
                        row: i,
                        column: j,
                        mine: false,
                        flagged: false,
                        revealed: false,
                        nearbyMines: 0
                    }
                    this.field[i][j] =  newSquareEl;
                    UI.displayField(this.difficultyMenu[this.difficulty].fieldWidth, this.difficultyMenu[this.difficulty].fieldHeight, newSquareEl);
                }
            }
    }

    // Apply dynamic styles to all squares inside field
    applyDynamicStylesToField() {
        const formContainer = document.querySelector("form");
        const gameContainer = document.querySelector("#game");

        gameContainer.style.width = formContainer.clientWidth + "px";
        gameContainer.style.height = formContainer.clientWidth + "px";
            
        for(let i = 0; i < this.field.length; i++) {
            for(let j = 0; j < this.field[i].length; j++) {
                // Width and Height of squares scales with number of rows/columns 
                this.field[i][j].style.width = `${gameContainer.clientWidth / this.difficultyMenu[this.difficulty].columns}px`;
                this.field[i][j].style.height = `${gameContainer.clientHeight / this.difficultyMenu[this.difficulty].rows}px`;
            }
        }
    }

    getRandomFieldRowColumn() {
        const row = Math.floor(Math.random() * this.field.length);
        const column = Math.floor(Math.random() * this.field[row].length);

        return { row, column }
    }

    createMines(clickedSquare) {
        let { row, column } = this.getRandomFieldRowColumn();
        while(!this.minesPlanted && this.mines < this.difficultyMenu[this.difficulty].mines) {
            while(this.field[row][column].game.mine || (clickedSquare.game.row === row && clickedSquare.game.column === column) || clickedSquare.game.nearbyMines > 0) {
                ({ row, column } = this.getRandomFieldRowColumn());
            }
            this.field[row][column].game.mine = true;
            this.mines++;

            ({ row, column } = this.getRandomFieldRowColumn());
        }
        this.minesPlanted = true;
    }

    addMinesCountToSquares() {
        if(!this.checkedNearbyMines) {
            // loop through all squares and add nearbymines for current iteration of square
            for(let i = 0; i < this.field.length; i++) {
                for(let j = 0; j < this.field[0].length; j++) {
                    this.getNearbySquares(this.field[i][j]).forEach(square => {
                        if(square.game.mine) {
                            this.field[i][j].game.nearbyMines++;
                        }
                    })
                }
            }
            this.checkedNearbyMines = true;
        }
    }

    revealSquare(clickedSquare) {
        if(!newGame.timer.running) {
            newGame.timer.secondsStart();
        }
        if(clickedSquare.game.mine) {
            newGame.gameOver = true;
            alert("YOU LOST!");
            newGame.timer.clear();
        } else if(clickedSquare.game.nearbyMines > 0) {
            clickedSquare.game.revealed = true;
            clickedSquare.style.backgroundImage = `url('./assets/MINESWEEPER_${clickedSquare.game.nearbyMines}.png')`;
        } else if(clickedSquare.game.revealed === false) {
            clickedSquare.game.revealed = true;
            clickedSquare.style.backgroundImage = "url('./assets/MINESWEEPER_0.png')";
            // reveal field of adjacent empty squares
            const squares = this.getNearbySquares(clickedSquare);
            this.revealField(squares);
        }
    }

    revealField(nearbySquares) {
        let emptySquares = [];
        nearbySquares.forEach(square => {
            if(square.game.nearbyMines === 0 && square.game.revealed === false) {
                square.game.revealed = true;
                square.style.backgroundImage = "url('./assets/MINESWEEPER_0.png')";
                emptySquares.push(square);
            } else if(square.game.nearbyMines > 0 && square.game.revealed === false) {
                square.game.revealed = true;
                square.style.backgroundImage = `url('./assets/MINESWEEPER_${square.game.nearbyMines}.png')`;
            }
            // fix flag bug after revealing already flagged square
            if(square.game.flagged) {
                square.game.flagged = false;
                this.flags--;
            }
        })
        if(emptySquares.length) {
            emptySquares.forEach(square => {
                const squares = this.getNearbySquares(square);
                this.revealField(squares);
            })
        }
    }

    getNearbySquares(square) {
        const nearbySquares = [];
        if(this.field[square.game.row][square.game.column + 1]) {
            nearbySquares.push(this.field[square.game.row][square.game.column + 1]);
        }
        if(this.field[square.game.row][square.game.column - 1]) {
            nearbySquares.push(this.field[square.game.row][square.game.column - 1]);
        }
        if(this.field[square.game.row - 1] && this.field[square.game.row - 1][square.game.column - 1]) {
            nearbySquares.push(this.field[square.game.row - 1][square.game.column - 1]);
        }
        if(this.field[square.game.row - 1] && this.field[square.game.row - 1][square.game.column]) {
            nearbySquares.push(this.field[square.game.row - 1][square.game.column]);
        }
        if(this.field[square.game.row - 1] && this.field[square.game.row - 1][square.game.column + 1]) {
            nearbySquares.push(this.field[square.game.row - 1][square.game.column + 1]);
        }
        if(this.field[square.game.row + 1] && this.field[square.game.row + 1][square.game.column - 1]) {
            nearbySquares.push(this.field[square.game.row + 1][square.game.column - 1]);
        }
        if(this.field[square.game.row + 1] && this.field[square.game.row + 1][square.game.column]) {
            nearbySquares.push(this.field[square.game.row + 1][square.game.column]);
        }
        if(this.field[square.game.row + 1] && this.field[square.game.row + 1][square.game.column + 1]) {
            nearbySquares.push(this.field[square.game.row + 1][square.game.column + 1]);
        }
        return nearbySquares;
    }

    endGame() {
        if(this.gameOver) {
            for(let i = 0; i < this.field.length; i++) {
                for(let j = 0; j < this.field[0].length; j++) {
                        if(this.field[i][j].game.mine) {
                            this.field[i][j].style.backgroundImage = "url('./assets/MINESWEEPER_M.png')";
                        }
                    }
            }
        }
    }

    flagSquare(clickedSquare) {
        if(clickedSquare.game.revealed === false && clickedSquare.game.flagged === false) {
            this.flags++;
            clickedSquare.game.flagged = true;
            clickedSquare.style.backgroundImage = "url('./assets/MINESWEEPER_F.png')";
            this.checkForWin(clickedSquare);
        } else if(clickedSquare.game.revealed === false && clickedSquare.game.flagged) {
            this.flags--;
            clickedSquare.game.flagged = false;
            clickedSquare.style.backgroundImage = "url('./assets/MINESWEEPER_X.png')";
            if(clickedSquare.game.mine) {
                this.mines++;
            }
        }
    }

    checkForWin(clickedSquare) {
        if(this.mines > 0) {
            if(clickedSquare.game.mine) {
                this.mines--;
            }
        }
        console.log(this.mines, this.flags);
        if(this.mines === 0 && this.flags === 10) {
            this.field.forEach(row => {
                row.forEach(column => {
                    if(column.game.mine) {
                        column.style.backgroundImage = "url('./assets/MINESWEEPER_M.png')";
                    }
                })
            })
            this.gameOver = true;
            alert(`YOU WON! Your time: ${this.timer.seconds}seconds`);
            this.timer.clear();
        }
    }

}

// class UI
class UI {
    static displayField(fieldWidth, fieldHeight, square) {
        const gameOutput = document.querySelector("#game");
        // gameOutput.style.width = fieldWidth;
        // gameOutput.style.height = fieldHeight;
        gameOutput.append(square);
    }

    static removeField() {
        const gameOutput = document.querySelector("#game");
        gameOutput.innerHTML = "";
    }

    static showTimer() {
        const secondsOutput = document.querySelector("#clock-seconds");
        const minutesOutput = document.querySelector("#clock-minutes");
        let seconds = newGame.timer.seconds;
        let minutes = newGame.timer.minutes();
        if(seconds > 60) {
            seconds =  seconds - (minutes * 60);
        }
        if(seconds < 10) {
            seconds = `0${seconds}`;
        }
        secondsOutput.textContent = seconds;
        minutesOutput.textContent = minutes;
    }

    static clearTimer() {
        const secondsOutput = document.querySelector("#clock-seconds");
        const minutesOutput = document.querySelector("#clock-minutes");
        secondsOutput.textContent = "00";
        minutesOutput.textContent = "0";
    }
}

const newGame = new Game();

// EVENTS
document.querySelector("#form-difficulty").addEventListener("submit", function(e) {
    e.preventDefault();
    newGame.resetGame();
    const difficultyString = document.querySelector("#input-difficulty").value;
    newGame.difficulty = difficultyString;
    newGame.createField(newGame.difficulty);
    newGame.applyDynamicStylesToField();

    // add events for created squares
    for(let i = 0; i < newGame.field.length; i++) {
        for(let j = 0; j < newGame.field[i].length; j++) {
            newGame.field[i][j].addEventListener("click", function() {
                if(!newGame.gameOver) {
                    if(!this.game.flagged) {
                        newGame.createMines(this);
                        newGame.addMinesCountToSquares();
                        newGame.revealSquare(this);
                        newGame.endGame();
                    }
                }
            })
            newGame.field[i][j].addEventListener("contextmenu", function(e) {
                e.preventDefault();
                if(!newGame.gameOver) {
                    if(newGame.minesPlanted) {
                        newGame.flagSquare(this);
                    }
                }
            })  
        }
    }
})

window.addEventListener("resize", function(e) {
    newGame.applyDynamicStylesToField();
});
