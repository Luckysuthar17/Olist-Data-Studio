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
import { executeSqlQuery } from './sqlEngine';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  statusCode: number;
  timestamp: string;
  endpoint: string;
  method: 'GET' | 'POST';
  queryParams?: Record<string, string>;
  bodyParams?: Record<string, any>;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    totalRecords?: number;
    executionTimeMs?: number;
  };
  message?: string;
}

export function handleApiRequest(
  method: 'GET' | 'POST',
  endpoint: string,
  queryParams: Record<string, string> = {},
  bodyParams: Record<string, any> = {}
): ApiResponse {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  const orders = ORDERS;
  const orderItems = ORDER_ITEMS;
  const orderPayments = ORDER_PAYMENTS;
  const orderReviews = ORDER_REVIEWS;
  const products = PRODUCTS;
  const customers = CUSTOMERS;
  const sellers = SELLERS;

  // Endpoint 1: High Level Metrics Summary
  if (endpoint === '/api/v1/metrics/summary' && method === 'GET') {
    const deliveredOrders = orders.filter(o => o.order_status === 'delivered');
    const totalOrdersCount = orders.length;
    const deliveredCount = deliveredOrders.length;
    const totalGmv = orderPayments.reduce((sum, p) => sum + p.payment_value, 0);
    const avgOrderValue = totalOrdersCount > 0 ? totalGmv / totalOrdersCount : 0;

    const avgReviewScore = orderReviews.reduce((sum, r) => sum + r.review_score, 0) / (orderReviews.length || 1);

    let delayedCount = 0;
    orders.forEach(o => {
      if (o.order_status === 'delivered' && o.order_delivered_customer_date && o.order_estimated_delivery_date) {
        if (new Date(o.order_delivered_customer_date) > new Date(o.order_estimated_delivery_date)) {
          delayedCount++;
        }
      }
    });

    const onTimePercentage = deliveredCount > 0 ? ((deliveredCount - delayedCount) / deliveredCount) * 100 : 0;

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      queryParams,
      data: {
        total_gmv: parseFloat(totalGmv.toFixed(2)),
        total_orders: totalOrdersCount,
        delivered_orders: deliveredCount,
        average_order_value: parseFloat(avgOrderValue.toFixed(2)),
        average_review_score: parseFloat(avgReviewScore.toFixed(2)),
        on_time_delivery_rate_pct: parseFloat(onTimePercentage.toFixed(1)),
        delayed_orders_count: delayedCount,
        active_sellers_count: sellers.length,
        unique_customers_count: new Set(customers.map(c => c.customer_unique_id)).size,
      },
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint 2: Filtered Orders List
  if (endpoint === '/api/v1/orders' && method === 'GET') {
    let filtered = [...orders];

    if (queryParams.status) {
      filtered = filtered.filter(o => o.order_status === queryParams.status);
    }

    if (queryParams.customer_state) {
      const custIdsInState = new Set(customers.filter(c => c.customer_state === queryParams.customer_state).map(c => c.customer_id));
      filtered = filtered.filter(o => custIdsInState.has(o.customer_id));
    }

    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '10', 10);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const detailedOrders = paginated.map(o => {
      const cust = customers.find(c => c.customer_id === o.customer_id);
      const items = orderItems.filter(i => i.order_id === o.order_id);
      const payments = orderPayments.filter(p => p.order_id === o.order_id);
      const review = orderReviews.find(r => r.order_id === o.order_id);
      const totalAmount = payments.reduce((sum, p) => sum + p.payment_value, 0);

      return {
        order_id: o.order_id,
        order_status: o.order_status,
        order_purchase_timestamp: o.order_purchase_timestamp,
        customer_id: o.customer_id,
        customer_state: cust?.customer_state || 'N/A',
        customer_city: cust?.customer_city || 'N/A',
        total_amount: parseFloat(totalAmount.toFixed(2)),
        items_count: items.length,
        payment_type: payments[0]?.payment_type || 'N/A',
        review_score: review?.review_score || null,
        order_delivered_customer_date: o.order_delivered_customer_date || null,
        order_estimated_delivery_date: o.order_estimated_delivery_date,
      };
    });

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      queryParams,
      data: detailedOrders,
      meta: {
        page,
        limit,
        totalRecords: filtered.length,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint 3: Single Order Details
  if (endpoint.startsWith('/api/v1/orders/') && method === 'GET') {
    const orderId = endpoint.replace('/api/v1/orders/', '').trim();
    const order = orders.find(o => o.order_id.toLowerCase() === orderId.toLowerCase() || o.order_id === `ord_${orderId.padStart(5, '0')}`);

    if (!order) {
      return {
        status: 'error',
        statusCode: 404,
        timestamp,
        endpoint,
        method,
        message: `Order with ID '${orderId}' was not found in Olist database.`,
      };
    }

    const customer = customers.find(c => c.customer_id === order.customer_id);
    const items = orderItems.filter(i => i.order_id === order.order_id).map(i => {
      const prod = products.find(p => p.product_id === i.product_id);
      const sel = sellers.find(s => s.seller_id === i.seller_id);
      return {
        order_item_id: i.order_item_id,
        product_id: i.product_id,
        product_category: prod?.product_category_name_english || 'other',
        seller_id: i.seller_id,
        seller_state: sel?.seller_state || 'N/A',
        price: i.price,
        freight_value: i.freight_value,
      };
    });

    const payments = orderPayments.filter(p => p.order_id === order.order_id);
    const review = orderReviews.find(r => r.order_id === order.order_id);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: {
        order,
        customer,
        items,
        payments,
        review,
      },
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint 4: Revenue by Category
  if (endpoint === '/api/v1/analytics/revenue-by-category' && method === 'GET') {
    const catMap: Record<string, { revenue: number; freight: number; items: number }> = {};

    orderItems.forEach(i => {
      const prod = products.find(p => p.product_id === i.product_id);
      const category = prod ? prod.product_category_name_english : 'other';
      if (!catMap[category]) {
        catMap[category] = { revenue: 0, freight: 0, items: 0 };
      }
      catMap[category].revenue += i.price;
      catMap[category].freight += i.freight_value;
      catMap[category].items += 1;
    });

    const categoryList = Object.entries(catMap)
      .map(([cat, val]) => ({
        category_name: cat,
        total_revenue: parseFloat(val.revenue.toFixed(2)),
        total_freight: parseFloat(val.freight.toFixed(2)),
        freight_share_pct: parseFloat(((val.freight / val.revenue) * 100).toFixed(2)),
        total_items_sold: val.items,
        average_price: parseFloat((val.revenue / val.items).toFixed(2)),
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: categoryList,
      meta: {
        totalRecords: categoryList.length,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint 5: Delivery Performance
  if (endpoint === '/api/v1/analytics/delivery-performance' && method === 'GET') {
    let onTimeCount = 0;
    let delayedCount = 0;
    let totalDelivered = 0;

    const stateDelayMap: Record<string, { onTime: number; delayed: number; totalDays: number; count: number }> = {};

    orders.forEach(o => {
      if (o.order_status === 'delivered' && o.order_delivered_customer_date && o.order_estimated_delivery_date) {
        totalDelivered++;
        const cust = customers.find(c => c.customer_id === o.customer_id);
        const state = cust ? cust.customer_state : 'SP';

        if (!stateDelayMap[state]) {
          stateDelayMap[state] = { onTime: 0, delayed: 0, totalDays: 0, count: 0 };
        }

        const delDate = new Date(o.order_delivered_customer_date).getTime();
        const estDate = new Date(o.order_estimated_delivery_date).getTime();
        const purDate = new Date(o.order_purchase_timestamp).getTime();

        const leadDays = (delDate - purDate) / (86400 * 1000);
        stateDelayMap[state].totalDays += leadDays;
        stateDelayMap[state].count += 1;

        if (delDate > estDate) {
          delayedCount++;
          stateDelayMap[state].delayed += 1;
        } else {
          onTimeCount++;
          stateDelayMap[state].onTime += 1;
        }
      }
    });

    const stateBreakdown = Object.entries(stateDelayMap).map(([st, val]) => ({
      state: st,
      total_orders: val.count,
      on_time_orders: val.onTime,
      delayed_orders: val.delayed,
      on_time_rate_pct: val.count > 0 ? parseFloat(((val.onTime / val.count) * 100).toFixed(1)) : 0,
      avg_lead_time_days: val.count > 0 ? parseFloat((val.totalDays / val.count).toFixed(1)) : 0,
    })).sort((a, b) => b.total_orders - a.total_orders);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: {
        summary: {
          total_delivered_orders: totalDelivered,
          on_time_orders: onTimeCount,
          delayed_orders: delayedCount,
          overall_on_time_rate_pct: totalDelivered > 0 ? parseFloat(((onTimeCount / totalDelivered) * 100).toFixed(1)) : 0,
        },
        state_performance: stateBreakdown,
      },
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint 6: Top Sellers
  if (endpoint === '/api/v1/sellers/top' && method === 'GET') {
    const sellerMap: Record<string, { state: string; sales: number; items: number }> = {};

    orderItems.forEach(i => {
      const sel = sellers.find(s => s.seller_id === i.seller_id);
      const state = sel ? sel.seller_state : 'SP';
      if (!sellerMap[i.seller_id]) {
        sellerMap[i.seller_id] = { state, sales: 0, items: 0 };
      }
      sellerMap[i.seller_id].sales += i.price;
      sellerMap[i.seller_id].items += 1;
    });

    const limit = parseInt(queryParams.limit || '10', 10);
    const topSellers = Object.entries(sellerMap)
      .map(([sId, val]) => ({
        seller_id: sId,
        seller_state: val.state,
        total_sales: parseFloat(val.sales.toFixed(2)),
        total_items_sold: val.items,
        average_item_price: parseFloat((val.sales / val.items).toFixed(2)),
      }))
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, limit);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: topSellers,
      meta: {
        limit,
        totalRecords: topSellers.length,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint 7: Execute Custom SQL Query
  if (endpoint === '/api/v1/query/sql' && method === 'POST') {
    const sqlStatement = bodyParams.sql || 'SELECT * FROM olist_orders_dataset LIMIT 10;';
    const sqlResult = executeSqlQuery(sqlStatement);

    const endTime = performance.now();
    return {
      status: sqlResult.error ? 'error' : 'success',
      statusCode: sqlResult.error ? 400 : 200,
      timestamp,
      endpoint,
      method,
      bodyParams,
      data: {
        sql: sqlStatement,
        columns: sqlResult.columns,
        rows: sqlResult.rows,
        row_count: sqlResult.rowCount,
      },
      message: sqlResult.error,
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint 8: AI Insights
  if (endpoint === '/api/v1/insights/ai' && method === 'GET') {
    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: {
        executive_summary: "Olist's Gross Merchandise Value (GMV) demonstrated robust momentum across 2017-2018, primarily anchored by Southeast states (SP, RJ, MG) which generate 68% of total revenue. However, logistics lead times remain a primary friction point.",
        key_findings: [
          "Delays lead to an average review drop from 4.6 stars to 1.9 stars (a 58.7% satisfaction decline).",
          "High freight-to-price ratio in categories like Furniture & Decor (up to 24% of item cost) limits conversion outside SP.",
          "72% of consumers use Credit Cards, with an average installment period of 3.8 months, making installment options key for high-ticket electronics and watches."
        ],
        strategic_recommendations: [
          "Establish fulfillment hubs in Southern & Northeastern regional hubs (PR & BA) to reduce cross-country shipping lead time.",
          "Subsidize freight for items over R$150 or products exceeding 2kg weight.",
          "Introduce proactive delay warning SMS notifications to cushion review score impacts."
        ]
      },
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Default Fallback Not Found
  return {
    status: 'error',
    statusCode: 404,
    timestamp,
    endpoint,
    method,
    message: `API endpoint '${endpoint}' with method '${method}' was not found.`,
  };
}
