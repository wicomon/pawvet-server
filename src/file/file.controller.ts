import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/entities/ContextUser';
import { Response } from 'express';
import { access } from 'fs/promises';
import { ImageValidatorConfig } from './interceptors/image-validator.config';
import { FileService } from './file.service';

@UseGuards(JwtAuthGuard)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(ImageValidatorConfig(true)) file: Express.Multer.File,
    @CurrentUser() user: ContextUser,
  ) {
    const response = await this.fileService.uploadImage(file);

    return response;
  }

  @Get('image/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'uploads', filename);

    try {
      await access(filePath);
    } catch {
      throw new BadRequestException('Imagen no encontrada');
    }

    return res.sendFile(filePath);
  }
}
