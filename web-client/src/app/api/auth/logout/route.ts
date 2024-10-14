import { signOut } from "@/services/auth";

export async function GET() {
	await signOut()
}
