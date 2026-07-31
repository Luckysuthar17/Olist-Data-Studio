export interface SqlQueryItem {
  id: string;
  title: string;
  category: 'Revenue & Growth' | 'Logistics & Delivery' | 'Customer Analytics' | 'Seller & Product Performance' | 'Payment Behavior';
  businessProblem: string;
  sql: string;
  explanation: string;
  expectedColumns: string[];
}

export const PRESET_SQL_QUERIES: SqlQueryItem[] = [
  {
    id: 'query-1',
    title: 'Monthly GMV & Order Volume Growth Trend',
    category: 'Revenue & Growth',
    businessProblem: 'Calculate the monthly Gross Merchandise Value (GMV), total completed orders, average order value (AOV), and month-over-month (MoM) revenue growth rate to assess platform trajectory.',
    sql: `-- Monthly Revenue Growth & AOV
WITH monthly_metrics AS (
  SELECT 
    STRFTIME('%Y-%m', o.order_purchase_timestamp) AS order_month,
    COUNT(DISTINCT o.order_id) AS total_orders,
    ROUND(SUM(p.payment_value), 2) AS total_gmv,
    ROUND(AVG(p.payment_value), 2) AS avg_order_value
  FROM olist_orders_dataset o
  JOIN olist_order_payments_dataset p ON o.order_id = p.order_id
  WHERE o.order_status = 'delivered'
  GROUP BY order_month
)
SELECT 
  order_month,
  total_orders,
  total_gmv,
  avg_order_value,
  ROUND(
    ((total_gmv - LAG(total_gmv, 1) OVER (ORDER BY order_month)) / 
    LAG(total_gmv, 1) OVER (ORDER BY order_month)) * 100, 2
  ) AS mom_growth_pct
FROM monthly_metrics
ORDER BY order_month ASC;`,
    explanation: 'Uses window functions (LAG) to compute Month-over-Month percentage GMV growth alongside Order Volume and AOV trends.',
    expectedColumns: ['order_month', 'total_orders', 'total_gmv', 'avg_order_value', 'mom_growth_pct']
  },
  {
    id: 'query-2',
    title: 'Delivery Delay Impact on Customer Review Scores',
    category: 'Logistics & Delivery',
    businessProblem: 'Evaluate how order delivery delays (actual delivery date vs estimated delivery date) affect customer satisfaction ratings (review scores).',
    sql: `-- Delivery Delay vs Review Score Analysis
SELECT 
  CASE 
    WHEN JULIANDAY(o.order_delivered_customer_date) > JULIANDAY(o.order_estimated_delivery_date) 
      THEN 'Delayed' 
    ELSE 'On-Time' 
  END AS delivery_performance,
  COUNT(o.order_id) AS total_orders,
  ROUND(AVG(r.review_score), 2) AS avg_review_score,
  ROUND(SUM(CASE WHEN r.review_score >= 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(o.order_id), 1) AS satisfaction_rate_pct,
  ROUND(AVG(JULIANDAY(o.order_delivered_customer_date) - JULIANDAY(o.order_purchase_timestamp)), 1) AS avg_delivery_days
FROM olist_orders_dataset o
JOIN olist_order_reviews_dataset r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered' 
  AND o.order_delivered_customer_date IS NOT NULL
GROUP BY delivery_performance;`,
    explanation: 'Quantifies satisfaction drop for delayed orders vs on-time shipments, calculating satisfaction rates and average fulfillment lead time.',
    expectedColumns: ['delivery_performance', 'total_orders', 'avg_review_score', 'satisfaction_rate_pct', 'avg_delivery_days']
  },
  {
    id: 'query-3',
    title: 'Top 10 Product Categories by Revenue & Freight Share',
    category: 'Seller & Product Performance',
    businessProblem: 'Identify top revenue-generating product categories in English and measure their freight cost as a percentage of product item price.',
    sql: `-- Category Revenue & Freight Burden
SELECT 
  p.product_category_name_english AS category_name,
  COUNT(DISTINCT i.order_id) AS order_count,
  ROUND(SUM(i.price), 2) AS total_item_revenue,
  ROUND(SUM(i.freight_value), 2) AS total_freight_value,
  ROUND((SUM(i.freight_value) / SUM(i.price)) * 100, 2) AS freight_to_price_ratio_pct,
  ROUND(AVG(i.price), 2) AS avg_item_price
FROM olist_order_items_dataset i
JOIN olist_products_dataset p ON i.product_id = p.product_id
GROUP BY category_name
ORDER BY total_item_revenue DESC
LIMIT 10;`,
    explanation: 'Ranks product categories by item revenue while calculating the freight cost ratio to identify categories hampered by high logistics expense.',
    expectedColumns: ['category_name', 'order_count', 'total_item_revenue', 'total_freight_value', 'freight_to_price_ratio_pct', 'avg_item_price']
  },
  {
    id: 'query-4',
    title: 'Customer Geographic Distribution & State Revenue Concentration',
    category: 'Customer Analytics',
    businessProblem: 'Analyze sales, customer counts, and average spend across Brazilian states to target regional expansion.',
    sql: `-- Revenue & Customer Count by State
SELECT 
  c.customer_state,
  COUNT(DISTINCT c.customer_unique_id) AS unique_customers,
  COUNT(DISTINCT o.order_id) AS total_orders,
  ROUND(SUM(p.payment_value), 2) AS state_total_revenue,
  ROUND(AVG(p.payment_value), 2) AS avg_order_spend
FROM olist_customers_dataset c
JOIN olist_orders_dataset o ON c.customer_id = o.customer_id
JOIN olist_order_payments_dataset p ON o.order_id = p.order_id
WHERE o.order_status = 'delivered'
GROUP BY c.customer_state
ORDER BY state_total_revenue DESC;`,
    explanation: 'Aggregates sales performance by Brazilian federation unit (state) to reveal top geographic markets like SP, RJ, and MG.',
    expectedColumns: ['customer_state', 'unique_customers', 'total_orders', 'state_total_revenue', 'avg_order_spend']
  },
  {
    id: 'query-5',
    title: 'Seller Concentration & Pareto (80/20 Rule) Analysis',
    category: 'Seller & Product Performance',
    businessProblem: 'Determine the contribution of top sellers to overall platform sales volume and identify seller revenue tiers.',
    sql: `-- Seller Sales Concentration & Cumulative Share
WITH seller_sales AS (
  SELECT 
    s.seller_id,
    s.seller_state,
    ROUND(SUM(i.price), 2) AS total_seller_sales,
    COUNT(DISTINCT i.order_id) AS orders_fulfilled
  FROM olist_sellers_dataset s
  JOIN olist_order_items_dataset i ON s.seller_id = i.seller_id
  GROUP BY s.seller_id, s.seller_state
)
SELECT 
  seller_id,
  seller_state,
  total_seller_sales,
  orders_fulfilled,
  NTILE(4) OVER (ORDER BY total_seller_sales DESC) AS revenue_quartile
FROM seller_sales
ORDER BY total_seller_sales DESC
LIMIT 15;`,
    explanation: 'Uses window function NTILE(4) to bucket sellers into revenue quartiles and list top marketplace merchants.',
    expectedColumns: ['seller_id', 'seller_state', 'total_seller_sales', 'orders_fulfilled', 'revenue_quartile']
  },
  {
    id: 'query-6',
    title: 'Payment Method Breakdown & Credit Installment Adoption',
    category: 'Payment Behavior',
    businessProblem: 'Analyze the distribution of payment methods (Credit Card, Boleto, Voucher, Debit Card) and average installment count for credit card purchases.',
    sql: `-- Payment Method & Installment Dynamics
SELECT 
  payment_type,
  COUNT(order_id) AS payment_count,
  ROUND(SUM(payment_value), 2) AS total_payment_value,
  ROUND(AVG(payment_value), 2) AS avg_transaction_value,
  ROUND(AVG(payment_installments), 1) AS avg_installments
FROM olist_order_payments_dataset
GROUP BY payment_type
ORDER BY total_payment_value DESC;`,
    explanation: 'Breaks down transaction values and credit installment preferences among Brazilian consumers.',
    expectedColumns: ['payment_type', 'payment_count', 'total_payment_value', 'avg_transaction_value', 'avg_installments']
  }
];
