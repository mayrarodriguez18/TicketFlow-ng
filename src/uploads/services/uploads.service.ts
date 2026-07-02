import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {}

  getUploadDir(): string {
    return this.configService.get<string>('UPLOAD_DIR', './uploads/tickets');
  }
}
