function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function coordToSection(x, y) {
  return Math.floor(y / 3) * 3 + Math.floor(x / 3);
}

function fisherYatesShuffle(array) {
  let m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

class SudokuBoard {
  constructor(debug = false, difficulty = 5) {
    this.debug = debug;
    this.validRows = this.newValidObj();
    this.validCols = this.newValidObj();
    this.validSections = this.newValidObj();
    this.board = this.newBoardWithZeroes();
    // this.newBoard(difficulty);
  }

  newBoardWithZeroes() {
    let board = [];
    for (let i = 0; i < 9; i++) {
      let row = [];
      for (let j = 0; j < 9; j++) {
        row.push(0);
      }
      board.push(row);
    }
    return board;
  }

  // difficulty is a 0-10 rating
  newBoard(difficulty = 0) {
    if (difficulty < 0 || difficulty > 10) {
      throw Error(
        `Invalid difficulty setting (${difficulty}), keep it within 0-10`
      );
    }
    let emptySpaces = Math.floor(81 * ((difficulty * 10) / 100));
    let numQueue = this.newNumberQueue();
    let insertCount = 81 - emptySpaces;
    if (this.debug) {
      console.log(
        `Creating a new board with a difficulty of ${difficulty}/10 (${insertCount} filled cells)..`
      );
    }
    let counter = 0;
    while (counter < insertCount) {
      console.log(numQueue[counter]);
      this.insertNumber(numQueue[counter]);
      counter++;
    }
  }

  newValidObj() {
    function getNewValids() {
      let valids = [];
      for (let i = 0; i < 9; i++) {
        valids.push(i);
      }
      return valids;
    }
    let obj = {};
    for (let i = 1; i < 10; i++) {
      obj[i] = getNewValids();
    }
    return obj;
  }

  newNumberQueue() {
    let queue = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        queue.push(i + 1);
      }
    }
    // return fisherYatesShuffle(queue);
    return queue;
  }

  getValidCoords(n) {
    let validRows = this.validRows[n];
    let validCols = this.validCols[n];
    let validSections = this.validSections[n];
    let validCoordList = [];
    validRows.forEach((row) => {
      validCols.forEach((col) => {
        let x = col;
        let y = row;
        if (this.board[y][x] === 0) {
          validCoordList.push([x, y]);
        }
      });
    });
    validCoordList = validCoordList.filter(([x, y]) => {
      return validSections.indexOf(coordToSection(x, y)) >= 0;
    });
    return validCoordList;
  }

  insertNumber(n) {
    let validCoords = this.getValidCoords(n);
    if (validCoords.length <= 0) {
      throw Error(
        `no valid coordinates for number ${n} for board: \n${this.getBoardString()}`
      );
    }
    let [x, y] = validCoords[getRandomInt(validCoords.length)];
    if (this.debug) {
      console.log(`inserting ${n} at coords ${x}, ${y}`);
    }
    this.board[y][x] = n;
    this.validRows[n] = this.validRows[n].filter((o) => o !== y);
    this.validCols[n] = this.validCols[n].filter((o) => o !== x);
    let section = coordToSection(x, y);
    this.validSections[n] = this.validSections[n].filter((o) => o !== section);
  }

  getBoardString() {
    let string = `     0 1 2   3 4 5   6 7 8\n`;
    string += "   -------------------------\n";
    this.board.forEach((row, rowIdx) => {
      let rowString = `${rowIdx}  | `;
      row.forEach((col, colIdx) => {
        rowString += `${col === 0 ? " " : col} ${
          (colIdx + 1) % 3 === 0 ? "| " : ""
        }`;
      });
      string += `${rowString}\n`;
      if ((rowIdx + 1) % 3 === 0) {
        string += "   -------------------------\n";
      }
    });
    return string;
  }

  printBoard() {
    console.log(this.getBoardString());
  }
}

// let board = newBoard();
// let coordCounter = newCoordCounter();
// let numbers = newNumberQueue();
// let sections = newSections();

// coordCounter["x"][0] -= 1;
// coordCounter["y"][3] -= 1;
// console.log(coordToSection(6, 0));

let board = new SudokuBoard(true, 0);
let n = 1;
while (n <= 3) {
  board.insertNumber(n);
  board.insertNumber(n);
  board.insertNumber(n);
  board.insertNumber(n);
  board.insertNumber(n);
  board.insertNumber(n);
  board.insertNumber(n);
  board.insertNumber(n);
  board.insertNumber(n);
  n++;
}
board.printBoard();
