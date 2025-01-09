'use client'

import { usePathname } from "next/navigation"

export function getPathNameWithoutLocale(): string {
    const pathname = usePathname();
    return pathname.replace(/^\/(en|pt-BR)/, '');
}

