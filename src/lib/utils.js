import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function generateIdempotencyKey() {
	const timestamp = Date.now().toString(36);
	const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return `${timestamp}${randomStr}`;
}