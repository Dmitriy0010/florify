import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  RefreshCw,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { format, addDays, isSameDay, startOfToday, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ordersApi } from '../lib/ordersApi';
import { useAuthStore } from '../store/authStore';
import type { OrderStatus } from '../lib/types';

/* ─── constants ─── */
const OPTS = { refetchInterval: 30_000, staleTime: 15_000 };

const COLUMNS: { id: string; name: string; colorClass: string }[] = [
  { id: 'CONFIRMED',       name: 'НОВЫЕ',        colorClass: 'col-header-new'      },
  { id: 'READY',           name: 'СОБРАНЫ',       colorClass: 'col-header-ready'    },
  { id: 'OUT_FOR_DELIVERY',name: 'У КУРЬЕРА',     colorClass: 'col-header-delivery' },
  { id: 'COMPLETED',       name: 'ЗАВЕРШЁННЫЕ',   colorClass: 'col-header-done'     },
];

const DAY_ABBR: Record<string, string> = {
  пн: 'ПНД', вт: 'ВТР', ср: 'СРД', чт: 'ЧТВ', пт: 'ПТН', сб: 'СУБ', вс: 'ВСК',
};

/* ─── helpers ─── */
function fmt(d: Date) { return format(d, 'eeeeee', { locale: ru }).toLowerCase(); }

/* ─────────────────────────
   ORDER CARD
   ───────────────────────── */
function OrderCard({ order, myId }: { order: any; myId: string | null }) {
  const timeStr   = order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : '--:--';
  const priceStr  = order.finalAmount ? `${order.finalAmount.toLocaleString('ru-RU')} ₽` : '0 ₽';
  const orderNum  = order.orderNumber || (order.orderId ? `D-${order.orderId.substring(0, 6)}` : '001000');
  const isMyOrder = myId && order.assignedFloristId === myId;

  return (
    <Link
      to={`/orders/${order.id}`}
      style={{
        display: 'block',
        background: 'white',
        border: `1px solid var(--color-border)`,
        borderLeft: isMyOrder ? '3px solid var(--color-brand)' : undefined,
        borderRadius: 8,
        padding: '10px 12px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.15s',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Time */}
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        {timeStr}
      </div>

      {/* Customer */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 4 }}>
        {order.customerName || 'Клиент'}
      </div>

      {/* Items preview */}
      {order.items && order.items.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 3, lineHeight: 1.3 }}>
          {order.items.slice(0, 2).map((it: any) => `${it.productName ?? it.name} × ${it.quantity}`).join(', ')}
          {order.items.length > 2 && ` +${order.items.length - 2}`}
        </div>
      )}

      {/* Price + ID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {priceStr}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}>
          #{orderNum}
        </span>
      </div>
    </Link>
  );
}

/* ─────────────────────────
   KANBAN VIEW (3 live columns)
   ───────────────────────── */
function KanbanView() {
  const qc = useQueryClient();
  const { userId } = useAuthStore();

  const queries = {
    confirmed:   useQuery({ queryKey: ['kanban', 'CONFIRMED'],        queryFn: () => ordersApi.getKanban('CONFIRMED'  as OrderStatus, 50), ...OPTS }),
    inProgress:  useQuery({ queryKey: ['kanban', 'IN_PROGRESS'],      queryFn: () => ordersApi.getKanban('IN_PROGRESS' as OrderStatus, 50), ...OPTS }),
    ready:       useQuery({ queryKey: ['kanban', 'READY'],            queryFn: () => ordersApi.getKanban('READY'       as OrderStatus, 50), ...OPTS }),
    delivery:    useQuery({ queryKey: ['kanban', 'OUT_FOR_DELIVERY'], queryFn: () => ordersApi.getKanban('OUT_FOR_DELIVERY' as OrderStatus, 50), ...OPTS }),
  };

  const takeMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: string }) =>
      ordersApi.updateStatus(orderId, { status: 'IN_PROGRESS' as OrderStatus, floristId: userId ?? undefined }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['kanban'] }),
  });

  const readyMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: string }) =>
      ordersApi.updateStatus(orderId, { status: 'READY' as OrderStatus }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['kanban'] }),
  });

  const KANBAN_COLS = [
    { key: 'confirmed',  label: 'НОВЫЕ',        data: queries.confirmed.data  ?? [], color: 'var(--color-status-new)',      actionLabel: 'Взять',  action: (id: string) => takeMutation.mutate({ orderId: id }) },
    { key: 'inProgress', label: 'СОБИРАЮ',      data: queries.inProgress.data ?? [], color: 'var(--color-status-progress)', actionLabel: 'Готово', action: (id: string) => readyMutation.mutate({ orderId: id }) },
    { key: 'ready',      label: 'ГОТОВО',        data: queries.ready.data      ?? [], color: 'var(--color-status-ready)',    actionLabel: null,     action: null },
    { key: 'delivery',   label: 'У КУРЬЕРА',     data: queries.delivery.data   ?? [], color: 'var(--color-status-delivery)', actionLabel: null,     action: null },
  ];

  const isLoading = Object.values(queries).some(q => q.isLoading);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flex: 1, minHeight: 0 }}>
      {KANBAN_COLS.map(col => (
        <div key={col.key} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 12, overflow: 'hidden', background: '#FAFAFA', border: '1px solid var(--color-border)' }}>
          {/* Column header */}
          <div style={{
            background: col.color,
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {col.label}
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.25)',
              color: 'white',
              borderRadius: 6,
              padding: '1px 7px',
              fontSize: 11,
              fontWeight: 800,
            }}>
              {col.data.length}
            </span>
          </div>

          {/* Cards */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}
               className="no-scrollbar">
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32, opacity: 0.3 }}>
                <RefreshCw size={22} className="spin" />
              </div>
            ) : col.data.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', opacity: 0.15, gap: 8 }}>
                <Package size={28} strokeWidth={1.5} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Пусто</span>
              </div>
            ) : col.data.map((order: any) => (
              <div key={order.id}>
                <OrderCard order={order} myId={userId} />
                {col.actionLabel && col.action && (
                  <button
                    onClick={() => col.action!(order.id)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '6px 0',
                      background: col.color,
                      color: 'white',
                      border: 0,
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {col.actionLabel} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────
   CALENDAR VIEW (day filter)
   ───────────────────────── */
function CalendarView({ allOrders, isLoading }: { allOrders: any[]; isLoading: boolean }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  const weekStart = useMemo(() => {
    const monday = startOfWeek(startOfToday(), { weekStartsOn: 1 });
    return addDays(monday, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const selectedDay = weekDays[selectedDayIdx] ?? weekDays[0];

  const getForDayStatus = (day: Date, status: string) =>
    allOrders.filter(o => {
      if (status === 'CONFIRMED') {
        if (o.status !== 'CONFIRMED' && o.status !== 'IN_PROGRESS') return false;
      } else if (o.status !== status) return false;
      return isSameDay(new Date(o.createdAt || Date.now()), day);
    });

  return (
    <>
      {/* Date strip */}
      <div style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        <button onClick={() => setWeekOffset(w => w - 1)}
                style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
          <ChevronLeft size={18} />
        </button>

        <div style={{ flex: 1, display: 'flex', overflowX: 'auto' }} className="no-scrollbar">
          {weekDays.map((day, idx) => {
            const isSelected = idx === selectedDayIdx;
            const isToday = isSameDay(day, new Date());
            const abbr = DAY_ABBR[fmt(day)] ?? fmt(day).toUpperCase();
            const dayNum = format(day, 'd');
            // Count orders for this day
            const cnt = allOrders.filter(o => isSameDay(new Date(o.createdAt || 0), day)).length;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDayIdx(idx)}
                style={{
                  flex: 1,
                  minWidth: 90,
                  height: 52,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  border: 0,
                  borderBottom: isSelected ? '2px solid var(--color-status-new)' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.45,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isSelected ? 'var(--color-status-new)' : 'var(--color-text-secondary)',
                }}>
                  {abbr} {dayNum}{isToday ? ' •' : cnt > 0 ? ` ·${cnt}` : ''}
                </span>
              </button>
            );
          })}
        </div>

        <button onClick={() => setWeekOffset(w => w + 1)}
                style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Kanban columns for selected day */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flex: 1, minHeight: 0 }}>
        {COLUMNS.map(col => {
          const dayOrders = getForDayStatus(selectedDay, col.id);
          return (
            <div key={col.id} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 12, overflow: 'hidden', background: '#FAFAFA', border: '1px solid var(--color-border)' }}>
              <div className={col.colorClass} style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.12em' }}>{col.name}</span>
                <span style={{ background: 'rgba(255,255,255,0.25)', color: 'white', borderRadius: 6, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
                  {dayOrders.length}
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }} className="no-scrollbar">
                {isLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32, opacity: 0.3 }}>
                    <RefreshCw size={22} className="spin" />
                  </div>
                ) : dayOrders.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', opacity: 0.15, gap: 8 }}>
                    <Package size={28} strokeWidth={1.5} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Пусто</span>
                  </div>
                ) : dayOrders.map(order => (
                  <OrderCard key={order.id} order={order} myId={null} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─────────────────────────
   PAGE ROOT
   ───────────────────────── */
export default function KanbanPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'calendar' | 'kanban'>('calendar');

  // For calendar view — fetch all statuses
  const { data: allOrdersData = [], isLoading } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      const statuses: OrderStatus[] = ['CONFIRMED', 'IN_PROGRESS', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED'];
      const results = await Promise.all(statuses.map(s => ordersApi.getKanban(s, 100)));
      return results.flat();
    },
    enabled: view === 'calendar',
    ...OPTS,
  });

  const allOrders = Array.isArray(allOrdersData) ? allOrdersData : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'hidden' }}
         className="fade-in">

      {/* ── PAGE HEADER ── */}
      <div style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--color-text-primary)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
          }}>
            <ClipboardList size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Календарь заказов
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)' }} className="pulse" />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Центральный филиал • Активно
              </span>
            </div>
          </div>
        </div>

        {/* Right: view switcher + quick nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Quick goto POS */}
          <button
            onClick={() => navigate('/pos')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'white', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
              transition: 'all 0.15s',
            }}>
            Терминал <ArrowRight size={14} />
          </button>

          {/* View switcher */}
          <div style={{
            background: 'var(--color-bg-sunken)',
            borderRadius: 10,
            padding: 4,
            display: 'flex',
            border: '1px solid var(--color-border)',
          }}>
            {(['calendar', 'kanban'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  border: 0,
                  transition: 'all 0.15s',
                  background: view === v ? 'white' : 'transparent',
                  color: view === v ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
                }}>
                {v === 'calendar' ? 'Календарь' : 'Канбан'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── VIEW CONTENT ── */}
      {view === 'calendar'
        ? <CalendarView allOrders={allOrders} isLoading={isLoading} />
        : <KanbanView />
      }
    </div>
  );
}

