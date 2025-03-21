'use client';

import Header from '../../../components/ui/Header'; // Header component
import '../../globals.css';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<section className="relative min-h-screen">
			<Header />
			{/* Add top margin to leave space for the navbar */}
			<main className="pt-navbar flex-grow overflow-hidden">{children}</main>
		</section>
	);
}
