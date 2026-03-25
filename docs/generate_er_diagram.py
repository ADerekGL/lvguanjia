#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成数据库 ER 图（使用 graphviz 或 mermaid）
"""

from graphviz import Digraph

def create_er_diagram():
    dot = Digraph(comment='Smart Hotel ER Diagram')
    dot.attr(rankdir='TB')
    dot.attr('node', shape='rectangle', style='filled', fillcolor='lightblue')
    
    # Hotel 表
    dot.node('Hotel', 'Hotel\n酒店表\n----------\n+ id (PK)\n+ name\n+ address\n+ phone\n+ status')
    
    # User 表
    dot.node('User', 'User\n用户表\n----------\n+ id (PK)\n+ hotel_id (FK)\n+ room_id (FK)\n+ openid\n+ name\n+ role')
    
    # Room 表
    dot.node('Room', 'Room\n房间表\n----------\n+ id (PK)\n+ hotel_id (FK)\n+ room_number\n+ floor\n+ type\n+ status')
    
    # Message 表
    dot.node('Message', 'Message\n消息表\n----------\n+ id (PK)\n+ room_id (FK)\n+ sender_id (FK)\n+ content\n+ type')
    
    # Product 表
    dot.node('Product', 'Product\n商品表\n----------\n+ id (PK)\n+ hotel_id (FK)\n+ name\n+ price\n+ stock')
    
    # Order 表
    dot.node('Order', 'Order\n订单表\n----------\n+ id (PK)\n+ hotel_id (FK)\n+ room_id (FK)\n+ user_id (FK)\n+ order_no\n+ total_amount')
    
    # OrderItem 表
    dot.node('OrderItem', 'OrderItem\n订单明细\n----------\n+ id (PK)\n+ order_id (FK)\n+ product_id (FK)\n+ quantity\n+ price')
    
    # ServiceType 表
    dot.node('ServiceType', 'ServiceType\n服务类型\n----------\n+ id (PK)\n+ hotel_id (FK)\n+ name\n+ icon')
    
    # ServiceRequest 表
    dot.node('ServiceRequest', 'ServiceRequest\n服务请求\n----------\n+ id (PK)\n+ room_id (FK)\n+ user_id (FK)\n+ type_id (FK)\n+ status')
    
    # Payment 表
    dot.node('Payment', 'Payment\n支付记录\n----------\n+ id (PK)\n+ order_id (FK)\n+ transaction_id\n+ amount')
    
    # 关系
    dot.edge('Hotel', 'User', '1:N')
    dot.edge('Hotel', 'Room', '1:N')
    dot.edge('Hotel', 'Product', '1:N')
    dot.edge('Hotel', 'Order', '1:N')
    dot.edge('Hotel', 'ServiceType', '1:N')
    
    dot.edge('Room', 'User', '1:1')
    dot.edge('Room', 'Message', '1:N')
    dot.edge('Room', 'Order', '1:N')
    dot.edge('Room', 'ServiceRequest', '1:N')
    
    dot.edge('User', 'Message', '1:N')
    dot.edge('User', 'Order', '1:N')
    dot.edge('User', 'ServiceRequest', '1:N')
    
    dot.edge('Order', 'OrderItem', '1:N')
    dot.edge('Product', 'OrderItem', '1:N')
    
    dot.edge('ServiceType', 'ServiceRequest', '1:N')
    
    dot.edge('Order', 'Payment', '1:1')
    
    # 保存
    output_path = '/root/.openclaw/workspace/docs/database-er-diagram'
    dot.render(output_path, format='png', cleanup=True)
    print(f'ER 图已保存至：{output_path}.png')
    return f'{output_path}.png'

if __name__ == '__main__':
    try:
        create_er_diagram()
    except Exception as e:
        print(f'生成失败：{e}')
        print('请安装 graphviz: apt-get install graphviz 或 brew install graphviz')
