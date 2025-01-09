//web-client/src/routes.ts
/*
	define here all the routes of the application
	publicRoutes: routes that are accessible by everyone
	privateRoutes: routes that are only accessible by authenticated users
	authRoutes: routes that are only accessible by unauthenticated users
*/


export const publicRoutes = ['/', '/profile', '/sign-in'];
export const privateRoutes = ['/dashboard', '/profile', '/home'];
export const authRoutes = ['/(login)/sign-in', '/(login)/sign-up', '/auth'];
export const APP_HOME = '/home';
export const APP_LOGIN = '/sign-in';
export const API_ROUTES = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_TOKEN: '/auth/verify-token',
    LOGOUT: '/auth/logout',
    GET_SHOPPING_LISTS: '/shoppingList',
};

