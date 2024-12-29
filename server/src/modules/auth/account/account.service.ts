import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input'
import { hash } from 'argon2'

@Injectable()
export class AccountService {
	constructor(private readonly prismaService: PrismaService) {
	}

	public async me(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id }
		})

		return user
	}

	public async create(input: CreateUserInput) {
		const { username, password } = input

		const isUsernameExist = await this.prismaService.user.findUnique({
			where: {
				username
			}
		})

		if (isUsernameExist) {
			throw new ConflictException('Username already exist')
		}

		await this.prismaService.user.create({
			data: {
				username,
				password: await hash(password)
			}
		})

		return true
	}
}
