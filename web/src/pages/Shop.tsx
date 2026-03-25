import React, { useState, useEffect } from 'react';
import {
  NavBar,
  Grid,
  Card,
  Button,
  Tag,
  Space,
  Toast,
  SearchBar,
  Tabs,
  Badge,
} from 'antd-mobile';
import {
  AddOutline,
  MinusOutline,
} from 'antd-mobile-icons';
import { productApi, orderApi } from '../services/api';
import { useAuthStore } from '../store/auth';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: string;
  stock: number;
}

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: '饮品', label: '饮品' },
  { key: '零食', label: '零食' },
  { key: '日用品', label: '日用品' },
];

const Shop: React.FC = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    productApi.list(cat).then((res: any) => {
      setProducts(Array.isArray(res) ? res : (res.data || []));
    }).catch(() => {});
  }, [user?.hotelId, selectedCategory]);

  const cartCount = Object.values(quantities).reduce((a, b) => a + b, 0);
  const cartTotal = products.reduce((sum, p) => sum + (quantities[p.id] || 0) * p.price, 0);

  const handleAdd = (product: Product) => {
    setQuantities((prev) => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
  };

  const handleMinus = (product: Product) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if ((next[product.id] || 0) <= 1) delete next[product.id];
      else next[product.id]--;
      return next;
    });
  };

  const handleCheckout = async () => {
    if (!user?.hotelId || !user?.roomId) {
      Toast.show({ content: '请先登录并分配房间', position: 'top' });
      return;
    }
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({ productId: parseInt(id), quantity }));
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await orderApi.create({ items });
      setQuantities({});
      Toast.show({ content: '下单成功！', position: 'top', icon: 'success' });
    } catch (e: any) {
      Toast.show({ content: e.message || '下单失败', position: 'top', icon: 'fail' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar back={null}>酒店商城</NavBar>

      <Tabs
        activeKey={selectedCategory}
        onChange={setSelectedCategory}
        style={{ background: '#fff', borderBottom: '1px solid #eee' }}
      >
        {CATEGORIES.map((c) => (
          <Tabs.Tab key={c.key} title={c.label} />
        ))}
      </Tabs>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>暂无商品</div>
        ) : (
          <Grid columns={2} gap={12}>
            {products.map((product) => (
              <Grid.Item key={product.id}>
                <Card
                  style={{ height: '100%' }}
                  bodyStyle={{ padding: '8px' }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100px',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                      marginBottom: '8px',
                    }}
                  >
                    🛍️
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>
                    {product.description}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{product.price}</span>
                      {product.originalPrice && (
                        <span style={{ color: '#999', fontSize: '11px', textDecoration: 'line-through', marginLeft: '4px' }}>
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    {quantities[product.id] ? (
                      <Space align="center">
                        <Button size="mini" fill="outline" onClick={() => handleMinus(product)}>
                          <MinusOutline />
                        </Button>
                        <span style={{ minWidth: '20px', textAlign: 'center' }}>{quantities[product.id]}</span>
                        <Button size="mini" color="primary" onClick={() => handleAdd(product)}>
                          <AddOutline />
                        </Button>
                      </Space>
                    ) : (
                      <Button color="primary" size="small" block onClick={() => handleAdd(product)}>
                        <AddOutline style={{ marginRight: '4px' }} />
                        加入购物车
                      </Button>
                    )}
                  </div>
                </Card>
              </Grid.Item>
            ))}
          </Grid>
        )}
      </div>

      {cartCount > 0 && (
        <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee' }}>
          <Space justify="between" align="center" style={{ width: '100%' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>购物车 {cartCount} 件</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>¥{cartTotal.toFixed(2)}</div>
            </div>
            <Button color="primary" size="large" loading={submitting} onClick={handleCheckout}>
              去结算
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default Shop;
