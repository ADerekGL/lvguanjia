import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import {
  Hotel,
  Room,
  Product,
  ServiceType,
  User,
  Message,
  Order,
  OrderItem,
  ServiceRequest,
  Payment,
} from '../src/entities';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'smart_hotel',
  entities: [Hotel, Room, Product, ServiceType, User, Message, Order, OrderItem, ServiceRequest, Payment],
  synchronize: false,
  timezone: '+08:00',
});

async function seed() {
  await dataSource.initialize();
  console.log('Connected to DB');

  // Hotel
  const hotelRepo = dataSource.getRepository(Hotel);
  let hotel = await hotelRepo.findOne({ where: { name: '智慧酒店' } });
  if (!hotel) {
    hotel = await hotelRepo.save(
      hotelRepo.create({
        name: '智慧酒店',
        address: '北京市朝阳区示例路100号',
        phone: '400-000-0000',
        city: '北京',
        province: '北京',
        status: 1,
      }),
    );
    console.log('Created hotel id:', hotel.id);
  } else {
    console.log('Hotel exists id:', hotel.id);
  }

  // Rooms
  const roomRepo = dataSource.getRepository(Room);
  const existingRooms = await roomRepo.count({ where: { hotelId: hotel.id } });
  if (existingRooms === 0) {
    const rooms = [
      { floor: 1, roomNumber: '101', type: 1, status: 1, price: 299, description: '标准间' },
      { floor: 1, roomNumber: '102', type: 1, status: 1, price: 299, description: '标准间' },
      { floor: 1, roomNumber: '103', type: 1, status: 1, price: 299, description: '标准间' },
      { floor: 2, roomNumber: '201', type: 2, status: 1, price: 399, description: '大床房' },
      { floor: 2, roomNumber: '202', type: 2, status: 1, price: 399, description: '大床房' },
      { floor: 2, roomNumber: '203', type: 2, status: 1, price: 399, description: '大床房' },
      { floor: 3, roomNumber: '301', type: 3, status: 1, price: 599, description: '套房' },
      { floor: 3, roomNumber: '302', type: 3, status: 1, price: 599, description: '套房' },
    ];
    for (const r of rooms) {
      await roomRepo.save(roomRepo.create({ ...r, hotelId: hotel.id }));
    }
    console.log(`Created ${rooms.length} rooms`);
  } else {
    console.log(`Rooms already exist: ${existingRooms}`);
  }

  // Products
  const productRepo = dataSource.getRepository(Product);
  const existingProducts = await productRepo.count({ where: { hotelId: hotel.id } });
  if (existingProducts === 0) {
    const products = [
      { name: '矿泉水', price: 5, stock: 100, category: '饮品', status: 1, description: '农夫山泉500ml' },
      { name: '可乐', price: 8, stock: 50, category: '饮品', status: 1, description: '可口可乐330ml' },
      { name: '橙汁', price: 12, stock: 30, category: '饮品', status: 1, description: '鲜榨橙汁250ml' },
      { name: '方便面', price: 6, stock: 80, category: '零食', status: 1, description: '康师傅红烧牛肉面' },
      { name: '薯片', price: 10, stock: 60, category: '零食', status: 1, description: '品客原味薯片' },
      { name: '巧克力', price: 15, stock: 40, category: '零食', status: 1, description: '德芙牛奶巧克力' },
      { name: '牙刷', price: 8, stock: 50, category: '日用品', status: 1, description: '一次性牙刷含牙膏' },
      { name: '剃须刀', price: 12, stock: 30, category: '日用品', status: 1, description: '一次性剃须刀' },
      { name: '洗发水', price: 20, stock: 20, category: '日用品', status: 1, description: '海飞丝洗发水小瓶' },
      { name: '拖鞋', price: 15, stock: 50, category: '日用品', status: 1, description: '一次性酒店拖鞋' },
    ];
    for (const p of products) {
      await productRepo.save(productRepo.create({ ...p, hotelId: hotel.id }));
    }
    console.log(`Created ${products.length} products`);
  } else {
    console.log(`Products already exist: ${existingProducts}`);
  }

  // Service Types
  const serviceTypeRepo = dataSource.getRepository(ServiceType);
  const existingTypes = await serviceTypeRepo.count({ where: { hotelId: hotel.id } });
  if (existingTypes === 0) {
    const types = [
      { name: '送餐服务', icon: 'food', sort: 1, status: 1 },
      { name: '换洗床单', icon: 'bed', sort: 2, status: 1 },
      { name: '叫醒服务', icon: 'alarm', sort: 3, status: 1 },
      { name: '洗衣服务', icon: 'laundry', sort: 4, status: 1 },
      { name: '维修报修', icon: 'repair', sort: 5, status: 1 },
      { name: '额外毛巾', icon: 'towel', sort: 6, status: 1 },
      { name: '接送机', icon: 'car', sort: 7, status: 1 },
      { name: '其他需求', icon: 'other', sort: 8, status: 1 },
    ];
    for (const t of types) {
      await serviceTypeRepo.save(serviceTypeRepo.create({ ...t, hotelId: hotel.id }));
    }
    console.log(`Created ${types.length} service types`);
  } else {
    console.log(`Service types already exist: ${existingTypes}`);
  }

  await dataSource.destroy();
  console.log('Seed complete!');
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
