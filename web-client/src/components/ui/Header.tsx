
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/services/auth';
import { signOut } from '../../app/[locale]/(login)/actions';
import { useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import SetLocationLink from '@/components/ui/SetLocationLink';
import { noto_Sans } from '@/components/ui/fonts';

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { user, setUser } = useUser();
	const router = useRouter();
	const pathname = usePathname();

	// Otteniamo la location ma non la visualizziamo
	useState(() => {
		// Simuliamo l'ottenimento della location
		// Potresti integrare la logica di SetLocationLink qui in futuro
	}, []);

	async function handleSignOut() {
		setUser(null);
		await signOut();
		router.push('/');
	}

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-navbar bg-liiist_white">
			<div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex w-full items-center">
				{/* Sezione Sinistra - Scritta "liiist" al posto della location */}
				<div className="flex items-center w-[200px] justify-start">
					<Link href="/home">
						<span className="text-3xl font-semibold text-liiist_black cursor-pointer">liiist</span>
					</Link>
				</div>

				{/* Sezione Centrale - Vuota */}
				<div className="flex-grow text-center">
					
				</div>

				{/* Sezione Destra - Profile/Login */}
				<div className="flex items-center space-x-4 w-[200px] justify-end">
					{user && (
						<Link
							href="/profile"
							className="text-sm font-medium text-gray-700 hover:text-gray-900"
						>
							Profile
						</Link>
					)}
					{user ? (
						<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
							<DropdownMenuTrigger asChild>
							<Avatar className="cursor-pointer">
	<AvatarImage
		alt={user.name || ''}
		src={`https://api.dicebear.com/6.x/big-ears-neutral/svg?seed=${encodeURIComponent(
			user.email || user.name || 'random'
		)}&radius=15`} // Adds rounded corners to the avatar
		className=" border-gray-200 shadow-sm rounded-lg"
	/>
	<AvatarFallback>
		{user.email
			.split(' ')
			.map((n) => n[0])
			.join('')}
	</AvatarFallback>
</Avatar>

							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="flex flex-col gap-1">
								<DropdownMenuItem className="cursor-pointer">
									<Link href="/dashboard" className="flex w-full items-center">
										<Home className="mr-2 h-4 w-4" />
										<span>Dashboard</span>
									</Link>
								</DropdownMenuItem>
								<button onClick={handleSignOut} className="flex w-full">
									<DropdownMenuItem className="w-full flex-1 cursor-pointer">
										<LogOut className="mr-2 h-4 w-4" />
										<span>Sign out</span>
									</DropdownMenuItem>
								</button>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button
							asChild
							className="bg-liiist_black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
						>
							<Link href="/sign-up">Sign Up</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}

export default Header;
