import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DashboardOverview,
  RecentActivityItem,
  RevenuePoint,
  ServiceUsagePoint,
  fetchAdminDashboard
} from '../api/dashboardApi';

const MONTHS_IN_YEAR = 12;
const DONUT_SIZE = 220;
const DONUT_OUTER_RADIUS = 90;
const DONUT_INNER_RADIUS = 60;
const DONUT_CENTER = DONUT_SIZE / 2;
const DONUT_TRACK_RADIUS = (DONUT_OUTER_RADIUS + DONUT_INNER_RADIUS) / 2;
const DONUT_TRACK_STROKE = DONUT_OUTER_RADIUS - DONUT_INNER_RADIUS;
const REVENUE_TICK_VALUES = [50, 40, 30, 20, 10];
const RECENT_ACTIVITY_LIMIT = 5;
const DASHBOARD_REFRESH_INTERVAL_MS = 3_000; // Poll frequently so newest bookings surface instantly
const RELATIVE_TIME_TICK_MS = 60_000;

const numberFormatter = new Intl.NumberFormat('vi-VN');
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});
const millionFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1
});

const usageColors: Record<string, string> = {
  hot_desk: '#1C1C1C',
  fixed_desk: '#73C08D',
  meeting_room: '#F7B267',
  networking: '#5BA4E6',
  private_office: '#9F8CFF'
};

const DEFAULT_USAGE_SERIES: ServiceUsagePoint[] = [
  { code: 'hot_desk', label: 'Hot Desk', bookings: 0, percentage: 0 },
  { code: 'fixed_desk', label: 'Fixed Desk', bookings: 0, percentage: 0 },
  { code: 'meeting_room', label: 'Meeting Room', bookings: 0, percentage: 0 },
  { code: 'networking', label: 'Networking Space', bookings: 0, percentage: 0 },
  { code: 'private_office', label: 'Private Office', bookings: 0, percentage: 0 }
];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, endInner.x, endInner.y,
    'Z'
  ].join(' ');
}

function formatNumber(value?: number) {
  return numberFormatter.format(value ?? 0);
}

function formatCurrency(value?: number) {
  return currencyFormatter.format(value ?? 0);
}

function formatMillions(value?: number) {
  return `${millionFormatter.format(value ?? 0)}`;
}

function formatRelativeTime(iso?: string | null, nowMs: number = Date.now()) {
  if (!iso) return 'Just now';
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return 'Just now';
  const diffMs = nowMs - target;
  if (diffMs < 60000) return 'Just now';
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function buildEmptyRevenueSeries(length = MONTHS_IN_YEAR): RevenuePoint[] {
  const now = new Date();
  return Array.from({ length }).map((_, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (length - 1 - idx), 1);
    const month = date.getMonth() + 1;
    return {
      month,
      year: date.getFullYear(),
      label: String(month),
      total: 0,
      monthStart: date.toISOString()
    };
  });
}

function ActivitySkeleton({ lines }: { lines: number }) {
  return (
    <>
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="bg-neutral-100 rounded-[15px] px-6 py-4 border border-[rgba(0,0,0,0.2)] animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2 w-2/3">
              <div className="h-3 bg-neutral-300 rounded" />
              <div className="h-3 bg-neutral-300 rounded w-4/5" />
            </div>
            <div className="h-3 bg-neutral-300 rounded w-20" />
          </div>
        </div>
      ))}
    </>
  );
}

function toEpoch(value?: string | null) {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function sortActivities(items: RecentActivityItem[], limit: number) {
  return [...items]
    .sort((a, b) => toEpoch(b.occurredAt) - toEpoch(a.occurredAt))
    .slice(0, limit);
}

export default function DashboardContent() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());
  const [activityFeed, setActivityFeed] = useState<RecentActivityItem[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshDashboard = useCallback(async (withLoading = false) => {
    if (withLoading) setLoading(true);
    try {
      const data = await fetchAdminDashboard({ months: MONTHS_IN_YEAR, activityLimit: RECENT_ACTIVITY_LIMIT });
      if (!isMountedRef.current) return;
      setOverview(data);
      setActivityFeed(sortActivities(data.recentActivity ?? [], RECENT_ACTIVITY_LIMIT));
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      const errorObj = err as any;
      console.error('dashboard.load', errorObj);
      const message = errorObj?.response?.data?.error || 'Unable to load dashboard data';
      setError(message);
    } finally {
      if (withLoading && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refreshDashboard(true);
    const intervalId = window.setInterval(() => {
      refreshDashboard();
    }, DASHBOARD_REFRESH_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshDashboard]);

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, RELATIVE_TIME_TICK_MS);
    return () => {
      window.clearInterval(tickId);
    };
  }, []);

  const stats = overview?.stats;
  const revenueSeries = (overview?.revenueByMonth?.length ? overview.revenueByMonth : buildEmptyRevenueSeries()).slice(-MONTHS_IN_YEAR);
  const usageSeries = overview?.serviceUsage?.length ? overview.serviceUsage : DEFAULT_USAGE_SERIES;
  const activityItems = activityFeed;

  const statCards = [
    {
      key: 'packages',
      title: 'Total Service Packages',
      value: stats?.totalServicePackages,
      formatter: formatNumber,
      icon: (
        <div className="w-[56px] h-[56px] bg-blue-100 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )
    },
    {
      key: 'reserved',
      title: 'Reserved Seats',
      value: stats?.reservedSeats,
      formatter: formatNumber,
      icon: (
        <div className="w-[56px] h-[56px] bg-green-100 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )
    },
    {
      key: 'users',
      title: 'Total Users',
      value: stats?.totalUsers,
      formatter: formatNumber,
      icon: (
        <div className="w-[56px] h-[56px] bg-gray-200 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      )
    },
    {
      key: 'revenue',
      title: 'Monthly Revenue',
      value: stats?.monthlyRevenue,
      formatter: formatCurrency,
      icon: (
        <div className="w-[56px] h-[56px] bg-yellow-100 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-full">
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">

        {statCards.map((card) => {
          const hasValue = card.value !== undefined && card.value !== null;
          const displayValue = hasValue ? card.formatter(card.value as number) : loading ? '…' : card.formatter(0);
          return (
            <div
              key={card.key}
              className="bg-white rounded-[20px] p-5 border border-[#1c1c1c] shadow-[0px_4px_4px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-center gap-4">
                {card.icon}
                <div>
                  <p className="text-[16px] text-[#021526] mb-2 capitalize">{card.title}</p>
                  <p className="text-[24px] font-bold text-[#021526] min-h-[32px]">{displayValue}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">

        <RevenueLineChart data={revenueSeries} loading={loading} />
        <ServiceUsageDonut data={usageSeries} loading={loading} />
      </div>

      <div className="bg-white rounded-[20px] p-6 border border-[rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-[16px] font-semibold text-[#021526]">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {loading && !activityItems.length && <ActivitySkeleton lines={3} />}
          {!loading && !activityItems.length && (
            <p className="text-sm text-gray-500">No activity yet.</p>
          )}
          {activityItems.map((activity) => (
            <RecentActivityCard key={activity.id} activity={activity} currentTime={currentTime} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueLineChart({ data, loading }: { data: RevenuePoint[]; loading: boolean }) {
  const chartLayout = { width: 620, height: 260, padding: { top: 25, right: 24, bottom: 45, left: 80 } };
  const points = useMemo(() => {
    const series = data.length ? data : buildEmptyRevenueSeries();
    return series.map((point) => ({
      ...point,
      million: Number((point.total / 1_000_000).toFixed(2))
    }));
  }, [data]);

  const axisMax = REVENUE_TICK_VALUES[0] || 1;
  const yTicks = REVENUE_TICK_VALUES;
  const innerWidth = chartLayout.width - chartLayout.padding.left - chartLayout.padding.right;
  const innerHeight = chartLayout.height - chartLayout.padding.top - chartLayout.padding.bottom;
  const denominator = Math.max(points.length - 1, 1);

  const coordinates = points.map((point, index) => {
    const normalizedValue = Math.min(point.million, axisMax);
    const x = chartLayout.padding.left + (index / denominator) * innerWidth;
    const y = chartLayout.padding.top + (1 - normalizedValue / axisMax) * innerHeight;
    return { ...point, x, y };
  });

  const pathD = coordinates.reduce((acc, point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return acc;
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaPath = coordinates.length
    ? `${pathD} L ${coordinates.at(-1)?.x ?? chartLayout.padding.left} ${chartLayout.height - chartLayout.padding.bottom} L ${coordinates[0]?.x ?? chartLayout.padding.left} ${chartLayout.height - chartLayout.padding.bottom} Z`
    : '';

  return (
    <div className="bg-white rounded-[16px] p-6 border border-[rgba(0,0,0,0.45)] shadow-[0px_4px_4px_rgba(0,0,0,0.15)]">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-[#1c1c1c]">Revenue by Month</h3>
        <p className="text-xs uppercase tracking-[2px] text-gray-500">Million (VND)</p>
      </div>
      <svg viewBox={`0 0 ${chartLayout.width} ${chartLayout.height}`} className="w-full">
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5DA07F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5DA07F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((tick, idx) => {
          const y = chartLayout.padding.top + (1 - tick / (yTicks[0] || 1)) * innerHeight;
          return (
            <g key={idx}>
              <line
                x1={chartLayout.padding.left}
                y1={y}
                x2={chartLayout.width - chartLayout.padding.right}
                y2={y}
                stroke="rgba(28,28,28,0.08)"
                strokeWidth={1}
              />
              <text x={chartLayout.padding.left - 10} y={y + 4} textAnchor="end" className="fill-gray-500 text-[12px]">
                {formatMillions(tick)}
              </text>
            </g>
          );
        })}
        <text
          x={20}
          y={chartLayout.height / 2}
          transform={`rotate(-90 20 ${chartLayout.height / 2})`}
          className="fill-gray-400 text-[11px] tracking-[1px]"
        >
          Million (VND)
        </text>
        <text
          x={chartLayout.width / 2}
          y={chartLayout.height - 10}
          textAnchor="middle"
          className="fill-gray-400 text-[11px]"
        >
          Months of the Year
        </text>
        {areaPath && <path d={areaPath} fill="url(#revenueFill)" stroke="none" />}
        {pathD && <path d={pathD} fill="none" stroke="#5DA07F" strokeWidth={3} strokeLinecap="round" />}
        {coordinates.map((point) => (
          <g key={`${point.year}-${point.month}`}>
            <circle cx={point.x} cy={point.y} r={5} fill="#ffffff" stroke="#5DA07F" strokeWidth={2} />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="fill-[#021526] text-[11px] font-semibold">
              {formatMillions(point.million)}
            </text>
          </g>
        ))}
        {coordinates.map((point) => (
          <text
            key={`month-${point.year}-${point.month}`}
            x={point.x}
            y={chartLayout.height - chartLayout.padding.bottom + 20}
            textAnchor="middle"
            className="fill-gray-500 text-[12px]"
          >
            {point.month}
          </text>
        ))}
      </svg>
      {loading && (
        <p className="text-xs text-gray-400 mt-2">Loading data...</p>
      )}
    </div>
  );
}

function ServiceUsageDonut({ data, loading }: { data: ServiceUsagePoint[]; loading: boolean }) {
  const series = data.length ? data : DEFAULT_USAGE_SERIES;
  const totalBookings = series.reduce((sum, item) => sum + item.bookings, 0);
  const hasUsageData = totalBookings > 0;

  let currentAngle = -90;
  const donutSegments = hasUsageData
    ? series
        .map((item) => {
          if (item.bookings <= 0) return null;
          const ratio = item.bookings / totalBookings;
          const sweep = ratio * 360;
          const path = describeDonutSegment(
            DONUT_CENTER,
            DONUT_CENTER,
            DONUT_INNER_RADIUS,
            DONUT_OUTER_RADIUS,
            currentAngle,
            currentAngle + sweep
          );
          currentAngle += sweep;
          return {
            ...item,
            path
          };
        })
        .filter(Boolean) as Array<ServiceUsagePoint & { path: string }>
    : [];

  return (
    <div className="bg-white rounded-[14px] p-6 border border-[rgba(0,0,0,0.45)] shadow-[0px_4px_4px_rgba(0,0,0,0.15)]">
      <h3 className="text-[14px] font-semibold text-[#1c1c1c] text-center mb-6">
        Service Package Usage Rate
      </h3>
      <div className="flex flex-row items-center justify-between gap-6 px-4">

        <div className="relative" style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
          <svg viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} aria-hidden="true">
            <defs>
              <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="rgba(28,28,28,0.15)" />
              </filter>
            </defs>
            <circle
              cx={DONUT_CENTER}
              cy={DONUT_CENTER}
              r={DONUT_TRACK_RADIUS}
              fill="none"
              stroke="#E8EDF3"
              strokeWidth={DONUT_TRACK_STROKE}
            />
            {hasUsageData &&
              donutSegments.map((segment) => (
                <path
                  key={segment.code}
                  d={segment.path}
                  fill={usageColors[segment.code] || '#CBD5F5'}
                  filter="url(#donutShadow)"
                />
              ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[2px] text-gray-400">Total</p>
            <p className="text-2xl font-semibold text-[#021526]">{formatNumber(totalBookings)}</p>
            <p className="text-xs text-gray-500">bookings</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 w-full">
          {series.map((item) => (
            <div key={item.code} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: usageColors[item.code] || '#CBD5F5' }}
                />
                <div>
                  <p className="text-[12px] text-[#1c1c1c] font-semibold">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{formatNumber(item.bookings)} bookings</p>
                </div>
              </div>
              <span className="text-[12px] text-[#1c1c1c] font-semibold">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
      {loading && (
        <p className="text-xs text-gray-400 mt-4">Loading data...</p>
      )}
    </div>
  );
}

function RecentActivityCard({ activity, currentTime }: { activity: RecentActivityItem; currentTime: number }) {
  const actionDetail = `${activity.actionLabel}${activity.packageName ? ` · ${activity.packageName}` : ''}`;
  return (
    <div className="bg-neutral-100 rounded-[15px] px-6 py-4 border border-[rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold text-black mb-1 tracking-wide">
            {activity.userName}
          </p>
          <p className="text-[14px] text-black/70 tracking-wide">
            {actionDetail}
          </p>
        </div>
        <span className="text-[13px] text-black/70">
          {formatRelativeTime(activity.occurredAt, currentTime)}
        </span>
      </div>
    </div>
  );
}
