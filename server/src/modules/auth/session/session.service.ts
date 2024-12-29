import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LoginInput } from '@/src/modules/auth/session/input/login.input'
import { verify } from 'argon2'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'

@Injectable()
export class SessionService {
	constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService) {
	}

	public async login(req: Request, input: LoginInput, userAgent: string) {
		const { username, password } = input

		const user = await this.prismaService.user.findUnique({
			where: {
				username
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid password')
		}

		const metadata = getSessionMetadata(req, userAgent)

		return new Promise((resolve, reject) => {
			req.session.createdAt = new Date()
			req.session.userId = user.id
			req.session.metadata = metadata

			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Could not save session'
						)
					)
				}

				resolve(user)
			})
		})
	}

	public async logout(req: Request) {
		return new Promise((resolve, reject) => {

			req.session.destroy(err => {
				if (err) {
					return reject(new InternalServerErrorException('Could not end session'))
				}

				req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
				resolve(true)
			})
		})
	}
}
