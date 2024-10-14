import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
	locales: ['en', 'pt-BR'],
	defaultLocale: 'en',
	pathnames: {
		'/': '/',
		'/pathnames': {
			en: '/pathnames',
			"pt-BR": '/caminhos'
		}
	}
});


export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
	createSharedPathnamesNavigation(routing);
