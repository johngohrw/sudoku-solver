<script>
	import SudokuGame from '../components/SudokuGame.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>sudoku</h1>
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

		<p>More features coming soon:</p>
		<ul>
			<li>lol</li>
		</ul>
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
