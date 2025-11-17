/// <reference types="vite/client" />

declare module '$env/static/private' {
	export const MONGODB_URI: string;
	export const MONGODB_DB_NAME: string;
	export const SESSION_SECRET: string;
	export const NODE_ENV: string;
}

declare module '$env/static/public' {
	export const PUBLIC_APP_URL: string;
}

