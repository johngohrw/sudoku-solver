// rng. if max = 4, values will be either 0, 1, 2, or 3
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function coordToSection(x, y) {
	return Math.floor(y / 3) * 3 + Math.floor(x / 3);
}

// fast random shuffle for arrays
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

export class SudokuBoard {
	constructor(difficulty = 5) {
		this.originalBoard;
		this.board;
		this.solution;
		this.difficulty = difficulty;
		this.newGame(this.difficulty);
	}

	newGame(difficulty = 5) {
		let [board, solution] = this.generateBoard(difficulty);
		this.originalBoard = JSON.parse(JSON.stringify(board)); // this method of deepcopy is probably not sustainable
		this.board = JSON.parse(JSON.stringify(board)); // this method of deepcopy is probably not sustainable
		this.solution = solution;
	}

	generateBoard(difficulty = 5) {
		if (difficulty < 0 || difficulty > 10) {
			throw Error(`Invalid difficulty setting (${difficulty}), keep it within 0-10`);
		}
		let board = this.generateFullBoard();
		const solution = board.map((o) => ({
			id: o.id,
			x: o.x,
			y: o.y,
			value: o.value
		}));
		// difficulty setting by removing cells randomly
		let emptySpaces = Math.floor(81 * ((difficulty * 10) / 100));
		board = fisherYatesShuffle(board);
		for (let i = 0; i < emptySpaces; i++) {
			board[i].value = 0;
		}
		board = board.sort((a, b) => a.id - b.id);
		return [board, solution];
	}

	generateFullBoard() {
		let n = 0;
		let board;
		// keep trying to generate a full board. n won't hit 80 if it's not a full board.
		while (n < 80) {
			board = this.newEmptyBoard();
			n = 0;
			while (n < 81) {
				// filter out nonpossible cells, pre-randomize, then sort based on possible length
				let filtered = board.filter((o) => o.possible.length !== 0);
				let randomized = fisherYatesShuffle(filtered);
				let sorted = randomized.sort((a, b) => a.possible.length - b.possible.length);
				// get cell with least possibilities (sorted first)
				let cell = sorted[0];

				// if an impossible situation is met, start over from an empty board.
				if (!cell) {
					break;
				}

				// get current cell's x, y, and section
				const [x, y, section] = [cell.x, cell.y, coordToSection(cell.x, cell.y)];

				// get num randomly from a list of possibilities
				let num = cell.possible[getRandomInt(cell.possible.length)];

				let index = board.findIndex((o) => o.id === cell.id);
				board[index].value = num; // this cell now has a value
				board[index].possible = []; // this cell is now non-possible

				// find all cells with the same x, y, or section
				let similarCells = board.filter(
					(cell) => cell.x === x || cell.y === y || cell.section === section
				);

				// for each affected cell, filter out `num` from its possible array
				similarCells.forEach((cell) => {
					cell.possible = cell.possible.filter((_num) => _num !== num);
				});
				n++;
			}
		}
		return board;
	}

	newEmptyBoard() {
		let board = [];
		let i = 0;
		while (i < 81) {
			board.push({
				id: i,
				x: i % 9,
				y: Math.floor(i / 9),
				section: coordToSection(i % 9, Math.floor(i / 9)),
				possible: [1, 2, 3, 4, 5, 6, 7, 8, 9],
				value: 0
			});
			i++;
		}
		return board;
	}

	getBoardString(board) {
		let string = `    0 1 2   3 4 5   6 7 8\n`;
		string += '  -------------------------\n';
		board.forEach((cell) => {
			if (cell.id % 9 === 0) {
				string += `${Math.floor(cell.id / 9)} | `;
			}
			string += `${cell.value === 0 ? ' ' : cell.value} `;
			if (cell.id % 3 === 2) {
				string += `| `;
			}
			if (cell.id % 9 === 8) {
				string += `\n`;
				if (Math.floor(cell.id / 9) % 3 === 2) {
					string += '  -------------------------\n';
				}
			}
		});
		return string;
	}

	printBoard() {
		console.log(this.getBoardString(this.board));
	}
}
