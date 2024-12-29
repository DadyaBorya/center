import { NestFactory } from '@nestjs/core'
import { CoreModule } from './core/core.module'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import { ValidationPipe } from '@nestjs/common'
import { ms, type StringValue } from '@/src/shared/utils/ms.util'
import { parseBoolean } from '@/src/shared/utils/parse-boolean.util'
import { RedisStore } from 'connect-redis'
import { RedisService } from '@/src/core/redis/redis.service'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule, { rawBody: true })

	const config = app.get(ConfigService)
	const redis = app.get(RedisService)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie']
	})

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				domain: config.getOrThrow<string>('SESSION_DOMAIN'),
				maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				httpOnly: parseBoolean(
					config.getOrThrow<string>('SESSION_HTTP_ONLY')
				),
				secure: parseBoolean(
					config.getOrThrow<string>('SESSION_SECURE')
				),
				sameSite: 'lax'
			},
			store: new RedisStore({
				client: redis,
				prefix: config.getOrThrow<string>('SESSION_FOLDER')
			})
		})
	)

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}

bootstrap()
