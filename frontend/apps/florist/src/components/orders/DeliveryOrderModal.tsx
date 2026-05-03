import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Truck,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { cn, getMediaUrl } from '../../lib/utils';
import { customerApi } from '../../lib/customerApi';
import { catalogApi } from '../../lib/catalogApi';
import { deliveryApi } from '../../lib/deliveryApi';
import { ordersApi } from '../../lib/ordersApi';
import { useStoreStore } from '../../store/useStoreStore';
import { toast } from 'sonner';

interface DeliveryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'CUSTOMER' | 'ITEMS' | 'DELIVERY' | 'SUMMARY';

export default function DeliveryOrderModal({ isOpen, onClose }: DeliveryOrderModalProps) {
  const qc = useQueryClient();
  const { storeId } = useStoreStore();
  const [step, setStep] = useState<Step>('CUSTOMER');
  
  // State for the order
  const [customer, setCustomer] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [basket, setBasket] = useState<any[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [comment, setComment] = useState('');
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Queries
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: () => customerApi.search(customerSearch),
    enabled: customerSearch.length > 2,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'search', productSearch],
    queryFn: () => catalogApi.getProducts({ size: 20 }), // Simplified for now
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['delivery', 'slots'],
    queryFn: () => deliveryApi.getSlots(),
  });

  // Basket logic
  const addToBasket = (product: any) => {
    setBasket(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        productName: product.name, 
        quantity: 1, 
        unitPrice: product.currentPrice,
        imageUrl: product.imageUrl
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setBasket(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromBasket = (productId: string) => {
    setBasket(prev => prev.filter(item => item.productId !== productId));
  };

  const totalAmount = basket.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error('Store not selected');
      return ordersApi.createOrder({
        storeId,
        customerId: customer?.id,
        guestName: customer ? undefined : guestName,
        guestPhone: customer ? undefined : guestPhone,
        type: 'DELIVERY',
        source: 'POS',
        paymentMethod: 'CASH_ON_DELIVERY', // Default for phone orders
        deliveryAddress,
        deliverySlotId: selectedSlot?.id,
        comment,
        items: basket.map(it => ({
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          lineTotal: it.unitPrice * it.quantity
        })),
        status: 'CONFIRMED'
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kanban'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Заказ успешно создан');
      onClose();
      resetForm();
    },
    onError: (err: any) => {
      toast.error('Ошибка при создании заказа: ' + err.message);
    }
  });

  const resetForm = () => {
    setStep('CUSTOMER');
    setCustomer(null);
    setGuestName('');
    setGuestPhone('');
    setBasket([]);
    setDeliveryAddress('');
    setSelectedSlot(null);
    setComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: 700, 
        height: '90vh', 
        maxHeight: 800,
        display: 'flex', 
        flexDirection: 'column', 
        padding: 0,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--color-brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Truck size={18} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>Новый заказ доставки</h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ opacity: 0.5 }}><X size={20} /></button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', padding: '12px 24px', gap: 4, background: 'var(--color-bg-sunken)' }}>
          {['CUSTOMER', 'ITEMS', 'DELIVERY', 'SUMMARY'].map((s, i) => {
            const steps: Step[] = ['CUSTOMER', 'ITEMS', 'DELIVERY', 'SUMMARY'];
            const active = steps.indexOf(step) >= i;
            return (
              <div key={s} style={{ 
                flex: 1, 
                height: 4, 
                borderRadius: 2, 
                background: active ? 'var(--color-brand)' : 'var(--color-border)',
                transition: 'all 0.3s'
              }} />
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="custom-scrollbar">
          
          {/* STEP 1: CUSTOMER */}
          {step === 'CUSTOMER' && (
            <div className="fade-in">
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: 'var(--color-text-secondary)' }}>ШАГ 1: КЛИЕНТ</h3>
              
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder="Поиск по имени или телефону..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  style={{
                    width: '100%',
                    height: 52,
                    padding: '0 16px 0 46px',
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              {customersLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Loader2 size={24} className="spin" /></div>}
              
              {customerSearch.length > 2 && !customersLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                  {customers.map((c: any) => (
                    <button 
                      key={c.id} 
                      onClick={() => { setCustomer(c); setStep('ITEMS'); }}
                      className="glass-card" 
                      style={{ 
                        padding: 16, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: customer?.id === c.id ? '2px solid var(--color-brand)' : '1px solid var(--color-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-bg-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 800 }}>{c.firstName} {c.lastName}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{c.phone}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                  {customers.length === 0 && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-tertiary)', padding: 20 }}>Клиенты не найдены</p>}
                </div>
              )}

              <div className="card" style={{ padding: 24, background: 'var(--color-bg-sunken)', borderStyle: 'dashed' }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>ИЛИ ГРЕВШИЙ ЗАКАЗ (БЕЗ РЕГИСТРАЦИИ)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group">
                    <label>Имя получателя</label>
                    <input 
                      type="text" 
                      placeholder="Иван"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Телефон для связи</label>
                    <input 
                      type="tel" 
                      placeholder="+7 (999) 000-00-00"
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ITEMS */}
          {step === 'ITEMS' && (
            <div className="fade-in">
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: 'var(--color-text-secondary)' }}>ШАГ 2: ВЫБОР ТОВАРОВ</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Product Search */}
                <div>
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    <input 
                      type="text" 
                      placeholder="Поиск товара..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      style={{ width: '100%', height: 44, padding: '0 12px 0 38px', borderRadius: 10, border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }} className="no-scrollbar">
                    {products.map((p: any) => (
                      <div key={p.id} className="glass-card" style={{ padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img src={p.imageUrl || '/placeholder.png'} style={{ width: 44, height: 44, borderRadius: 8, objectCover: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2 }}>{p.name}</p>
                          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-brand)' }}>{p.currentPrice} ₽</p>
                        </div>
                        <button onClick={() => addToBasket(p)} className="btn-icon" style={{ background: 'var(--color-brand)', color: 'white' }}>
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Basket Preview */}
                <div style={{ background: 'var(--color-bg-sunken)', borderRadius: 16, padding: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBasket size={14} /> КОРЗИНА
                  </h4>
                  {basket.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, opacity: 0.3 }}>
                      <Package size={32} style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 11, fontWeight: 700 }}>Пусто</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {basket.map(item => (
                        <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, fontWeight: 700 }}>{item.productName}</p>
                            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{item.unitPrice} ₽</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button onClick={() => updateQuantity(item.productId, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-border)', background: 'white' }}>-</button>
                            <span style={{ fontSize: 12, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-border)', background: 'white' }}>+</button>
                          </div>
                          <button onClick={() => removeFromBasket(item.productId)} style={{ color: 'var(--color-status-danger)', opacity: 0.5 }}><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>ИТОГО</span>
                        <span style={{ fontSize: 16, fontWeight: 900 }}>{totalAmount.toLocaleString()} ₽</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DELIVERY */}
          {step === 'DELIVERY' && (
            <div className="fade-in">
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: 'var(--color-text-secondary)' }}>ШАГ 3: ДЕТАЛИ ДОСТАВКИ</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="form-group">
                  <label><MapPin size={14} /> Адрес доставки</label>
                  <textarea 
                    placeholder="Город, улица, дом, квартира, подъезд, этаж..."
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="form-control"
                    style={{ height: 80, resize: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 800 }}>
                    <Clock size={14} /> ВРЕМЯ ДОСТАВКИ
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {slots.map((slot: any) => (
                      <button 
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '12px',
                          borderRadius: 12,
                          border: selectedSlot?.id === slot.id ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                          background: selectedSlot?.id === slot.id ? 'white' : 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 800 }}>{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</p>
                        <p style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Свободно: {slot.remainingCapacity}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Комментарий курьеру</label>
                  <input 
                    type="text" 
                    placeholder="Домофон не работает, позвонить..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 'SUMMARY' && (
            <div className="fade-in">
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: 'var(--color-text-secondary)' }}>ШАГ 4: ПОДТВЕРЖДЕНИЕ</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Клиент</p>
                      <p style={{ fontSize: 15, fontWeight: 800 }}>{customer ? `${customer.firstName} ${customer.lastName}` : guestName}</p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{customer ? customer.phone : guestPhone}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>К оплате</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-brand)' }}>{totalAmount.toLocaleString()} ₽</p>
                    </div>
                  </div>

                  <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 12 }}>
                    <MapPin size={18} style={{ color: 'var(--color-brand)', marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Адрес</p>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{deliveryAddress}</p>
                    </div>
                  </div>

                  <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 12 }}>
                    <Clock size={18} style={{ color: 'var(--color-brand)', marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Время</p>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>Сегодня, {selectedSlot ? `${selectedSlot.startTime.substring(0, 5)} - ${selectedSlot.endTime.substring(0, 5)}` : 'Как можно скорее'}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 16, background: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <AlertTriangle size={18} style={{ color: '#D97706', shrink: 0 }} />
                    <p style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                      Заказ будет создан в статусе <b>ПОДТВЕРЖДЁН</b>. Оплата наличными при получении. 
                      После создания он сразу появится на доске заказов.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', background: 'white' }}>
          <button 
            onClick={() => {
              if (step === 'CUSTOMER') onClose();
              else if (step === 'ITEMS') setStep('CUSTOMER');
              else if (step === 'DELIVERY') setStep('ITEMS');
              else if (step === 'SUMMARY') setStep('DELIVERY');
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <ChevronLeft size={16} /> Назад
          </button>

          {step !== 'SUMMARY' ? (
            <button 
              disabled={
                (step === 'CUSTOMER' && !customer && (!guestName || !guestPhone)) ||
                (step === 'ITEMS' && basket.length === 0) ||
                (step === 'DELIVERY' && (!deliveryAddress || !selectedSlot))
              }
              onClick={() => {
                if (step === 'CUSTOMER') setStep('ITEMS');
                else if (step === 'ITEMS') setStep('DELIVERY');
                else if (step === 'DELIVERY') setStep('SUMMARY');
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-brand)', color: 'white', border: 0 }}
            >
              Далее <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              onClick={() => createOrderMutation.mutate()}
              disabled={createOrderMutation.isPending}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10B981', color: 'white', border: 0, padding: '0 32px' }}
            >
              {createOrderMutation.isPending ? <Loader2 size={18} className="spin" /> : <CheckCircle2 size={18} />}
              Создать заказ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Add these styles if they are not in globals.css
const styles = `
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;
