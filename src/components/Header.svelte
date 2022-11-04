<script>
	import { page } from '$app/stores';
</script>

<header>
	<nav>
		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Sudoku</a>
			</li>
			<li aria-current={$page.url.pathname === '/generator' ? 'page' : undefined}>
				<a href="/generator">About</a>
			</li>
		</ul>
	</nav>
</header>

<style lang="scss">
	header {
		background: rgb(2, 0, 36);
		background: linear-gradient(
			90deg,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 0) clamp(500px, 80%, 1200px)
		);
	}
	ul {
		display: flex;
		list-style-type: none;

		li {
			margin-right: 2rem;
		}
	}
	a {
		font-weight: 600;
	}
</style>
