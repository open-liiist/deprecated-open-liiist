export default function Home() {
	return (
		<div>
			<main className="bg-gradient-to-r from-green-400 to-blue-500 min-h-screen flex flex-col items-center justify-center text-white">
				<h1 className="text-5xl font-bold mb-8">Welcome to GrocyGo</h1>
				<p className="text-xl text-center max-w-lg mb-12">
					Plan your grocery shopping effortlessly. Create your list, find the best prices nearby, and save on every trip.
				</p>

				<div className="flex space-x-4">
					<a
						href="/sign-in"
						className="bg-white text-blue-500 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition"
					>
						Sign In
					</a>
					<a
						href="/create-list"
						className="bg-white text-blue-500 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition"
					>
						Create Your List
					</a>
					<a
						href="/search"
						className="bg-white text-blue-500 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition"
					>
						Find Best Prices
					</a>
				</div>
			</main>

			<footer className="bg-gray-800 text-white py-4 text-center">
				<p>© 2024 MarketListApp - All Rights Reserved</p>
			</footer>
		</div>

	);
}
