import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';

@ApiTags('商品')
@Controller('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取当前酒店商品列表' })
  @ApiQuery({ name: 'category', required: false, description: '商品分类过滤' })
  @ApiResponse({ status: 200, description: '商品列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findAll(@Request() req: any, @Query('category') category?: string) {
    return this.productService.findAll(req.user.hotelId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '商品详情' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: '创建商品（仅系统管理员）' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '权限不足，需要系统管理员角色' })
  async create(@Request() req: any, @Body() body: any) {
    return this.productService.create({ ...body, hotelId: req.user.hotelId });
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: '更新商品（仅系统管理员）' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '权限不足，需要系统管理员角色' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: '删除商品（仅系统管理员）' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '权限不足，需要系统管理员角色' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}
