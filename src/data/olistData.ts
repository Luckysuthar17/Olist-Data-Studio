export interface Customer {
  customer_id: string;
  customer_unique_id: string;
  customer_zip_code_prefix: number;
  customer_city: string;
  customer_state: string;
}

export interface Product {
  product_id: string;
  product_category_name: string;
  product_category_name_english: string;
  product_name_length: number;
  product_photos_qty: number;
  product_weight_g: number;
  product_length_cm: number;
  product_height_cm: number;
  product_width_cm: number;
}

export interface OrderItem {
  order_id: string;
  order_item_id: number;
  product_id: string;
  seller_id: string;
  shipping_limit_date: string;
  price: number;
  freight_value: number;
}

export interface OrderPayment {
  order_id: string;
  payment_sequential: number;
  payment_type: 'credit_card' | 'boleto' | 'voucher' | 'debit_card';
  payment_installments: number;
  payment_value: number;
}

export interface OrderReview {
  review_id: string;
  order_id: string;
  review_score: number;
  review_comment_title?: string;
  review_comment_message?: string;
  review_creation_date: string;
  review_answer_timestamp: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  order_status: 'delivered' | 'shipped' | 'canceled' | 'processing' | 'invoiced';
  order_purchase_timestamp: string;
  order_approved_at: string;
  order_delivered_carrier_date: string;
  order_delivered_customer_date: string;
  order_estimated_delivery_date: string;
}

export interface Seller {
  seller_id: string;
  seller_zip_code_prefix: number;
  seller_city: string;
  seller_state: string;
}

export interface Geolocation {
  geolocation_zip_code_prefix: number;
  geolocation_lat: number;
  geolocation_lng: number;
  geolocation_city: string;
  geolocation_state: string;
}

// Generate deterministic Olist dataset
const STATES = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'DF', 'CE', 'GO', 'ES', 'PA', 'MT', 'MS'];
const CITIES: Record<string, string[]> = {
  SP: ['Sao Paulo', 'Campinas', 'Guarulhos', 'Santo Andre', 'Ribeirao Preto'],
  RJ: ['Rio de Janeiro', 'Niteroi', 'Duque de Caxia', 'Nova Iguacu'],
  MG: ['Belo Horizonte', 'Uberlandia', 'Juiz de Fora', 'Contagem'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas'],
  PR: ['Curitiba', 'Londrina', 'Maringa', 'Ponta Grossa'],
};

const CATEGORIES = [
  { pt: 'cama_mesa_banho', en: 'bed_bath_table', avgPrice: 89.9, weight: 1800 },
  { pt: 'beleza_saude', en: 'health_beauty', avgPrice: 115.5, weight: 650 },
  { pt: 'esporte_lazer', en: 'sports_leisure', avgPrice: 128.0, weight: 1200 },
  { pt: 'informatica_acessorios', en: 'computers_accessories', avgPrice: 142.0, weight: 900 },
  { pt: 'moveis_decoracao', en: 'furniture_decor', avgPrice: 165.0, weight: 3500 },
  { pt: 'utilidades_domesticas', en: 'housewares', avgPrice: 75.0, weight: 1400 },
  { pt: 'relogios_presentes', en: 'watches_gifts', avgPrice: 210.0, weight: 450 },
  { pt: 'telefonia', en: 'telephony', avgPrice: 95.0, weight: 320 },
  { pt: 'automotivo', en: 'auto', avgPrice: 135.0, weight: 2100 },
  { pt: 'brinquedos', en: 'toys', avgPrice: 82.0, weight: 850 },
  { pt: 'ferramentas_jardim', en: 'garden_tools', avgPrice: 110.0, weight: 2600 },
  { pt: 'perfumaria', en: 'perfumery', avgPrice: 118.0, weight: 500 }
];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Pre-generated Seed Data
export const PRODUCTS: Product[] = CATEGORIES.flatMap((cat, idx) => {
  return Array.from({ length: 8 }).map((_, itemIdx) => {
    const idNum = idx * 10 + itemIdx + 1;
    const pId = `prod_${idNum.toString().padStart(4, '0')}`;
    const weightVariation = 0.8 + pseudoRandom(idNum * 13) * 0.4;
    return {
      product_id: pId,
      product_category_name: cat.pt,
      product_category_name_english: cat.en,
      product_name_length: Math.floor(35 + pseudoRandom(idNum * 3) * 25),
      product_photos_qty: Math.floor(1 + pseudoRandom(idNum * 7) * 5),
      product_weight_g: Math.round(cat.weight * weightVariation),
      product_length_cm: Math.round(15 + pseudoRandom(idNum * 5) * 35),
      product_height_cm: Math.round(10 + pseudoRandom(idNum * 9) * 25),
      product_width_cm: Math.round(12 + pseudoRandom(idNum * 11) * 30),
    };
  });
});

export const SELLERS: Seller[] = Array.from({ length: 40 }).map((_, idx) => {
  const sId = `seller_${(idx + 1).toString().padStart(4, '0')}`;
  const state = STATES[idx % STATES.length];
  const cities = CITIES[state] || ['Capital City'];
  const city = cities[idx % cities.length];
  return {
    seller_id: sId,
    seller_zip_code_prefix: 10000 + idx * 230,
    seller_city: city,
    seller_state: state,
  };
});

// Generate 400 sample orders across 2017 - 2018
function generateOrdersData() {
  const customers: Customer[] = [];
  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];
  const orderPayments: OrderPayment[] = [];
  const orderReviews: OrderReview[] = [];

  const startDate = new Date('2017-01-01').getTime();
  const endDate = new Date('2018-08-31').getTime();

  for (let i = 1; i <= 350; i++) {
    const orderId = `ord_${i.toString().padStart(5, '0')}`;
    const custId = `cust_${i.toString().padStart(5, '0')}`;
    const custUniqueId = `usr_${(i % 280 + 1).toString().padStart(5, '0')}`; // Some repeat buyers
    const state = STATES[Math.floor(pseudoRandom(i * 17) * STATES.length)];
    const cities = CITIES[state] || ['Central City'];
    const city = cities[Math.floor(pseudoRandom(i * 19) * cities.length)];

    customers.push({
      customer_id: custId,
      customer_unique_id: custUniqueId,
      customer_zip_code_prefix: 13000 + (i % 800) * 15,
      customer_city: city,
      customer_state: state,
    });

    // Random order timestamps
    const purchaseTimestampMs = startDate + pseudoRandom(i * 31) * (endDate - startDate);
    const purchaseDate = new Date(purchaseTimestampMs);
    const approvedDate = new Date(purchaseTimestampMs + (0.5 + pseudoRandom(i * 3) * 12) * 3600 * 1000);
    
    // Delivery carrier date (1 to 3 days after approval)
    const carrierDate = new Date(approvedDate.getTime() + (1 + pseudoRandom(i * 7) * 3) * 86400 * 1000);

    // Delivery to customer (3 to 18 days)
    const deliveryDays = 3 + Math.floor(pseudoRandom(i * 13) * 15);
    const actualDeliveryDate = new Date(carrierDate.getTime() + deliveryDays * 86400 * 1000);

    // Estimated delivery date (usually 12 to 25 days from purchase)
    const estimatedDeliveryDays = 12 + Math.floor(pseudoRandom(i * 23) * 14);
    const estimatedDeliveryDate = new Date(purchaseDate.getTime() + estimatedDeliveryDays * 86400 * 1000);

    // Order status (92% delivered, 5% shipped, 2% canceled, 1% processing)
    const statusRand = pseudoRandom(i * 29);
    let status: 'delivered' | 'shipped' | 'canceled' | 'processing' | 'invoiced' = 'delivered';
    if (statusRand > 0.97) status = 'canceled';
    else if (statusRand > 0.94) status = 'shipped';
    else if (statusRand > 0.92) status = 'processing';

    orders.push({
      order_id: orderId,
      customer_id: custId,
      order_status: status,
      order_purchase_timestamp: purchaseDate.toISOString().replace('T', ' ').substring(0, 19),
      order_approved_at: approvedDate.toISOString().replace('T', ' ').substring(0, 19),
      order_delivered_carrier_date: carrierDate.toISOString().replace('T', ' ').substring(0, 19),
      order_delivered_customer_date: status === 'delivered' ? actualDeliveryDate.toISOString().replace('T', ' ').substring(0, 19) : '',
      order_estimated_delivery_date: estimatedDeliveryDate.toISOString().replace('T', ' ').substring(0, 19),
    });

    // Order Items (1 to 3 items per order)
    const itemsCount = pseudoRandom(i * 41) > 0.85 ? (pseudoRandom(i * 43) > 0.5 ? 3 : 2) : 1;
    let orderTotalPrice = 0;

    for (let itemIdx = 1; itemIdx <= itemsCount; itemIdx++) {
      const prod = PRODUCTS[Math.floor(pseudoRandom(i * 47 + itemIdx) * PRODUCTS.length)];
      const seller = SELLERS[Math.floor(pseudoRandom(i * 53 + itemIdx) * SELLERS.length)];
      const basePrice = prod.product_category_name_english === 'watches_gifts' ? 180 + pseudoRandom(i * 59) * 150 :
                        prod.product_category_name_english === 'bed_bath_table' ? 70 + pseudoRandom(i * 61) * 80 :
                        60 + pseudoRandom(i * 67) * 120;
      const price = parseFloat(basePrice.toFixed(2));
      const freight = parseFloat((12.5 + pseudoRandom(i * 71) * 28.0).toFixed(2));
      orderTotalPrice += price + freight;

      orderItems.push({
        order_id: orderId,
        order_item_id: itemIdx,
        product_id: prod.product_id,
        seller_id: seller.seller_id,
        shipping_limit_date: new Date(purchaseDate.getTime() + 5 * 86400 * 1000).toISOString().replace('T', ' ').substring(0, 19),
        price,
        freight_value: freight,
      });
    }

    // Order Payment
    const paymentRand = pseudoRandom(i * 73);
    const payType: 'credit_card' | 'boleto' | 'voucher' | 'debit_card' =
      paymentRand < 0.72 ? 'credit_card' :
      paymentRand < 0.88 ? 'boleto' :
      paymentRand < 0.95 ? 'voucher' : 'debit_card';

    const installments = payType === 'credit_card' ? Math.floor(1 + pseudoRandom(i * 79) * 9) : 1;

    orderPayments.push({
      order_id: orderId,
      payment_sequential: 1,
      payment_type: payType,
      payment_installments: installments,
      payment_value: parseFloat(orderTotalPrice.toFixed(2)),
    });

    // Order Review
    const isDelayed = status === 'delivered' && actualDeliveryDate > estimatedDeliveryDate;
    let reviewScore = 5;
    if (isDelayed) {
      reviewScore = pseudoRandom(i * 83) > 0.4 ? (pseudoRandom(i * 89) > 0.5 ? 1 : 2) : 3;
    } else {
      const scoreRand = pseudoRandom(i * 97);
      reviewScore = scoreRand < 0.65 ? 5 : scoreRand < 0.85 ? 4 : scoreRand < 0.93 ? 3 : scoreRand < 0.97 ? 2 : 1;
    }

    const reviewTitles = [
      'Excelente produto!', 'Entrega super rapida', 'Muito bom', 'Gostei bastante', 
      'Atendeu as expectativas', 'Demorou a chegar', 'Produto veio com avaria', 'Nao recomendo'
    ];

    orderReviews.push({
      review_id: `rev_${i.toString().padStart(5, '0')}`,
      order_id: orderId,
      review_score: reviewScore,
      review_comment_title: reviewTitles[5 - reviewScore] || 'Avaliacao do produto',
      review_comment_message: reviewScore >= 4 ? 'Produto chegou em perfeitas condicoes, recomendo a loja!' : 'Demorou mais do que o prazo estimado.',
      review_creation_date: new Date(purchaseDate.getTime() + 10 * 86400 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      review_answer_timestamp: new Date(purchaseDate.getTime() + 11 * 86400 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    });
  }

  return { customers, orders, orderItems, orderPayments, orderReviews };
}

const generatedData = generateOrdersData();

export const CUSTOMERS = generatedData.customers;
export const ORDERS = generatedData.orders;
export const ORDER_ITEMS = generatedData.orderItems;
export const ORDER_PAYMENTS = generatedData.orderPayments;
export const ORDER_REVIEWS = generatedData.orderReviews;

export const GEOLOCATION: Geolocation[] = [
  { geolocation_zip_code_prefix: 1000, geolocation_lat: -23.5489, geolocation_lng: -46.6388, geolocation_city: 'Sao Paulo', geolocation_state: 'SP' },
  { geolocation_zip_code_prefix: 2000, geolocation_lat: -22.9068, geolocation_lng: -43.1729, geolocation_city: 'Rio de Janeiro', geolocation_state: 'RJ' },
  { geolocation_zip_code_prefix: 3000, geolocation_lat: -19.9167, geolocation_lng: -43.9345, geolocation_city: 'Belo Horizonte', geolocation_state: 'MG' },
  { geolocation_zip_code_prefix: 8000, geolocation_lat: -25.4284, geolocation_lng: -49.2733, geolocation_city: 'Curitiba', geolocation_state: 'PR' },
  { geolocation_zip_code_prefix: 9000, geolocation_lat: -30.0346, geolocation_lng: -51.2177, geolocation_city: 'Porto Alegre', geolocation_state: 'RS' },
  { geolocation_zip_code_prefix: 4000, geolocation_lat: -12.9777, geolocation_lng: -38.5016, geolocation_city: 'Salvador', geolocation_state: 'BA' },
  { geolocation_zip_code_prefix: 7000, geolocation_lat: -15.7975, geolocation_lng: -47.8919, geolocation_city: 'Brasilia', geolocation_state: 'DF' },
];

export const OLIST_DATABASE = {
  olist_customers_dataset: CUSTOMERS,
  olist_orders_dataset: ORDERS,
  olist_order_items_dataset: ORDER_ITEMS,
  olist_products_dataset: PRODUCTS,
  olist_sellers_dataset: SELLERS,
  olist_order_payments_dataset: ORDER_PAYMENTS,
  olist_order_reviews_dataset: ORDER_REVIEWS,
  olist_geolocation_dataset: GEOLOCATION,
};
