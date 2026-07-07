import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export const ImageValidatorConfig = (fileIsRequired: boolean) =>
  new ParseFilePipe({
    fileIsRequired,
    validators: [
      new MaxFileSizeValidator({
        maxSize: 2e7,
        message: 'The image size must be lower than 20MB',
      }),
      new FileTypeValidator({
        fileType: '.(png|jpeg|jpg|bmp|tif)',
      }),
    ],
  });
