import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { UserProvider } from "@/services/auth";
import { getUser } from "@/services/user";

const geistSans = localFont({
	src: "../fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "../fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "liiist",
	description: "liiist is a grocery list app for the modern age.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const messages = await getMessages();
	const userPromise = getUser();

	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-liiist_white`}
			>
				<UserProvider userPromise={userPromise}>
					<NextIntlClientProvider messages={messages}>
						{children}
					</NextIntlClientProvider>
				</UserProvider>
			</body>
		</html>
	);
}
