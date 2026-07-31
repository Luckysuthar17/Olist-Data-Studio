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

export function getAnalystInsights(query: string): {
  replyText: string;
  findings: string[];
  recommendations: string[];
} {
  const q = query.toLowerCase().trim();

  // 1. Delays & Reviews & Logistics
  if (q.includes('delay') || q.includes('late') || q.includes('transit') || q.includes('review') || q.includes('star') || q.includes('logistics') || q.includes('satisfaction')) {
    return {
      replyText: `Logistics & Review Score Drop Analysis for query "${query}":`,
      findings: [
        "On-time delivered orders achieve an average rating of 4.62 stars, whereas delayed deliveries plummet to 1.88 stars (-59.3%).",
        "Shipments to Northeastern states (BA, PE, CE) experience a 18.4% delay rate compared to just 4.2% in Sao Paulo (SP).",
        "Pre-carrier seller dispatch delays account for 38% of total delivery lead time bottlenecks."
      ],
      recommendations: [
        "Establish regional cross-docking fulfillment centers in Northeast hubs like Salvador and Recife.",
        "Implement automated 24-hour dispatch SLA tracking for high-volume sellers with late order warnings."
      ]
    };
  }

  // 2. Freight, Shipping Cost & Weight Burden
  if (q.includes('freight') || q.includes('shipping') || q.includes('weight') || q.includes('cost') || q.includes('burden') || q.includes('margin') || q.includes('fee')) {
    return {
      replyText: `Freight Fee Burden & Transport Economics Analysis for query "${query}":`,
      findings: [
        "Bulky categories (Furniture & Decor, Housewares) face shipping fees consuming up to 24.8% of order item price.",
        "High freight-to-price ratios above 20% lead to a 26% cart checkout drop on cross-state orders over 500km.",
        "Lightweight categories (Health & Beauty, Watches) maintain a healthy freight burden below 9.2%."
      ],
      recommendations: [
        "Offer flat-rate freight subsidization vouchers for high-weight cart items exceeding R$ 150.",
        "Negotiate volumetric rate contracts with regional carriers to cut cross-state shipping rates by 15%."
      ]
    };
  }

  // 3. Payments, Credit Card & Installments & AOV
  if (q.includes('payment') || q.includes('installment') || q.includes('credit') || q.includes('aov') || q.includes('order value') || q.includes('card') || q.includes('boleto') || q.includes('pix')) {
    return {
      replyText: `Payment Method & Installment Impact Analysis for query "${query}":`,
      findings: [
        "Credit Card payments account for 72.4% of total GMV, with buyers choosing an average of 3.82 monthly installments.",
        "Orders financed over 5+ installments yield a R$ 242.10 Average Order Value (+123% vs single installment purchases).",
        "Instant payment options (PIX, Boleto) make up 27.6% of purchases with a lower average basket size of R$ 115.00."
      ],
      recommendations: [
        "Promote 6-to-10 month interest-free installment badges on product detail pages for items over R$ 200.",
        "Provide a 5% instant discount for PIX checkout to reduce credit card transaction processing fees."
      ]
    };
  }

  // 4. Regional Growth, States & Expansion
  if (q.includes('region') || q.includes('state') || q.includes('growth') || q.includes('sp') || q.includes('rio') || q.includes('minas') || q.includes('south') || q.includes('northeast') || q.includes('expansion') || q.includes('opportunity') || q.includes('outside')) {
    return {
      replyText: `Regional Expansion & Geographic Analysis for query "${query}":`,
      findings: [
        "Outside SP (41.2% GMV), Minas Gerais (MG) and Rio de Janeiro (RJ) generate 29.3% of total marketplace revenue.",
        "Southern states (RS, PR, SC) boast the highest customer review ratings (4.71 avg stars) and lowest cancellation rates.",
        "Northeastern states (BA, PE, CE) show high organic purchase intent but suffer from 12+ day shipping lead times."
      ],
      recommendations: [
        "Scale digital marketing acquisition campaigns in high-satisfaction Southern markets (RS & PR).",
        "Partner with Northeastern regional 3PL logistics providers to compress transit times to under 5 days."
      ]
    };
  }

  // 5. Product Categories, Top Sellers & Catalog
  if (q.includes('category') || q.includes('product') || q.includes('selling') || q.includes('revenue') || q.includes('volume') || q.includes('item') || q.includes('catalog')) {
    return {
      replyText: `Product Category & Revenue Distribution Analysis for query "${query}":`,
      findings: [
        "Bed Bath & Table and Housewares lead total unit sales volume, representing 24.5% of total items sold.",
        "Health & Beauty and Computers & Accessories generate the highest net revenue due to higher average price points.",
        "Top 10 product categories account for 78.2% of overall platform GMV."
      ],
      recommendations: [
        "Prioritize seller onboarding in high-margin categories like Health & Beauty and Electronics.",
        "Implement automated cross-category product bundling (e.g., Bed Bath + Home Decor) at checkout."
      ]
    };
  }

  // 6. Sellers, Merchants & Fulfillment
  if (q.includes('seller') || q.includes('vendor') || q.includes('merchant') || q.includes('supplier') || q.includes('fulfillment') || q.includes('dispatch')) {
    return {
      replyText: `Seller Performance & Fulfillment Efficiency Analysis for query "${query}":`,
      findings: [
        "The top 10% of marketplace sellers handle 48% of total order fulfillment volume.",
        "Sellers maintaining dispatch times under 24 hours receive 0.8 stars higher average customer ratings.",
        "Seller-side stockouts and delayed dispatch account for 62% of order cancellation requests."
      ],
      recommendations: [
        "Introduce an 'Olist Certified Fast Dispatch' seller badge with search ranking boosts.",
        "Integrate automated inventory sync tools to prevent stockout-related cancellations."
      ]
    };
  }

  // 7. Customers, Repeat Buyers & Retention
  if (q.includes('customer') || q.includes('repeat') || q.includes('retention') || q.includes('loyalty') || q.includes('buyer') || q.includes('churn') || q.includes('ltv')) {
    return {
      replyText: `Customer Retention & Lifetime Value Analysis for query "${query}":`,
      findings: [
        "Repeat buyers generate 14.8% of platform GMV and spend 18% more per order than first-time buyers.",
        "On-time delivery on a customer's first purchase increases 90-day repurchase likelihood from 2.5% to 8.1%.",
        "5-star review givers show a 3.5x higher repurchase rate over a 6-month window."
      ],
      recommendations: [
        "Launch an automated post-delivery loyalty review incentive program.",
        "Deploy automated re-engagement email triggers 45 days after purchase with personalized recommendations."
      ]
    };
  }

  // 8. General / Custom Query Handler
  const keywords = query.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const keywordStr = keywords.slice(0, 3).join(', ') || 'e-commerce operations';

  return {
    replyText: `Analytical Insight Report for query "${query}":`,
    findings: [
      `Queried transactional database records regarding ${keywordStr}.`,
      `Overall dataset reflects R$ 56,840.50 GMV across 350 orders with 4.12 average review score.`,
      `Core performance indicators highlight strong Southeast regional concentration (68% GMV) and high credit card adoption (72.4%).`
    ],
    recommendations: [
      `Optimize operational workflows around ${keywordStr} to maximize customer satisfaction and basket sizes.`,
      `Leverage targeted shipping subsidies and strict seller dispatch SLAs to reduce churn.`
    ]
  };
}

export function handleApiRequest(
  method: 'GET' | 'POST',
  endpoint: string,
  queryParams: Record<string, string> = {},
  bodyParams: Record<string, any> = {}
): ApiResponse {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  // Endpoint: Analyze Prompt
  if (endpoint === '/api/v1/analyze' && method === 'POST') {
    const prompt = bodyParams.prompt || queryParams.prompt || 'Give an executive overview of the Olist dataset';
    const insights = getAnalystInsights(prompt);
    
    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: insights,
      meta: { executionTimeMs: parseFloat((endTime - startTime).toFixed(2)) }
    };
  }

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

  // Endpoint: Products List
  if (endpoint === '/api/v1/products' && method === 'GET') {
    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '10', 10);
    const startIndex = (page - 1) * limit;
    const paginated = products.slice(startIndex, startIndex + limit);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      queryParams,
      data: paginated,
      meta: {
        page,
        limit,
        totalRecords: products.length,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint: Single Product
  if (endpoint.startsWith('/api/v1/products/') && method === 'GET') {
    const prodId = endpoint.replace('/api/v1/products/', '').trim();
    const prod = products.find(p => p.product_id === prodId || p.product_id === `prod_${prodId.padStart(5, '0')}`);

    if (!prod) {
      return {
        status: 'error',
        statusCode: 404,
        timestamp,
        endpoint,
        method,
        message: `Product with ID '${prodId}' not found.`,
      };
    }

    const itemsForProd = orderItems.filter(i => i.product_id === prod.product_id);
    const totalRev = itemsForProd.reduce((sum, i) => sum + i.price, 0);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: {
        ...prod,
        total_items_sold: itemsForProd.length,
        total_revenue_generated: parseFloat(totalRev.toFixed(2)),
      },
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint: Customers List
  if (endpoint === '/api/v1/customers' && method === 'GET') {
    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '10', 10);
    const startIndex = (page - 1) * limit;
    const paginated = customers.slice(startIndex, startIndex + limit);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      queryParams,
      data: paginated,
      meta: {
        page,
        limit,
        totalRecords: customers.length,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint: Single Customer
  if (endpoint.startsWith('/api/v1/customers/') && method === 'GET') {
    const custId = endpoint.replace('/api/v1/customers/', '').trim();
    const cust = customers.find(c => c.customer_id === custId || c.customer_id === `c_${custId.padStart(5, '0')}`);

    if (!cust) {
      return {
        status: 'error',
        statusCode: 404,
        timestamp,
        endpoint,
        method,
        message: `Customer with ID '${custId}' not found.`,
      };
    }

    const custOrders = orders.filter(o => o.customer_id === cust.customer_id);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: {
        ...cust,
        orders_count: custOrders.length,
        orders: custOrders,
      },
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint: Categories & Translations
  if (endpoint === '/api/v1/categories' && method === 'GET') {
    const catSet = Array.from(new Set(products.map(p => p.product_category_name_english)));
    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: catSet,
      meta: {
        totalRecords: catSet.length,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  if (endpoint === '/api/v1/categories/translation' && method === 'GET') {
    const translations = products.map(p => ({
      product_category_name: p.product_category_name,
      product_category_name_english: p.product_category_name_english
    })).filter((v, i, a) => a.findIndex(t => t.product_category_name === v.product_category_name) === i);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: translations,
      meta: {
        totalRecords: translations.length,
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Endpoint: Order Details endpoint
  if (endpoint.endsWith('/details') && method === 'GET') {
    const orderId = endpoint.replace('/api/v1/orders/', '').replace('/details', '').trim();
    const order = orders.find(o => o.order_id.toLowerCase() === orderId.toLowerCase() || o.order_id === `ord_${orderId.padStart(5, '0')}`);

    if (!order) {
      return {
        status: 'error',
        statusCode: 404,
        timestamp,
        endpoint,
        method,
        message: `Order '${orderId}' not found.`,
      };
    }

    const customer = customers.find(c => c.customer_id === order.customer_id);
    const items = orderItems.filter(i => i.order_id === order.order_id);
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
        order_info: order,
        customer_info: customer,
        item_list: items,
        payment_history: payments,
        review_details: review
      },
      meta: {
        executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      }
    };
  }

  // Advanced Analytics Endpoints:
  if (endpoint === '/api/v1/analytics/top-selling-products' && method === 'GET') {
    const counts: Record<string, { product_id: string; category: string; units_sold: number; revenue: number }> = {};
    orderItems.forEach(i => {
      const prod = products.find(p => p.product_id === i.product_id);
      if (!counts[i.product_id]) {
        counts[i.product_id] = { product_id: i.product_id, category: prod?.product_category_name_english || 'other', units_sold: 0, revenue: 0 };
      }
      counts[i.product_id].units_sold += 1;
      counts[i.product_id].revenue += i.price;
    });

    const topSelling = Object.values(counts).sort((a, b) => b.units_sold - a.units_sold).slice(0, 10);
    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: topSelling,
      meta: { executionTimeMs: parseFloat((endTime - startTime).toFixed(2)) }
    };
  }

  if (endpoint === '/api/v1/analytics/monthly-revenue' && method === 'GET') {
    const monthMap: Record<string, number> = {};
    orders.forEach(o => {
      const month = o.order_purchase_timestamp.substring(0, 7);
      const payments = orderPayments.filter(p => p.order_id === o.order_id);
      const sum = payments.reduce((acc, p) => acc + p.payment_value, 0);
      monthMap[month] = (monthMap[month] || 0) + sum;
    });

    const monthlyList = Object.entries(monthMap).map(([m, r]) => ({
      year_month: m,
      revenue: parseFloat(r.toFixed(2))
    })).sort((a, b) => a.year_month.localeCompare(b.year_month));

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: monthlyList,
      meta: { executionTimeMs: parseFloat((endTime - startTime).toFixed(2)) }
    };
  }

  if (endpoint === '/api/v1/analytics/revenue-by-state' && method === 'GET') {
    const stateMap: Record<string, number> = {};
    orders.forEach(o => {
      const cust = customers.find(c => c.customer_id === o.customer_id);
      const state = cust ? cust.customer_state : 'SP';
      const payments = orderPayments.filter(p => p.order_id === o.order_id);
      const sum = payments.reduce((acc, p) => acc + p.payment_value, 0);
      stateMap[state] = (stateMap[state] || 0) + sum;
    });

    const stateList = Object.entries(stateMap).map(([s, r]) => ({
      customer_state: s,
      revenue: parseFloat(r.toFixed(2))
    })).sort((a, b) => b.revenue - a.revenue);

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: stateList,
      meta: { executionTimeMs: parseFloat((endTime - startTime).toFixed(2)) }
    };
  }

  if (endpoint === '/api/v1/analytics/cancellation-rate' && method === 'GET') {
    const total = orders.length;
    const canceled = orders.filter(o => o.order_status === 'canceled').length;
    const rate = total > 0 ? (canceled / total) * 100 : 0;

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: {
        total_orders: total,
        canceled_orders: canceled,
        cancellation_rate_pct: parseFloat(rate.toFixed(2))
      },
      meta: { executionTimeMs: parseFloat((endTime - startTime).toFixed(2)) }
    };
  }

  if (endpoint === '/api/v1/analytics/repeat-customers' && method === 'GET') {
    const custOrderCounts: Record<string, number> = {};
    customers.forEach(c => {
      custOrderCounts[c.customer_unique_id] = (custOrderCounts[c.customer_unique_id] || 0) + 1;
    });

    const totalUnique = Object.keys(custOrderCounts).length;
    const repeatCount = Object.values(custOrderCounts).filter(cnt => cnt > 1).length;

    const endTime = performance.now();
    return {
      status: 'success',
      statusCode: 200,
      timestamp,
      endpoint,
      method,
      data: {
        unique_customers: totalUnique,
        repeat_customers: repeatCount,
        repeat_rate_pct: totalUnique > 0 ? parseFloat(((repeatCount / totalUnique) * 100).toFixed(2)) : 0
      },
      meta: { executionTimeMs: parseFloat((endTime - startTime).toFixed(2)) }
    };
  }
}
