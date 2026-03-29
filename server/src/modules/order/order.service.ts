import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, Product } from '@/entities';

interface CreateOrderItem {
  productId: number;
  quantity: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(hotelId: number, roomId: number, userId: number, items: CreateOrderItem[], remark?: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of items) {
        const product = await manager.findOne(Product, { where: { id: item.productId } });
        if (!product) throw new NotFoundException(`商品 ${item.productId} 不存在`);
        if (product.stock < item.quantity) throw new BadRequestException(`商品 ${product.name} 库存不足`);

        const subtotal = Number(product.price) * item.quantity;
        totalAmount += subtotal;
        orderItems.push({
          productId: item.productId,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal,
        });

        await manager.decrement(Product, { id: item.productId }, 'stock', item.quantity);
      }

      const orderNo = `ORD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const order = manager.create(Order, { hotelId, roomId, userId, orderNo, totalAmount, remark, status: 1 });
      const savedOrder = await manager.save(order);

      for (const oi of orderItems) {
        oi.orderId = savedOrder.id;
        await manager.save(manager.create(OrderItem, oi));
      }

      return manager.findOne(Order, { where: { id: savedOrder.id }, relations: ['items'] }) as Promise<Order>;
    });
  }

  async findByRoom(roomId: number, page = 1, limit = 10): Promise<{ orders: Order[]; total: number }> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { roomId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['items'],
    });
    return { orders, total };
  }

  async findById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { id }, relations: ['items', 'payments'] });
  }

  async findByHotel(hotelId: number, page = 1, limit = 20): Promise<{ orders: Order[]; total: number }> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { hotelId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['items', 'room'],
    });
    return { orders, total };
  }

  async updateStatus(id: number, status: number): Promise<Order> {
    await this.orderRepository.update(id, { status });
    return this.findById(id) as Promise<Order>;
  }

  async cancel(id: number, userId: number): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('订单不存在');
    if (order.userId !== userId) throw new BadRequestException('无权操作此订单');
    if (order.status !== 1) throw new BadRequestException('只能取消待支付订单');

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Order, id, { status: 5 });
      const items = await this.orderItemRepository.find({ where: { orderId: id } });
      for (const item of items) {
        await manager.increment(Product, { id: item.productId }, 'stock', item.quantity);
      }
    });

    return this.findById(id) as Promise<Order>;
  }
}
