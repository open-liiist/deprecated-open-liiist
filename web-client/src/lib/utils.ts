import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/*
	utility for tailwind classes to be merged with clsx and tailwind-merge
	so that classes are conditionally joined together without style conflicts
*/
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
