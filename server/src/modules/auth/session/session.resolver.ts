import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { SessionService } from './session.service'
import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { GqlContext } from '@/src/shared/types/gql-context.types'
import { LoginInput } from '@/src/modules/auth/session/input/login.input'

@Resolver('Session')
export class SessionResolver {
	constructor(private readonly sessionService: SessionService) {
	}

	@Mutation(() => UserModel, { name: 'loginUser' })
	public async login(@Context() { req }: GqlContext, @Args('data') input: LoginInput) {
		return this.sessionService.login(req, input)
	}

	@Mutation(() => Boolean, { name: 'logoutUser' })
	public async logout(@Context() { req }: GqlContext) {
		return this.sessionService.logout(req)
	}
}
