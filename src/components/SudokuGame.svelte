<script>
	import { onMount } from 'svelte';
	import { SudokuBoard } from '../lib/sudoku';

	// false = keyboard-mode, true = mouse-mode
	let inputMode = false;

	let difficulty = 6.5;
	$: if (typeof difficulty !== 'number' || difficulty < 0) {
		difficulty = 0;
	}
	$: if (difficulty > 10) {
		difficulty = 10;
	}

	let game;

	let activeCell = [-1, -1];
	let activeNumber = -1;

	onMount(() => {
		newGame();
	});

	// when there's a valid activeNumber and activeCell combination..
	$: if (activeNumber > 0 && activeCell[0] >= 0 && activeCell[1] >= 0) {
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
			// update the (newly-pressed) cell to the (already-active) number
			if (activeNumber > 0) {
				game.board[activeCell[0] * 9 + activeCell[1]].value = activeNumber;
				activeCell = [-1, -1]; // reset the active cell
			}
		}
	}
	function cellClick(i, j) {
		// if the clicked cell is already the active cell, deactivate it
		if (activeCell[0] === i && activeCell[1] === j) {
			activeCell = [-1, -1];
			// if the cell clicked wasn't active, activate it
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
			activeNumber = -1;
		}
	}

	function newGame() {
		game = new SudokuBoard(difficulty);
	}
</script>

<svelte:window on:keydown={keydown} />

<div class="helpers">
	<div>Active cell: {activeCell}</div>
	<div>Active number: {activeNumber}</div>
	<div>
		Difficulty:
		<input type="number" max="10" min="0" bind:value={difficulty} />
		<button on:click={newGame}>New game</button>
	</div>
	<div>
		Input mode:
		<input type="checkbox" bind:checked={inputMode} />
		{inputMode ? 'Mouse mode' : 'Keyboard mode'}
	</div>
</div>
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

<style>
	.helpers {
		margin-bottom: 1rem;
	}

	.board {
		border: 2px solid black;
		display: flex;
		flex-direction: column;
		max-width: 500px;
		width: 100%;
		aspect-ratio: 1;
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
</style>
