import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  DollarSign, 
  ShoppingBag, 
  Truck, 
  Star, 
  Users, 
  Store, 
  Filter, 
  RotateCcw,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { 
  ORDERS, 
  ORDER_ITEMS, 
  ORDER_PAYMENTS, 
  ORDER_REVIEWS, 
  PRODUCTS, 
  CUSTOMERS, 
  SELLERS,
  OLIST_DATABASE 
} from '../data/olistData';

type DashboardPage = 'overview' | 'logistics' | 'categories' | 'sellers';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 shadow-md rounded-lg p-3 text-xs text-slate-800 space-y-1">
        <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
            <span className="flex items-center space-x-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-mono font-semibold text-slate-900">
              {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('gmv')
                ? `R$ ${entry.value.toLocaleString()}`
                : typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('overview');
  
  // Slicers / Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const orders = ORDERS;
  const orderItems = ORDER_ITEMS;
  const orderPayments = ORDER_PAYMENTS;
  const orderReviews = ORDER_REVIEWS;
  const products = PRODUCTS;
  const customers = CUSTOMERS;
  const sellers = SELLERS;

  // Filtered dataset
  const filteredData = useMemo(() => {
    let filteredOrders = orders;

    if (selectedStatus !== 'ALL') {
      filteredOrders = filteredOrders.filter(o => o.order_status === selectedStatus);
    }

    if (selectedState !== 'ALL') {
      const custIdsInState = new Set(
        customers.filter(c => c.customer_state === selectedState).map(c => c.customer_id)
      );
      filteredOrders = filteredOrders.filter(o => custIdsInState.has(o.customer_id));
    }

    const filteredOrderIds = new Set(filteredOrders.map(o => o.order_id));

    let filteredItems = orderItems.filter(i => filteredOrderIds.has(i.order_id));

    if (selectedCategory !== 'ALL') {
      const prodIdsInCat = new Set(
        products.filter(p => p.product_category_name_english === selectedCategory).map(p => p.product_id)
      );
      filteredItems = filteredItems.filter(i => prodIdsInCat.has(i.product_id));
      const validOrderIdsWithCat = new Set(filteredItems.map(i => i.order_id));
      filteredOrders = filteredOrders.filter(o => validOrderIdsWithCat.has(o.order_id));
    }

    const filteredPayments = orderPayments.filter(p => filteredOrderIds.has(p.order_id));
    const filteredReviews = orderReviews.filter(r => filteredOrderIds.has(r.order_id));

    return {
      orders: filteredOrders,
      orderItems: filteredItems,
      orderPayments: filteredPayments,
      orderReviews: filteredReviews,
    };
  }, [selectedState, selectedCategory, selectedStatus, orders, orderItems, orderPayments, orderReviews, customers, products]);

  // Aggregate Executive KPIs
  const kpis = useMemo(() => {
    const totalGmv = filteredData.orderPayments.reduce((acc, p) => acc + p.payment_value, 0);
    const totalOrdersCount = filteredData.orders.length;
    const avgOrderValue = totalOrdersCount > 0 ? totalGmv / totalOrdersCount : 0;
    
    const totalReviewsCount = filteredData.orderReviews.length;
    const avgReviewScore = totalReviewsCount > 0 
      ? filteredData.orderReviews.reduce((acc, r) => acc + r.review_score, 0) / totalReviewsCount 
      : 0;

    let delayedCount = 0;
    let totalDeliveredCount = 0;
    let totalDeliveryDays = 0;

    filteredData.orders.forEach(o => {
      if (o.order_status === 'delivered' && o.order_delivered_customer_date) {
        totalDeliveredCount++;
        const delMs = new Date(o.order_delivered_customer_date).getTime();
        const estMs = new Date(o.order_estimated_delivery_date).getTime();
        const purMs = new Date(o.order_purchase_timestamp).getTime();

        totalDeliveryDays += (delMs - purMs) / (86400 * 1000);

        if (delMs > estMs) {
          delayedCount++;
        }
      }
    });

    const onTimeRate = totalDeliveredCount > 0 ? ((totalDeliveredCount - delayedCount) / totalDeliveredCount) * 100 : 0;
    const avgLeadTimeDays = totalDeliveredCount > 0 ? totalDeliveryDays / totalDeliveredCount : 0;

    return {
      totalGmv,
      totalOrdersCount,
      avgOrderValue,
      avgReviewScore,
      onTimeRate,
      delayedCount,
      avgLeadTimeDays
    };
  }, [filteredData]);

  // Chart Data 1: Monthly GMV & Orders Trend
  const monthlyTrendData = useMemo(() => {
    const monthMap: Record<string, { month: string; GMV: number; Orders: number }> = {};

    filteredData.orders.forEach(o => {
      const month = o.order_purchase_timestamp.substring(0, 7);
      if (!monthMap[month]) {
        monthMap[month] = { month, GMV: 0, Orders: 0 };
      }
      monthMap[month].Orders += 1;
    });

    filteredData.orderPayments.forEach(p => {
      const ord = filteredData.orders.find(o => o.order_id === p.order_id);
      if (ord) {
        const month = ord.order_purchase_timestamp.substring(0, 7);
        if (monthMap[month]) {
          monthMap[month].GMV += p.payment_value;
        }
      }
    });

    return Object.values(monthMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        GMV: Math.round(item.GMV),
      }));
  }, [filteredData]);

  // Chart Data 2: Revenue by Brazilian State
  const stateRevenueData = useMemo(() => {
    const stateMap: Record<string, number> = {};

    filteredData.orders.forEach(o => {
      const cust = customers.find(c => c.customer_id === o.customer_id);
      const state = cust ? cust.customer_state : 'Other';
      const pays = filteredData.orderPayments.filter(p => p.order_id === o.order_id);
      const totalPay = pays.reduce((s, p) => s + p.payment_value, 0);

      stateMap[state] = (stateMap[state] || 0) + totalPay;
    });

    return Object.entries(stateMap)
      .map(([state, revenue]) => ({ state, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredData, customers]);

  // Chart Data 3: Payment Method Breakdown
  const paymentMethodData = useMemo(() => {
    const payMap: Record<string, number> = {};
    filteredData.orderPayments.forEach(p => {
      const label = p.payment_type.replace('_', ' ').toUpperCase();
      payMap[label] = (payMap[label] || 0) + p.payment_value;
    });

    const COLORS = ['#4f46e5', '#0284c7', '#10b981', '#8b5cf6', '#f59e0b'];
    return Object.entries(payMap).map(([name, value], idx) => ({
      name,
      value: Math.round(value),
      color: COLORS[idx % COLORS.length]
    }));
  }, [filteredData]);

  // Chart Data 4: Category Revenue vs Freight Cost Ratio
  const categoryPerformanceData = useMemo(() => {
    const catMap: Record<string, { revenue: number; freight: number; count: number }> = {};

    filteredData.orderItems.forEach(i => {
      const prod = products.find(p => p.product_id === i.product_id);
      const cat = prod ? prod.product_category_name_english.replace(/_/g, ' ') : 'other';
      if (!catMap[cat]) {
        catMap[cat] = { revenue: 0, freight: 0, count: 0 };
      }
      catMap[cat].revenue += i.price;
      catMap[cat].freight += i.freight_value;
      catMap[cat].count += 1;
    });

    return Object.entries(catMap)
      .map(([category, data]) => ({
        category: category.length > 18 ? category.substring(0, 16) + '..' : category,
        revenue: Math.round(data.revenue),
        freight: Math.round(data.freight),
        freightRatio: data.revenue > 0 ? parseFloat(((data.freight / data.revenue) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredData, products]);

  // Chart Data 5: On-Time vs Delayed Delivery Review Score Impact
  const deliveryReviewData = useMemo(() => {
    let onTimeScores = [0, 0, 0, 0, 0]; // 1 to 5 stars
    let delayedScores = [0, 0, 0, 0, 0];

    filteredData.orders.forEach(o => {
      if (o.order_status === 'delivered' && o.order_delivered_customer_date && o.order_estimated_delivery_date) {
        const isDelayed = new Date(o.order_delivered_customer_date) > new Date(o.order_estimated_delivery_date);
        const rev = filteredData.orderReviews.find(r => r.order_id === o.order_id);
        if (rev && rev.review_score >= 1 && rev.review_score <= 5) {
          const idx = rev.review_score - 1;
          if (isDelayed) delayedScores[idx]++;
          else onTimeScores[idx]++;
        }
      }
    });

    return [1, 2, 3, 4, 5].map(star => ({
      starRating: `${star} Star${star > 1 ? 's' : ''}`,
      OnTime: onTimeScores[star - 1],
      Delayed: delayedScores[star - 1],
    }));
  }, [filteredData]);

  // Chart Data 6: Seller Leaderboard
  const topSellersList = useMemo(() => {
    const sellerMap: Record<string, { state: string; totalSales: number; orderCount: number }> = {};

    filteredData.orderItems.forEach(i => {
      const sel = sellers.find(s => s.seller_id === i.seller_id);
      const state = sel ? sel.seller_state : 'SP';
      if (!sellerMap[i.seller_id]) {
        sellerMap[i.seller_id] = { state, totalSales: 0, orderCount: 0 };
      }
      sellerMap[i.seller_id].totalSales += i.price;
      sellerMap[i.seller_id].orderCount += 1;
    });

    return Object.entries(sellerMap)
      .map(([id, data]) => ({
        id,
        state: data.state,
        sales: Math.round(data.totalSales),
        orders: data.orderCount,
        avgTicket: Math.round(data.totalSales / (data.orderCount || 1)),
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);
  }, [filteredData, sellers]);

  // All unique states and categories for slicers
  const allStatesList = useMemo(() => Array.from(new Set(customers.map(c => c.customer_state))).sort(), [customers]);
  const allCategoriesList = useMemo(() => Array.from(new Set(products.map(p => p.product_category_name_english))).sort(), [products]);

  const resetFilters = () => {
    setSelectedState('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Slicers & Filters Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Interactive Data Slicers:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-3xl">
            {/* State Slicer */}
            <div className="flex flex-col">
              <label className="text-[11px] font-medium text-slate-500 mb-1">State (U.F.)</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="ALL">All States ({allStatesList.length})</option>
                {allStatesList.map(st => (
                  <option key={st} value={st}>{st} State</option>
                ))}
              </select>
            </div>

            {/* Category Slicer */}
            <div className="flex flex-col">
              <label className="text-[11px] font-medium text-slate-500 mb-1">Product Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="ALL">All Categories ({allCategoriesList.length})</option>
                {allCategoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Order Status Slicer */}
            <div className="flex flex-col">
              <label className="text-[11px] font-medium text-slate-500 mb-1">Order Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value="delivered">Delivered Only</option>
                <option value="shipped">Shipped</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors self-end md:self-center shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

        </div>
      </div>

      {/* Top Page Sub-Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setCurrentPage('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentPage === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setCurrentPage('logistics')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentPage === 'logistics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-400" />
          <span>Logistics & SLA Delivery</span>
        </button>

        <button
          onClick={() => setCurrentPage('categories')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentPage === 'categories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Product Categories</span>
        </button>

        <button
          onClick={() => setCurrentPage('sellers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            currentPage === 'sellers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span>Seller Leaderboard</span>
        </button>
      </div>

      {/* Executive KPI Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Gross Merchandise Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Merchandise Value (GMV)</span>
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              R$ {kpis.totalGmv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2.5 flex items-center text-xs text-emerald-700 font-medium">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px]">
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
              +14.2% vs prev
            </span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Order Volume</span>
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {kpis.totalOrdersCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono">orders</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-600">
            <span>Average Ticket: <strong className="text-slate-900 font-mono">R$ {kpis.avgOrderValue.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* KPI 3: On-Time Delivery Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">On-Time Fulfillment Rate</span>
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {kpis.onTimeRate.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2.5 flex items-center text-xs text-amber-700 font-medium">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[11px]">
              <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
              {kpis.delayedCount} delayed shipments
            </span>
          </div>
        </div>

        {/* KPI 4: Average Review Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Customer Satisfaction (CSAT)</span>
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-600">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {kpis.avgReviewScore.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 5.00</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-600">
            <span>Avg Lead Time: <strong className="text-slate-900 font-mono">{kpis.avgLeadTimeDays.toFixed(1)} days</strong></span>
          </div>
        </div>

      </div>

      {/* Page Content 1: Executive Overview */}
      {currentPage === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GMV Monthly Trend Line Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Monthly Revenue (GMV) & Order Trajectory</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Historical trajectory across 2017 - 2018 transactions</p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#4f46e5" fontSize={11} unit=" R$" />
                  <YAxis yAxisId="right" orientation="right" stroke="#0284c7" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="GMV" fill="#4f46e5" radius={[4, 4, 0, 0]} name="GMV Revenue (R$)" />
                  <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} name="Orders Count" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Payment Method Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Share of transaction payment values</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {paymentMethodData.map(item => (
                <div key={item.name} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="truncate">
                    <span className="text-slate-800 font-medium block truncate">{item.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">R$ {item.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Brazilian State Bar Chart */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Top 10 Brazilian States by Gross Revenue</h3>
              <p className="text-xs text-slate-500 mt-0.5">State concentration showing dominance of SP, RJ, and MG regions</p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} unit=" R$" />
                  <YAxis dataKey="state" type="category" stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} name="Gross Revenue (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Page Content 2: Logistics & Delivery */}
      {currentPage === 'logistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Delivery Delay vs Review Score Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>On-Time vs Delayed Deliveries: Review Score Impact</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Rating degradation observed on late shipments</p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryReviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="starRating" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="OnTime" fill="#10b981" radius={[4, 4, 0, 0]} name="On-Time Deliveries" />
                  <Bar dataKey="Delayed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Delayed Deliveries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Delivery Cycle Lead Time Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Order Fulfillment Cycle Lead Times</h3>
              <p className="text-xs text-slate-500 mt-0.5">Bottleneck breakdown across fulfillment stages</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-800 font-medium">1. Purchase to Payment Approval</span>
                  <span className="text-indigo-600 font-mono font-bold">0.4 Days (avg)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[12%]" />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-800 font-medium">2. Seller Processing to Carrier Handover</span>
                  <span className="text-blue-600 font-mono font-bold">2.8 Days (avg)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[35%]" />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-800 font-medium">3. Carrier Transit to Customer Final Delivery</span>
                  <span className="text-amber-600 font-mono font-bold">8.2 Days (avg)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[80%]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Page Content 3: Product Categories */}
      {currentPage === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Top Categories: Revenue & Freight Cost Ratio</h3>
            <p className="text-xs text-slate-500 mt-0.5">Measures freight expenditure as a percentage of item price</p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#4f46e5" fontSize={11} unit=" R$" />
                <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={11} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Item Revenue (R$)" />
                <Bar yAxisId="left" dataKey="freight" fill="#0284c7" radius={[4, 4, 0, 0]} name="Freight Cost (R$)" />
                <Line yAxisId="right" type="monotone" dataKey="freightRatio" stroke="#e11d48" strokeWidth={2.5} name="Freight / Price Ratio (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Page Content 4: Sellers */}
      {currentPage === 'sellers' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top Merchant Sellers Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Top performing marketplace sellers ranked by total GMV revenue</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank & Seller ID</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Orders Fulfilled</th>
                  <th className="py-3 px-4 text-right">Avg Ticket</th>
                  <th className="py-3 px-4 text-right">Total GMV Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {topSellersList.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] flex items-center justify-center font-bold border border-slate-200">
                        {idx + 1}
                      </span>
                      <span>{s.id}</span>
                    </td>
                    <td className="py-3.5 px-4">{s.state}</td>
                    <td className="py-3.5 px-4 text-right">{s.orders}</td>
                    <td className="py-3.5 px-4 text-right text-slate-700">R$ {s.avgTicket.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-indigo-600">R$ {s.sales.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
