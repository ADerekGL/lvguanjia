import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

@ApiTags('上传')
@Controller('upload')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
export class UploadController {
  @Post('image')
  @ApiOperation({ summary: '上传图片（仅系统管理员）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '图片文件（jpg/png/gif/webp，最大10MB）' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: '上传成功，返回 { url: string }', schema: { example: { url: '/uploads/images/1234567890-abc.jpg' } } })
  @ApiResponse({ status: 400, description: '文件类型不支持或未提供文件' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '权限不足，需要系统管理员角色' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'images');
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTS.includes(ext)) {
          return cb(new BadRequestException('只允许上传图片文件'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择文件');
    return { url: `/uploads/images/${file.filename}` };
  }
}
