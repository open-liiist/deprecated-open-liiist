import { ReactNode } from "react"

type Props = {
	children: ReactNode
}

// Since a "not-found.tsx" page exists at the root,
// a layout file is required even if it only passes through the children.
export default function RootLayout({ children }: Props) {
	return children;
}
