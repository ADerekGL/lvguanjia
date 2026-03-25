import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('商品')
@Controller('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  async findAll(@Request() req: any, @Query('category') category?: string) {
    return this.productService.findAll(req.user.hotelId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建商品' })
  async create(@Request() req: any, @Body() body: any) {
    return this.productService.create({ ...body, hotelId: req.user.hotelId });
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商品' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}
