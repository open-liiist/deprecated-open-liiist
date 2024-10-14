'use client'

import { usePathname } from "next/navigation"

export function getPathNameWithoutLocale(): string {
	const pathname = usePathname();
	return pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, '');
}
