<script>
	import SudokuGame from '../components/SudokuGame.svelte';
</script>

<svelte:head>
	<title>another sudoku clone</title>
	<meta name="description" content="another sudoku clone" />
</svelte:head>

<section>
	<h1>another sudoku clone</h1>
	<SudokuGame />

	<div style="display: block; text-align: unset">
		<h2>Input Methods</h2>
		<p>
			<strong>Normal: </strong>
			Select a number, then click on the desired entry cell.
		</p>
		<p>
			<strong>Bulk-entry: </strong>
			The selected number won't reset after clicking on a cell, allowing multiple consecutive entries.
		</p>

		<h2>More features coming soon:</h2>
		<ul>
			<li>Pencil-marking</li>
			<li>Difficulty selection (without going through the debug panel)</li>
			<li>Game timer</li>
			<li>Solver that you can step through and visualize</li>
		</ul>
		<p>(you can press 'd' to activate the debug panel)</p>
	</div>
</section>

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 600;
	}
</style>
