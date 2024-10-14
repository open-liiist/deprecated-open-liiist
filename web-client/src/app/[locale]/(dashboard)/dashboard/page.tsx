export default function DashboardPage() {
	return (
		<div className="min-h-screen bg-gray-100">
			<header className="bg-blue-600 text-white p-4">
				<h1 className="text-xl font-bold">Dashboard</h1>
			</header>
			<main className="p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-400">
					<div className="bg-white p-4 rounded-lg shadow-md">
						<h2 className="font-semibold">Card 1</h2>
						<p>Some information here...</p>
					</div>
					<div className="bg-white p-4 rounded-lg shadow-md">
						<h2 className="font-semibold">Card 2</h2>
						<p>More information here...</p>
					</div>
					<div className="bg-white p-4 rounded-lg shadow-md">
						<h2 className="font-semibold">Card 3</h2>
						<p>Additional details here...</p>
					</div>
				</div>
			</main>
		</div>
	);
}
