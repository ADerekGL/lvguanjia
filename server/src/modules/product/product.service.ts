import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@/entities';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(hotelId: number, category?: string): Promise<Product[]> {
    const where: any = { hotelId, status: 1 };
    if (category) where.category = category;
    return this.productRepository.find({ where, order: { id: 'DESC' } });
  }

  async findById(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async update(id: number, data: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, data);
    const product = await this.findById(id);
    if (!product) throw new NotFoundException('商品不存在');
    return product;
  }

  async delete(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async findAllByHotel(hotelId: number, category?: string): Promise<Product[]> {
    const where: any = { hotelId };
    if (category) where.category = category;
    return this.productRepository.find({ where, order: { id: 'DESC' } });
  }

  async decreaseStock(id: number, quantity: number): Promise<void> {
    await this.productRepository.decrement({ id }, 'stock', quantity);
  }
}
