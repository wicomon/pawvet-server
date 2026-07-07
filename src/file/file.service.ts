import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { join, extname } from 'path';

@Injectable()
export class FileService {
  private readonly uploadPath = './public/uploads';

  async uploadImage(file: Express.Multer.File) {
    const ext = extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const filePath = join(this.uploadPath, filename);

    await mkdir(this.uploadPath, { recursive: true });
    await writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${filename}`,
    };
  }

  getFileUrl(filename: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:4030';
    return `${baseUrl}/file/image/${filename}`;
  }
}
