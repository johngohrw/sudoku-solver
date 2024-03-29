<script>
	import { onMount } from 'svelte';
	import { SudokuBoard } from '../lib/sudoku';

	// false = keyboard-mode, true = mouse-mode
	let inputMode = false;
	$: if (inputMode) {
		// in mousemode, clear activeCell
		activeCell = [-1, -1];
	}

	// shows debug panel if true
	let debugMode = false;

	// marking mode
	let markMode = false;

	// highlight active number(in mouse/keyboard mode)
	// and active cell's number(only in keyboard mode)
	let highlight = true;
	let highlightedNumber = -1;
	$: activeValue = inputMode
		? activeNumber
		: game?.board[activeCell[0] * 9 + activeCell[1]]?.value || activeNumber;
	$: highlightedNumber = highlight ? activeValue : -1;

	let newDifficulty = 6.5;
	// difficulty constraints: type=number, 0 <= x <= 10
	$: if (typeof newDifficulty !== 'number' || newDifficulty < 0) {
		newDifficulty = 0;
	}
	$: if (newDifficulty > 10) {
		newDifficulty = 10;
	}

	let currentDifficulty = newDifficulty;
	let game;
	let complete = false;

	// keeps track of previous board states, allowing user to undo
	let previousBoards = [];
	// push in the first board state
	$: if (game?.board && previousBoards?.length <= 0) {
		saveBoardState();
	}

	// snapshot function.
	// please make sure to invoke this before every board state change
	const saveBoardState = () => {
		previousBoards = [...previousBoards, JSON.stringify(game.board)];
	};

	// undo function
	const restorePreviousBoard = () => {
		if (previousBoards.length > 0) {
			game.board = [...JSON.parse(previousBoards[previousBoards.length - 1])];
			previousBoards = previousBoards.slice(0, -1);
		}
	};

	// cosmetic purposes
	let isUndoPressed = false;

	// keeps track of the remaining count for each number
	$: numberCount = game?.board?.reduce(
		(acc, currentCell) => {
			if (currentCell.value > 0) {
				acc[currentCell.value - 1] -= 1;
			}
			return acc;
		},
		[9, 9, 9, 9, 9, 9, 9, 9, 9]
	) || [0, 0, 0, 0, 0, 0, 0, 0, 0];

	//  initialize active cell/number ('inactive' values for both)
	let activeCell = [-1, -1];
	let activeNumber = -1;

	// start newgame on page load
	onMount(() => {
		newGame();
	});

	// when there's a valid activeNumber and activeCell combination..
	$: if (activeNumber > 0 && activeCell[0] >= 0 && activeCell[1] >= 0) {
		saveBoardState(); // save previous board state to history before changing it

		const cellValue = game.board[activeCell[0] * 9 + activeCell[1]].value;

		// keyboard mode
		if (!inputMode) {
			// update the (already-active) cell to the (newly-pressed) number
			if (activeCell[0] > -1 && activeCell[1] > -1) {
				game.board[activeCell[0] * 9 + activeCell[1]].value = activeNumber;
				activeNumber = -1; // reset the activeNumber
				activeCell = [-1, -1]; // reset the active cell
			}
		}
		// mouse mode
		else {
			// if the cell already has the same number, delete it
			if (activeNumber === cellValue) {
				game.board[activeCell[0] * 9 + activeCell[1]].value = 0;
				activeCell = [-1, -1]; // reset the active cell
			}
			// update the (newly-pressed) cell to the (already-active) number
			else if (activeNumber > 0) {
				game.board[activeCell[0] * 9 + activeCell[1]].value = activeNumber;
				activeCell = [-1, -1]; // reset the active cell
			}
		}

		checkCompletion();
	}

	function cellClick(i, j) {
		// if the clicked cell is already the active cell, deactivate it
		if (activeCell[0] === i && activeCell[1] === j) {
			activeCell = [-1, -1];
		} else {
			activeCell = [i, j];
		}
	}

	function keydown(event) {
		if (event.metaKey) return;
		if ('123456789'.includes(event.key)) {
			if (activeNumber === parseInt(event.key)) {
				activeNumber = -1;
			} else {
				activeNumber = parseInt(event.key);
			}
		} else if (event.key === 'Escape') {
			if (!inputMode) {
				// keyboard mode
				game.board[activeCell[0] * 9 + activeCell[1]].value = 0;
			} else {
				//mouse mode
				activeNumber = -1;
			}
		} else if ('dD'.includes(event.key)) {
			debugMode = !debugMode;
		} else if ('iI'.includes(event.key)) {
			inputMode = !inputMode;
		} else if ('hH'.includes(event.key)) {
			highlight = !highlight;
		} else if ('zZ'.includes(event.key)) {
			isUndoPressed = true;
			restorePreviousBoard();
		} else if (' Mm'.includes(event.key)) {
			markMode = !markMode;
		}
	}

	function keyup(event) {
		if (event.metaKey) return;
		if ('zZ'.includes(event.key)) {
			isUndoPressed = false;
		}
	}

	// works only for mouse mode
	function numberButtonClick(number) {
		if (activeNumber > 0 && activeNumber === number) {
			activeNumber = -1;
		} else {
			activeNumber = number;
		}
	}

	function newGame() {
		currentDifficulty = newDifficulty;
		game = new SudokuBoard(currentDifficulty);
		complete = false;
	}

	function checkCompletion() {
		const gamecheck = game.board.reduce(
			(acc, curr) => {
				acc.string += curr.value;
				acc.sum += curr.value;
				return acc;
			},
			{ string: '', sum: 0 }
		);
		// console.log('game checksum is ', gamecheck.sum);
		if (!gamecheck.string.includes('0') & (gamecheck.sum === 405)) {
			// console.log('initial checksums passed! going through more thorough checking..');
			const rows = game.board.reduce(
				(acc, curr) => {
					acc[curr.y].push(curr.value);
					return acc;
				},
				[[], [], [], [], [], [], [], [], []]
			);
			const cols = game.board.reduce(
				(acc, curr) => {
					acc[curr.x].push(curr.value);
					return acc;
				},
				[[], [], [], [], [], [], [], [], []]
			);
			const sections = game.board.reduce(
				(acc, curr) => {
					const section = Math.floor(curr.y / 3) * 3 + Math.floor(curr.x / 3);
					acc[section].push(curr.value);
					return acc;
				},
				[[], [], [], [], [], [], [], [], []]
			);

			let completeCheck = true;
			const allArrays = [...rows, ...cols, ...sections];
			allArrays.forEach((arr) => {
				if (!validateSudokuNums(arr)) {
					completeCheck = false;
				}
			});
			// console.log(complete ? 'complete' : 'not complete');
			completeCheck = true;

			if (completeCheck) {
				complete = true;
			}
		}
	}

	// for a number array of length 9, check for occurrence of
	//  1-9 without any duplicates
	const validateSudokuNums = (numArr) => {
		const count = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		numArr.forEach((num) => {
			count[num - 1] += 1;
			if (count[num - 1] === 2) {
				return false;
			}
		});
		if (count.includes(0)) {
			return false;
		}
		return true;
	};
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} />

<div class="container">
	{#if debugMode}
		<div class="debugPanel">
			<h2><strong>Debug Panel</strong></h2>
			<div>Active cell: {activeCell}</div>
			<div>Active number: {activeNumber}</div>
			<div>
				New Difficulty:
				<input type="number" max="10" min="0" bind:value={newDifficulty} />
				<button on:click={newGame}>New game</button>
			</div>
			<div>
				Current Difficulty:
				{currentDifficulty}
			</div>
			<div>
				Input mode:
				<input type="checkbox" bind:checked={inputMode} />
				{inputMode ? 'Mouse mode' : 'Keyboard mode'}
			</div>
			<div>
				Active Value (for highlight):
				{activeValue}
			</div>
			<button on:click={checkCompletion}>manually check completion</button>
			<div>complete: {complete ? 'yes' : 'no'}</div>
			<div>mark mode: <input type="checkbox" bind:checked={markMode} /></div>
		</div>
	{/if}

	{#key game?.board}
		<div class="board">
			{#each Array(9) as _, i}
				<div class="row">
					{#each Array(9) as _, j}
						<button
							on:click={() => {
								if (!complete) {
									cellClick(i, j);
								}
							}}
							class="cell
							{complete && 'cell-complete'}
							{j !== 8 && j % 3 === 2 ? 'cell-br' : ''}
							{i !== 8 && i % 3 === 2 ? 'cell-bb' : ''}
							{activeCell[0] === i && activeCell[1] === j ? 'cell-active' : ''}
						"
						>
							<div
								class="highlight {game?.board[i * 9 + j]?.value === highlightedNumber &&
									'highlighted'}"
							/>
							<span class="value">
								{game?.board[i * 9 + j]?.value || ''}
							</span>
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/key}

	<div class="infoPanel">
		<div class="numbers">
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num, i}
				<div class="numberWrapper">
					<button
						on:click={() => numberButtonClick(num)}
						class="numberButton {activeNumber === num && 'active'}">{num}</button
					>
					<div
						class="remainCount 
							{numberCount[i] === 0 && 'solved'}
							{numberCount[i] < 0 && 'sumtingwong'}
						"
					>
						{numberCount[i]}
					</div>
				</div>
			{/each}
		</div>
		<div class="tools">
			<button
				on:click={() => {
					if (!complete) {
						restorePreviousBoard();
					}
				}}
				on:mousedown={() => {
					isUndoPressed = true;
				}}
				on:mouseup={() => {
					isUndoPressed = false;
				}}
				class="buttonField"
			>
				<div class="keyButton {isUndoPressed && 'active'}">Z</div>
				<div class="fieldName">Undo</div>
			</button>
			<!-- <button
				on:click={() => {
					markMode = !markMode;
				}}
				class="buttonField"
			>
				<div class="keyButton {markMode && 'active'}">M</div>
				<div class="fieldName">Pencil-marking</div>
			</button> -->
		</div>
		<div class="stats">
			<div class="field">
				<div class="fieldName">Difficulty</div>
				<div class="fieldValue">{currentDifficulty}</div>
			</div>

			<button
				class="toggleField"
				on:click={() => {
					highlight = !highlight;
				}}
			>
				<div class="keyButton {highlight && 'active'}">H</div>
				<div class="innerFlex">
					<div class="fieldName">Highlight</div>
					<div class="fieldValue">{highlight ? 'On' : 'Off'}</div>
				</div>
			</button>

			<button
				class="toggleField"
				on:click={() => {
					inputMode = !inputMode;
				}}
			>
				<div class="keyButton {inputMode && 'active'}">I</div>
				<div class="innerFlex">
					<div class="fieldName">Input mode</div>
					<div class="fieldValue">{inputMode ? 'Bulk-entry' : 'Normal'}</div>
				</div>
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.container {
		width: 100%;
		max-width: 460px;

		* {
			box-sizing: border-box;
		}
	}

	.debugPanel {
		margin-bottom: 1rem;
	}

	.board {
		border: 2px solid black;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-bottom: 1rem;
	}

	.row {
		width: 100%;
		height: 100%;
		display: flex;
	}

	.cell {
		width: 100%;
		border: 1px solid rgb(189, 189, 189);
		position: relative;
		aspect-ratio: 1;
	}

	.cell-active {
		background-color: rgba(49, 49, 187, 0.432);
	}

	.cell-complete {
		background-color: #c1ffb4;
	}

	.cell-br {
		border-right: 2px solid black;
	}

	.cell-bb {
		border-bottom: 2px solid black;
	}

	.value {
		position: absolute;
		top: calc(50% + 1px);
		left: calc(50% + 1px);
		transform: translate(-50%, -50%);
		font-size: 1.2rem;
	}

	.highlight {
		position: absolute;
		background: #9bd5d2;
		border-radius: 50%;
		width: 80%;
		height: 80%;

		display: flex;
		align-items: center;
		justify-content: center;

		transition-duration: 120ms;
		opacity: 0;
		transform: translateY(-50%) scale(0);

		&.highlighted {
			opacity: 1;
			transform: translateY(-50%) scale(1);
		}
	}

	.infoPanel {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-bottom: 2rem;

		.numbers {
			display: flex;
			justify-content: space-around;
			flex-wrap: wrap;
			margin-bottom: 0.5rem;

			.numberWrapper {
				display: flex;
				flex-direction: column;
				align-items: center;

				margin-bottom: 0.8rem;

				&:not(:last-child) {
					margin-right: 0.2rem;
				}
			}

			.numberButton {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 0;
				width: 2.4rem;
				height: 2.4rem;
				font-size: 1rem;
				background-color: #dedede;
				color: black;
				border-radius: 50%;
				border: none;
				user-select: none;
				cursor: pointer;

				&.active {
					background-color: #0e9f99;
					color: white;
				}
			}

			.remainCount {
				font-size: 0.7rem;
				margin-top: 0.15rem;

				&.solved {
					color: green;
				}

				&.sumtingwong {
					color: red;
				}
			}
		}

		.tools {
			display: flex;
			margin-bottom: 0.5rem;
		}

		.stats {
			display: flex;
			margin-bottom: 5rem;
		}
	}

	.field {
		margin: 0 1rem 0.5rem 0;
		padding: 0.5rem 0.75rem;

		.fieldName {
			font-size: 0.7rem;
			margin-bottom: 0.1rem;
		}
		.fieldValue {
			font-size: 1.2rem;
			font-weight: 600;
		}
	}

	.toggleField,
	.buttonField {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0 1rem 0.5rem 0;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		text-align: unset;
		border: none;
		cursor: pointer;

		background-color: rgba(0, 0, 0, 0);

		&:hover {
			background-color: #e7e7e7;
		}

		&:active {
			background-color: #d0d0d0;
		}

		.innerFlex {
			display: flex;
			flex-direction: column;
		}

		.keyButton {
			display: flex;
			align-items: center;
			justify-content: center;

			background-color: #d5d5d5;
			border-bottom: 3px solid #a8a8a8;
			border-right: 3px solid #a8a8a8;
			border-radius: 8px;
			min-width: 2.1rem;
			height: 2.1rem;
			padding: 0 0.5rem;
			margin-right: 0.5rem;

			&.active {
				background-color: #d5d5d5;
				border-bottom: 1px solid #bbb;
				border-right: 1px solid #bbb;
				border-top: 2px solid #999;
				border-left: 2px solid #999;
			}
		}

		.fieldValue {
			font-size: 1.2rem;
			font-weight: 600;
		}
	}

	.toggleField {
		.fieldName {
			font-size: 0.7rem;
			margin-bottom: 0.1rem;
		}
	}

	.buttonField {
		.fieldName {
			font-size: 1rem;
		}
	}
</style>
