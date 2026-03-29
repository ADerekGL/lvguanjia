import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment, Order } from '@/entities';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockConfig = { get: jest.fn() };

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepo: ReturnType<typeof mockRepo>;
  let orderRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    paymentRepo = mockRepo();
    orderRepo = mockRepo();
    // Default: payment disabled (no Alipay SDK init)
    mockConfig.get.mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('createPayment', () => {
    it('throws NotFoundException when order not found', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.createPayment(1, 1, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when order status is not 1', async () => {
      orderRepo.findOne.mockResolvedValue({ id: 1, status: 2, userId: 1, orderNo: 'ORD001', totalAmount: '100.00', items: [] });
      await expect(service.createPayment(1, 1, 1)).rejects.toThrow(BadRequestException);
    });

    it('returns existing pending payment when one exists', async () => {
      orderRepo.findOne.mockResolvedValue({ id: 1, status: 1, userId: 1, orderNo: 'ORD001', totalAmount: '100.00', items: [] });
      paymentRepo.findOne.mockResolvedValue({ id: 99, orderId: 1, transactionId: 'TXN_EXISTING', status: 0 });

      const result = await service.createPayment(1, 1, 1);
      expect(result.transactionId).toBe('TXN_EXISTING');
    });

    it('creates mock payment when payment feature is disabled', async () => {
      const order = { id: 1, status: 1, userId: 1, orderNo: 'ORD002', totalAmount: '50.00', items: [] };
      orderRepo.findOne.mockResolvedValue(order);
      paymentRepo.findOne.mockResolvedValue(null);
      paymentRepo.create.mockReturnValue({ orderId: 1, status: 1, channel: 1 });
      paymentRepo.save.mockResolvedValue({ id: 10, orderId: 1, status: 1 });
      orderRepo.update.mockResolvedValue({});

      const result = await service.createPayment(1, 1, 1);
      expect(result.mock).toBe(true);
      expect(orderRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 2 }));
    });
  });

  describe('confirmPayment', () => {
    it('updates existing payment and order status', async () => {
      const existing = { id: 5, orderId: 1, status: 0, transactionId: 'OLD', amount: 0, channel: 0, paidAt: null };
      paymentRepo.findOne.mockResolvedValue(existing);
      paymentRepo.save.mockResolvedValue({ ...existing, status: 1, transactionId: 'TXN_NEW' });
      orderRepo.update.mockResolvedValue({});

      const result = await service.confirmPayment('TXN_NEW', 1, 99.9, 2);
      expect(result.status).toBe(1);
      expect(orderRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 2 }));
    });

    it('creates new payment record when none exists', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      const newPayment = { id: 20, orderId: 2, status: 1, transactionId: 'TXN_FRESH' };
      paymentRepo.create.mockReturnValue(newPayment);
      paymentRepo.save.mockResolvedValue(newPayment);
      orderRepo.update.mockResolvedValue({});

      const result = await service.confirmPayment('TXN_FRESH', 2, 200, 1);
      expect(paymentRepo.create).toHaveBeenCalled();
      expect(result.transactionId).toBe('TXN_FRESH');
    });
  });

  describe('getReceipt', () => {
    it('throws NotFoundException when order not found', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.getReceipt(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when order not paid', async () => {
      orderRepo.findOne.mockResolvedValue({ id: 1, status: 1, userId: 1 });
      await expect(service.getReceipt(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('returns receipt for paid order', async () => {
      orderRepo.findOne.mockResolvedValue({
        id: 1, status: 2, userId: 1, orderNo: 'ORD999', totalAmount: '88.00',
        hotel: { name: '测试酒店' }, room: { roomNumber: '301' },
        items: [{ productName: '矿泉水', price: '8.00', quantity: 2, subtotal: '16.00' }],
        payments: [{ channel: 2, paidAt: new Date('2026-01-01'), transactionId: 'TXN_PAID' }],
      });

      const receipt = await service.getReceipt(1, 1) as any;
      expect(receipt.orderNo).toBe('ORD999');
      expect(receipt.hotelName).toBe('测试酒店');
      expect(receipt.channel).toBe('支付宝');
      expect(receipt.items).toHaveLength(1);
      expect(receipt.totalAmount).toBe(88);
    });
  });
});
