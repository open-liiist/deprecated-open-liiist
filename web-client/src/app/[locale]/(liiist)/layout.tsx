'use client';

import Header from '../../../components/ui/Header'; // Importa il componente Header

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<section className="relative min-h-screen">
			<Header />
			{/* Aggiungi margine superiore per lasciare spazio alla navbar */}
			<main className="mt-navbar flex-grow">{children}</main>
		</section>
	);
}
