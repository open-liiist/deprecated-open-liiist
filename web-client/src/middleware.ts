import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { APP_HOME, APP_LOGIN, authRoutes, privateRoutes, publicRoutes } from './routes';
import { verifyToken } from './services/auth/session';

const intlMiddleware = createMiddleware(routing);

class RouteHandler {
	private req: NextRequest
	private locale: string
	private pathNameWithoutLocale: string

	constructor(req: NextRequest) {
		this.req = req;
		this.locale = this.getCurrentLocale();
		this.pathNameWithoutLocale = this.getPathNameWithoutLocale();
	}

	private getCurrentLocale(): string {
		const { nextUrl } = this.req;
		return nextUrl.locale || cookies().get("NEXT_LOCALE")?.value || 'en'
	}

	private getPathNameWithoutLocale(): string {
		const { pathname } = this.req.nextUrl;
		return pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, '')
	}

	isPublicRoute(): boolean {
		return publicRoutes.includes(this.pathNameWithoutLocale)
	}

	isAuthRoute(): boolean {
		return authRoutes.some((route) =>
			this.pathNameWithoutLocale.startsWith(route)
		)
	}

	isPrivateRoute(): boolean {
		return privateRoutes.some((route) =>
			this.pathNameWithoutLocale.startsWith(route)
		)
	}

	handleRedirection(isLoggedIn: boolean): NextResponse | undefined {
		if (
			this.isPublicRoute() ||
			(!isLoggedIn && this.isAuthRoute()) ||
			(isLoggedIn && this.isPrivateRoute())
		) {
			return intlMiddleware(this.req)
		}

		if (!isLoggedIn && this.isPrivateRoute()) {
			const redirectUrl = new URL(
				`/${this.locale}${APP_LOGIN}`,
				this.req.nextUrl.origin
			)
			return NextResponse.redirect(redirectUrl);
		}

		if (isLoggedIn && this.isAuthRoute()) {
			const redirectUrl = new URL(
				`/${this.locale}${APP_HOME}`,
				this.req.nextUrl.origin
			)
			return NextResponse.redirect(redirectUrl);
		}

		return intlMiddleware(this.req)
	}
}

export async function middleware(request: NextRequest) {
	const accessToken = request.cookies.get('accessToken');

	if (!accessToken || !accessToken.value)
		return new RouteHandler(request).handleRedirection(false);

	const user = await verifyToken(accessToken.value);

	return new RouteHandler(request).handleRedirection(!!user);
}

export const config = {
	// Match only internationalized pathnames
	matcher: [
		'/',
		'/(en|pt-BR)/:path*',
		// Enable redirects that add missing locales
		// (e.g. `/pathnames` -> `/en/pathnames`)
		'/((?!_next|_vercel|.*\\..*).*)',
		'/((?!api|_next/static|_next/image|favicon.ico).*)'
	]
};
