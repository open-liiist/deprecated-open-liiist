import type { Metadata } from "next";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { UserProvider } from "@/services/auth";
import { getUser } from "@/services/user";
import { poppins } from "@/components/ui/fonts";

export const metadata: Metadata = {
	title: "liiist",
	description: "a smart grocery list app",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const messages = await getMessages();
	const userPromise = getUser();

	return (
		<html lang="en" className={poppins.className}>
			<body className={`${poppins.className} antialiased bg-white text-black`}>
				<UserProvider userPromise={userPromise}>
					<NextIntlClientProvider messages={messages}>
						{children}
					</NextIntlClientProvider>
				</UserProvider>
			</body>
		</html>
	);
}
