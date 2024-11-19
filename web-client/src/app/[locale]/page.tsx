import {noto_Sans, nunito, oswald} from "@/components/ui/fonts"

export default function Home() {
	return (
		<div>
			<main className="bg-liiist_green min-h-screen flex flex-col items-center justify-center text-liiist_white">
				<h1 className={`${noto_Sans.className} text-5xl font-bold mb-6`}>liiist</h1>
				<p className={`${oswald.className}, text-xl text-center max-w-lg mb-12`}>
					Find the best grocery spot.
				</p>
				<div className="flex space-x-4">
					<a
						href="/sign-in"
						className=" border-liiist_white border-2 text-liiist_white font-semibold py-2 px-6 rounded-lg shadow-lg hover:opacity-50 transition"
					>
						Sign In
					</a>
					<a
						href="/sign-up"
						className=" border-liiist_white border-2 text-liiist_white font-semibold py-2 px-6 rounded-lg shadow-lg hover:opacity-50 transition"
					>
						Sign up
					</a>
					{/* <a
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
					</a> */}
				</div>
			</main>

			<footer className="bg-gray-800 text-white py-4 text-center">
				<p>© 2024 MarketListApp - All Rights Reserved</p>
			</footer>
		</div>

	);
}
