<script>
	import { onMount } from 'svelte';
	import { SudokuBoard } from '../lib/sudoku';

	// false = keyboard-mode, true = mouse-mode
	let inputMode = false;
	$: if (inputMode) {
		// in mousemode, clear activeCell
		activeCell = [-1, -1];
	}

	let debugMode = false;
	let highlight = false;

	let newDifficulty = 6.5;
	$: if (typeof newDifficulty !== 'number' || newDifficulty < 0) {
		newDifficulty = 0;
	}
	$: if (newDifficulty > 10) {
		newDifficulty = 10;
	}

	let currentDifficulty = newDifficulty;
	let game;

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

	let activeCell = [-1, -1];
	let activeNumber = -1;

	onMount(() => {
		newGame();
	});

	// when there's a valid activeNumber and activeCell combination..
	$: if (activeNumber > 0 && activeCell[0] >= 0 && activeCell[1] >= 0) {
		const cellValue = game.board[activeCell[0] * 9 + activeCell[1]].value;

		// keyboard mode
		if (!inputMode) {
			// update the (already-active) cell to the (newly-pressed) number
			if (activeCell[0] > -1 && activeCell[1] > -1) {
				game.board[activeCell[0] * 9 + activeCell[1]].value = activeNumber;
				activeNumber = -1; // reset the activeNumber
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
	}
</script>

<svelte:window on:keydown={keydown} />

<div class="container">
	{#if debugMode}
		<div class="debugPanel">
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
		</div>
	{/if}

	<div class="board">
		{#each Array(9) as _, i}
			<div class="row">
				{#each Array(9) as _, j}
					<button
						on:click={() => cellClick(i, j)}
						class="cell
							{j !== 8 && j % 3 === 2 ? 'cell-br' : ''}
							{i !== 8 && i % 3 === 2 ? 'cell-bb' : ''}
							{activeCell[0] === i && activeCell[1] === j ? 'cell-active' : ''}
						"
					>
						<span class="value">{game?.board[i * 9 + j]?.value || ''}</span>
					</button>
				{/each}
			</div>
		{/each}
	</div>

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
		<div class="stats">
			<div class="field">
				<div class="fieldName">Difficulty</div>
				<div class="fieldValue">{currentDifficulty}</div>
			</div>
			<div class="field">
				<div class="fieldName">Highlight</div>
				<div class="fieldValue">{highlight ? 'On' : 'Off'}</div>
			</div>
			<div class="field">
				<div class="fieldName">Input mode</div>
				<div class="fieldValue">{inputMode ? 'Mouse' : 'Keyboard'}</div>
			</div>
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
		margin-bottom: 2rem;
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

	.cell-br {
		border-right: 2px solid black;
	}

	.cell-bb {
		border-bottom: 2px solid black;
	}

	.value {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 1.2rem;
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
			margin-bottom: 2rem;

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
				background-color: #838383;
				color: white;
				border-radius: 50%;
				border: none;
				user-select: none;
				cursor: pointer;

				&.active {
					background-color: #0e9f99;
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

		.stats {
			display: flex;
			margin-bottom: 1rem;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		padding: 0 3rem 1.5rem 0;

		.fieldName {
			font-size: 0.7rem;
			margin-bottom: 0.1rem;
		}
		.fieldValue {
			font-size: 1.2rem;
			font-weight: 600;
		}
	}
</style>
