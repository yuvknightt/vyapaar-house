export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are Vyapaar, a warm AI shopping assistant for Vyapaar House — a premium Indian textile marketplace.

PERSONALITY:
- Warm and knowledgeable about Indian textiles
- Naturally mix Hindi: "bilkul", "bahut sundar", "zaroor", "acha choice hai"
- Understand Indian occasions: weddings (shaadi), Diwali, Navratri, office wear
- Know fabrics: silk, cotton, georgette, chikankari, zardozi, kundan

TOOLS:
1. search_products - search catalogue by query/category/price (works without login)
2. get_product_details - get full product info (works without login)
3. add_to_cart - add to cart (requires login)
4. remove_from_cart - remove from cart (requires login)
5. get_cart - view cart (requires login)
6. get_my_orders - past orders (requires login)
7. place_order - place order with address (requires login)

RULES:
- ALWAYS call search_products before recommending — never guess
- For place_order: collect name, phone, street, city, state, pincode then confirm before placing
- NEVER place order without explicit user confirmation
- Understand Hindi/English mix: "saree dikhao", "budget 3000 hai", "cart mein daalo"
- If tool returns LOGIN_REQUIRED error, respond warmly: "Yeh feature ke liye login zaroori hai! Please /login page par jayein."
- Map occasions: wedding→silk sarees/kundan jewellery, Diwali→bright festive, office→cotton/chanderi
- Be concise — max 3-4 lines per response

OCCASION MAPPING:
- Wedding/shaadi → saree category, silk, kundan jewellery  
- Festival/Diwali/Navratri → bright sarees, traditional suits
- Office → chanderi, cotton sarees, subtle suits
- Casual → patiala suits, cotton sarees, kolhapuri sandals`;

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

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set in environment variables' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    const tools = [{
      function_declarations: [
        {
          name: 'search_products',
          description: 'Search products in catalogue by query, category or price range. Use for any product search.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'search term e.g. silk saree, wedding suit, kolhapuri' },
              category: { type: 'string', enum: ['all','saree','suit','sandals','purse','jewellery'] },
              max_price: { type: 'number', description: 'maximum price in INR' },
              min_price: { type: 'number', description: 'minimum price in INR' }
            }
          }
        },
        {
          name: 'get_product_details',
          description: 'Get full details of a specific product by ID',
          parameters: {
            type: 'object',
            properties: {
              product_id: { type: 'number', description: 'the product ID' }
            },
            required: ['product_id']
          }
        },
        {
          name: 'add_to_cart',
          description: 'Add a product to shopping cart by product ID',
          parameters: {
            type: 'object',
            properties: {
              product_id: { type: 'number', description: 'product ID to add' },
              quantity: { type: 'number', description: 'quantity to add, default 1' }
            },
            required: ['product_id']
          }
        },
        {
          name: 'remove_from_cart',
          description: 'Remove a product from cart by product ID',
          parameters: {
            type: 'object',
            properties: {
              product_id: { type: 'number', description: 'product ID to remove' }
            },
            required: ['product_id']
          }
        },
        {
          name: 'get_cart',
          description: 'Get current cart contents and total amount',
          parameters: { type: 'object', properties: {} }
        },
        {
          name: 'get_my_orders',
          description: 'Get user past order history',
          parameters: { type: 'object', properties: {} }
        },
        {
          name: 'place_order',
          description: 'Place order with delivery address. Collect all fields before calling.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'full name' },
              phone: { type: 'string', description: '10 digit phone' },
              street: { type: 'string', description: 'street address' },
              city: { type: 'string', description: 'city name' },
              state: { type: 'string', description: 'state name' },
              pincode: { type: 'string', description: '6 digit pincode' }
            },
            required: ['name','phone','street','city','state','pincode']
          }
        }
      ]
    }];

    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: Array.isArray(m.parts) ? m.parts : [{ text: m.content || '' }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiMessages,
          tools,
          tool_config: { function_calling_config: { mode: 'AUTO' } },
          generation_config: { max_output_tokens: 1024, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Gemini API error' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
