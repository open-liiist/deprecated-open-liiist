'use client';

import Header from '../../../components/ui/Header'; // Importa il componente Header
import '../../globals.css';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<section className="relative min-h-screen">
			<Header />
			{/* Aggiungi margine superiore per lasciare spazio alla navbar */}
			<main className="pt-navbar flex-grow overflow-hidden">{children}</main>
		</section>
	);
}
