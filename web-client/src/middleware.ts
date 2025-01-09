//web-client/src/middleware.ts

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { APP_HOME, APP_LOGIN, authRoutes, privateRoutes, publicRoutes } from './routes';
import { verifyToken } from './services/auth/session';
import environment from './config/environment';

/*
    https://next-intl-docs.vercel.app/
*/
const intlMiddleware = createMiddleware(routing);

/*
    Redirect users based on their authentication status and based on 
    the routes configured in src/routes.ts
*/
class RouteHandler {
    private req: NextRequest;
    private locale: string;
    private pathNameWithoutLocale: string;

    constructor(req: NextRequest) {
        this.req = req;
        this.locale = this.getCurrentLocale();
        this.pathNameWithoutLocale = this.getPathNameWithoutLocale();
    }

    private getCurrentLocale(): string {
        const { nextUrl } = this.req;
        return nextUrl.locale || cookies().get("NEXT_LOCALE")?.value || 'en';
    }

    private getPathNameWithoutLocale(): string {
        const { pathname } = this.req.nextUrl;
        return pathname.replace(/^\/(en|pt-BR)/, ''); // Regex aggiornata
    }

    isPublicRoute(): boolean {
        return publicRoutes.includes(this.pathNameWithoutLocale);
    }

	isAuthRoute(): boolean {
        return authRoutes.some((route) =>
            this.pathNameWithoutLocale === route ||
            this.pathNameWithoutLocale.startsWith(`${route}/`)
        );
    }

    isPrivateRoute(): boolean {
        return privateRoutes.some((route) =>
            this.pathNameWithoutLocale.startsWith(route)
        );
    }

    handleRedirection(isLoggedIn: boolean): NextResponse | undefined {
        console.log(`Handling redirection for path: ${this.pathNameWithoutLocale}, isLoggedIn: ${isLoggedIn}`);

        if (this.pathNameWithoutLocale.startsWith('/api')) {
            console.log('Passing through API route');
            return NextResponse.next(); // Lascia passare le richieste API senza ulteriori elaborazioni
        }

        if (
            this.isPublicRoute() ||
            (isLoggedIn && this.isPrivateRoute())
        ) {
            console.log('Processing with intlMiddleware');
            return intlMiddleware(this.req); // Gestisci la localizzazione solo per rotte pubbliche o private per utenti autenticati
        }

        if (!isLoggedIn && this.isAuthRoute()) {
            console.log('Allowing access to auth route without intlMiddleware');
            return NextResponse.next(); // Permetti agli utenti non autenticati di accedere alle rotte di autenticazione senza passare per intlMiddleware
        }

        if (isLoggedIn && this.isAuthRoute()) {
            const redirectUrl = new URL(
                `/${this.locale}${APP_HOME}`,
                this.req.nextUrl.origin
            );
            console.log(`Redirecting authenticated user from auth route to home: ${redirectUrl}`);
            return NextResponse.redirect(redirectUrl); // Reindirizza gli utenti autenticati dalle rotte di autenticazione alla home
        }

        console.log('Default processing with intlMiddleware');
        return intlMiddleware(this.req); // Gestisci la localizzazione per tutte le altre rotte
    }
}

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get(environment.cookies.access);
    const routeHandler = new RouteHandler(request);

    if (!accessToken || !accessToken.value) {
        console.log('Token non presente nel cookie');
        return routeHandler.handleRedirection(false);
    }

    const user = await verifyToken(accessToken.value);

    if (!user) {
        console.log('Token non valido o scaduto');
        return routeHandler.handleRedirection(false);
    }

    console.log('Utente verificato:', user);
    return routeHandler.handleRedirection(true);
}

export const config = {
    // Match only internationalized pathnames and exclude /auth/*, _next, etc.
    matcher: [
        '/',
        '/(en|pt-BR)/:path*',
        '/((?!_next|_vercel|.*\\..*|auth/).*)',
        '/((?!api|_next/static|_next/image|favicon.ico|maps\\.googleapis\\.com).*)'
    ]
};

// import createMiddleware from 'next-intl/middleware';
// import { routing } from './i18n/routing';
// import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { APP_HOME, APP_LOGIN, authRoutes, privateRoutes, publicRoutes } from './routes';
// import { verifyToken } from './services/auth/session';
// import environment from './config/environment';

// /*
// 	https://next-intl-docs.vercel.app/
// */
// const intlMiddleware = createMiddleware(routing);

// /*
// 	Redirect users based on their authentication status and based on 
// 	the routes configured in src/routes.ts
// */
// class RouteHandler {
// 	private req: NextRequest
// 	private locale: string
// 	private pathNameWithoutLocale: string

// 	constructor(req: NextRequest) {
// 		this.req = req;
// 		this.locale = this.getCurrentLocale();
// 		this.pathNameWithoutLocale = this.getPathNameWithoutLocale();
// 	}

// 	private getCurrentLocale(): string {
// 		const { nextUrl } = this.req;
// 		return nextUrl.locale || cookies().get("NEXT_LOCALE")?.value || 'en'
// 	}

// 	private getPathNameWithoutLocale(): string {
// 		const { pathname } = this.req.nextUrl;
// 		return pathname.replace(/^\/(en|pt-BR)/, '');
// 	}
	

// 	isPublicRoute(): boolean {
// 		return publicRoutes.includes(this.pathNameWithoutLocale)
// 	}

// 	isAuthRoute(): boolean {
// 		return authRoutes.some((route) =>
// 			this.pathNameWithoutLocale.startsWith(route)
// 		)
// 	}

// 	isPrivateRoute(): boolean {
// 		return privateRoutes.some((route) =>
// 			this.pathNameWithoutLocale.startsWith(route)
// 		)
// 	}

// 	handleRedirection(isLoggedIn: boolean): NextResponse | undefined {
// 		if (this.pathNameWithoutLocale.startsWith('/api')) {
// 			return NextResponse.next(); // Lascia passare le richieste API senza ulteriori elaborazioni
// 		}
	
// 		if (
// 			this.isPublicRoute() ||
// 			(isLoggedIn && this.isPrivateRoute())
// 		) {
// 			return intlMiddleware(this.req); // Gestisci la localizzazione solo per rotte pubbliche o private per utenti autenticati
// 		}
	
// 		if (!isLoggedIn && this.isAuthRoute()) {
// 			return NextResponse.next(); // Permetti agli utenti non autenticati di accedere alle rotte di autenticazione senza passare per intlMiddleware
// 		}
	
// 		if (isLoggedIn && this.isAuthRoute()) {
// 			const redirectUrl = new URL(
// 				`/${this.locale}${APP_HOME}`,
// 				this.req.nextUrl.origin
// 			);
// 			return NextResponse.redirect(redirectUrl); // Reindirizza gli utenti autenticati dalle rotte di autenticazione alla home
// 		}
	
// 		return intlMiddleware(this.req); // Gestisci la localizzazione per tutte le altre rotte
// 	}
	
// }

// // export async function middleware(request: NextRequest) {
// // 	const accessToken = request.cookies.get(environment.cookies.access);
// // 	console.log('Access Token Cookie:', accessToken?.value); // Log del cookie


// // 	if (!accessToken || !accessToken.value)
// // 		return new RouteHandler(request).handleRedirection(false);

// // 	const user = await verifyToken(accessToken.value);
// // 	console.log('Utente verificato:', user); // Log del risultato della verifica del token


// // 	return new RouteHandler(request).handleRedirection(!!user);
// // }
// export async function middleware(request: NextRequest) {
//     const accessToken = request.cookies.get(environment.cookies.access);

//     if (!accessToken || !accessToken.value) {
//         console.log('Token non presente nel cookie');
//         return new RouteHandler(request).handleRedirection(false);
//     }

//     const user = await verifyToken(accessToken.value);

//     if (!user) {
//         console.log('Token non valido o scaduto');
//         return new RouteHandler(request).handleRedirection(false);
//     }

//     return new RouteHandler(request).handleRedirection(!!user);
// }


// export const config = {
// 	// Match only internationalized pathnames
// 	matcher: [
// 		'/',
// 		'/(en|pt-BR)/:path*',
// 		// Enable redirects that add missing locales
// 		// (e.g. `/pathnames` -> `/en/pathnames`)
// 		'/((?!_next|_vercel|.*\\..*).*)',
// 		'/((?!api|_next/static|_next/image|favicon.ico|maps\\.googleapis\\.com).*)'
// 	]
// };
