/*
	define here all the routes of the application
	publicRoutes: routes that are accessible by everyone
	privateRoutes: routes that are only accessible by authenticated users
	authRoutes: routes that are only accessible by unauthenticated users
*/

export const publicRoutes = ['/', '/app']
export const privateRoutes = ['/dashboard', '/profile']
export const authRoutes = ['/sign-in', '/sign-up']
export const APP_HOME = '/app'
export const APP_LOGIN = '/sign-in'
