import Link from 'next/link';
import { CircleIcon } from 'lucide-react';

export default function NotFound() {
	return (
		<div className="w-full h-full bg-liiist_green">
			<div className="flex items-center justify-center min-h-[100dvh]">
				<div className="max-w-md space-y-8 p-4 text-center">
					<h1 className="text-4xl font-bold text-liiist_white tracking-tight">
						404 Page Not Found
					</h1>
					<p className="text-base text-liiist_white">
						The page you are looking for might have been removed, had its name
						changed, or is temporarily unavailable.
					</p>
					<Link
						href="/"
						className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-liiist_white rounded-lg shadow-sm text-sm font-medium text-liiist_white bg-transparent hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
						>
						Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
