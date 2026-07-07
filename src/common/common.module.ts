import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { CommonService } from './services/common.service';

@Global()
@Module({
  exports: [PrismaService, CommonService],
  providers: [PrismaService, CommonService],
})
export class CommonModule {}
