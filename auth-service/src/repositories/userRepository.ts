import prisma from '../services/prisma'

export class UserRepository {
	static async createUser(email: string, passwordHash: string, name: string, dateOfBirth: Date, supermarkets: string[]) {
		return await prisma.user.create({
			data: {
				email,
				passwordHash,
				name,
				dateOfBirth,
				supermarkets,
			},
		});
	}

	static async findUserByEmail(email: string) {
		return await prisma.user.findUnique({
			where: {
				email,
			},
		})
	}

	static async findUserById(id: string) {
		return await prisma.user.findUnique({
			where: {
				id,
			},
		})
	}

	static async findManyUsers() {
		return await prisma.user.findMany()
	}
}
