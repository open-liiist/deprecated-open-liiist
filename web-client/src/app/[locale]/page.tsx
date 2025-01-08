// import {noto_Sans, nunito, oswald} from "@/components/ui/fonts"

// export default function Home() {
// 	return (
// 		<div>
// 			<main className="bg-liiist_green min-h-screen flex flex-col items-center justify-center text-liiist_white">
// 				<h1 className={`text-5xl font-bold mb-6`}>liiist</h1>
// 				<p className={`text-xl text-center max-w-lg mb-12`}>
// 					Find the best grocery spot.
// 				</p>
// 				<div className="flex space-x-4">
// 					<a
// 						href="/sign-in"
// 						className=" border-liiist_white border-2 text-liiist_white font-semibold py-2 px-6 rounded-lg shadow-lg hover:opacity-50 transition"
// 					>
// 						Sign In
// 					</a>
// 					<a
// 						href="/sign-up"
// 						className=" border-liiist_white border-2 text-liiist_white font-semibold py-2 px-6 rounded-lg shadow-lg hover:opacity-50 transition"
// 					>
// 						Sign up
// 					</a>
// 					{/* <a
// 						href="/create-list"
// 						className="bg-white text-blue-500 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition"
// 					>
// 						Create Your List
// 					</a>
// 					<a
// 						href="/search"
// 						className="bg-white text-blue-500 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition"
// 					>
// 						Find Best Prices
// 					</a> */}
// 				</div>
// 			</main>

// 			<footer className="bg-gray-800 text-white py-4 text-center">
// 				<p>© 2024 MarketListApp - All Rights Reserved</p>
// 			</footer>
// 		</div>

// 	);
// }
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔨 Component per gestire la rotazione delle frasi
const PhraseRotator = ({ phrases }) => {
	const [currentPhrase, setCurrentPhrase] = React.useState(phrases[0]);
	const [visible, setVisible] = React.useState(true);

	React.useEffect(() => {
		const interval = setInterval(() => {
			setVisible(false);
			setTimeout(() => {
				setCurrentPhrase(prevPhrase => {
					const currentIndex = phrases.indexOf(prevPhrase);
					const nextIndex = (currentIndex + 1) % phrases.length;
					return phrases[nextIndex];
				});
				setVisible(true);
			}, 500);
		}, 5000);

		return () => clearInterval(interval);
	}, [phrases]);

	return (
		<AnimatePresence mode="wait">
			{visible && (
				<motion.p
					key={currentPhrase}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.5 }}
					className="text-E1F2FE text-5xl md:text-6xl font-semibold text-center max-w-4xl leading-tight"
				>
					{currentPhrase}
				</motion.p>
			)}
		</AnimatePresence>
	);
};

export default function Home() {
	const phrases = [
		"Non fare la spesa, senza liiist 🛒",
		"La spesa costa troppo!Siamo alla 🍎🥥🍋🍇",
		"Risparmiare è stressante,lo sappiamo🫂",
		"Al miglior prezzo possibile🥑🥦",
		"Dove compri? Come risparmi?🤔",
	];

	return (
		<div>
			<main className="bg-liiist_green min-h-screen flex flex-col items-center justify-center text-liiist_white relative">
				
				{/* Header del titolo */}
				<header className="absolute top-8 left-0 right-0 flex justify-center">
					<h1 className="text-6xl font-bold">liiist</h1>
				</header>

				{/* Sezione principale con altezza fissa */}
				<section className="mt-24 flex flex-col items-center justify-center">
					<div className="min-h-[300px] flex items-center justify-center">
						<PhraseRotator phrases={phrases} />
					</div>
				</section>

				{/* Bottoni Sign In e Sign Up */}
				<section className="flex space-x-4 mt-16">
					<a
						href="/sign-in"
						className="border-liiist_white border-2 text-liiist_white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 hover:opacity-90 transition-transform"
					>
						Sign In
					</a>
					<a
						href="/sign-up"
						className="border-liiist_white border-2 text-liiist_white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:scale-105 hover:opacity-90 transition-transform"
					>
						Sign up
					</a>
				</section>
			</main>

			<footer className="bg-gray-800 text-white py-4 text-center">
				<p>© 2024 liiist - All Rights Reserved</p>
			</footer>
		</div>
	);
}

