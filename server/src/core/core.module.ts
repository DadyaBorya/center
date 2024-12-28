import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma/prisma.module';

@Module({
	imports: [PrismaModule]
})
export class CoreModule {
}
