export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const KV_URL        = process.env.KV_REST_API_URL;
  const KV_TOKEN      = process.env.KV_REST_API_TOKEN;

  if (!ANTHROPIC_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (KV_URL && KV_TOKEN) {
    const rl = await checkTokenBucket(ip, KV_URL, KV_TOKEN);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Bahut zyada requests! Please wait ${rl.retryAfter} seconds.`,
          hindi: 'बहुत अधिक अनुरोध। कृपया प्रतीक्षा करें।',
          retryAfter: rl.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rl.retryAfter),
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
  }

  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Claude API error' }),
        { status: response.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

const SYSTEM_PROMPT = `You are Vyapaar, a warm AI shopping assistant for Vyapaar House — a premium Indian textile marketplace selling sarees, suits, sandals, purses and jewellery.

PERSONALITY:
- Warm and knowledgeable about Indian textiles
- Naturally mix Hindi: "bilkul", "bahut sundar", "zaroor", "acha choice hai"
- Understand Indian occasions: weddings (shaadi), Diwali, Navratri, office wear
- Know fabrics: silk, cotton, georgette, chikankari, zardozi, kundan

TOOLS YOU HAVE:
1. search_products - search catalogue by query/category/price
2. get_product_details - get full info of one product by ID
3. add_to_cart - add product to cart
4. remove_from_cart - remove product from cart
5. get_cart - show current cart contents
6. get_my_orders - show user past orders
7. place_order - place order with delivery address

RULES:
- ALWAYS call search_products before recommending
- For place_order: collect ALL address fields first then confirm with user
- NEVER place order without explicit user confirmation
- Understand mixed Hindi/English: "saree dikhao", "budget 3000 hai", "cart mein daalo"
- If tool returns LOGIN_REQUIRED, tell user warmly to login at /login
- Map occasions: wedding->silk sarees/kundan, Diwali->festive, office->cotton/chanderi
- Be concise — max 3-4 lines per response`;

const TOOLS = [
  {
    name: 'search_products',
    description: 'Search products in catalogue by query, category or price range.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'search term e.g. silk saree, wedding suit' },
        category: { type: 'string', enum: ['all','saree','suit','sandals','purse','jewellery'] },
        max_price: { type: 'number', description: 'max price in INR' },
        min_price: { type: 'number', description: 'min price in INR' }
      }
    }
  },
  {
    name: 'get_product_details',
    description: 'Get full details of a specific product by ID',
    input_schema: {
      type: 'object',
      properties: { product_id: { type: 'number' } },
      required: ['product_id']
    }
  },
  {
    name: 'add_to_cart',
    description: 'Add a product to shopping cart',
    input_schema: {
      type: 'object',
      properties: {
        product_id: { type: 'number' },
        quantity: { type: 'number', description: 'default 1' }
      },
      required: ['product_id']
    }
  },
  {
    name: 'remove_from_cart',
    description: 'Remove a product from cart',
    input_schema: {
      type: 'object',
      properties: { product_id: { type: 'number' } },
      required: ['product_id']
    }
  },
  {
    name: 'get_cart',
    description: 'Get current cart contents and total',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'get_my_orders',
    description: 'Get user past order history',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'place_order',
    description: 'Place order. First collect address, then ask payment preference: ONLINE (Razorpay) or COD (Cash on Delivery).',
    input_schema: {
      type: 'object',
      properties: {
        name:           { type: 'string', description: 'full name' },
        phone:          { type: 'string', description: '10 digit phone' },
        street:         { type: 'string', description: 'street address' },
        city:           { type: 'string', description: 'city name' },
        state:          { type: 'string', description: 'state name' },
        pincode:        { type: 'string', description: '6 digit pincode' },
        payment_method: { type: 'string', enum: ['ONLINE', 'COD'], description: 'ONLINE for Razorpay, COD for cash on delivery' }
      },
      required: ['name','phone','street','city','state','pincode','payment_method']
    }
  },
];

async function getKV(kvUrl, kvToken, key) {
  try {
    const res = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.result) return null;
    return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
  } catch { return null; }
}

async function setKV(kvUrl, kvToken, key, value, exSeconds) {
  try {
    const url = exSeconds
      ? `${kvUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}?ex=${exSeconds}`
      : `${kvUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`;
    await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${kvToken}` }
    });
  } catch {}
}

async function checkTokenBucket(ip, kvUrl, kvToken) {
  const BUCKET_CAPACITY = 10;
  const REFILL_RATE     = 5;
  const REFILL_EVERY_MS = 60_000;
  const key             = `rl:chat:${ip}`;
  const now             = Date.now();

  let bucket = await getKV(kvUrl, kvToken, key);

  if (!bucket) {
    bucket = { tokens: BUCKET_CAPACITY - 1, lastRefill: now };
    await setKV(kvUrl, kvToken, key, bucket, 300);
    return { allowed: true, remaining: bucket.tokens, retryAfter: 0 };
  }

  const elapsed      = now - bucket.lastRefill;
  const refillCycles = Math.floor(elapsed / REFILL_EVERY_MS);

  if (refillCycles > 0) {
    bucket.tokens     = Math.min(BUCKET_CAPACITY, bucket.tokens + refillCycles * REFILL_RATE);
    bucket.lastRefill = bucket.lastRefill + refillCycles * REFILL_EVERY_MS;
  }

  if (bucket.tokens <= 0) {
    const retryAfter = Math.ceil((REFILL_EVERY_MS - (now - bucket.lastRefill)) / 1000);
    await setKV(kvUrl, kvToken, key, bucket, 300);
    return { allowed: false, remaining: 0, retryAfter };
  }

  bucket.tokens -= 1;
  await setKV(kvUrl, kvToken, key, bucket, 300);
  return { allowed: true, remaining: bucket.tokens, retryAfter: 0 };
}
