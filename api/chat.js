export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are Vyapaar, a warm AI shopping assistant for Vyapaar House — a premium Indian textile marketplace.

You help customers shop for sarees, suits, sandals, purses and jewellery.

PERSONALITY:
- Warm and knowledgeable about Indian textiles
- Naturally mix Hindi: "bilkul", "bahut sundar", "zaroor", "acha choice hai", "ji zaroor"
- Understand Indian occasions: weddings (shaadi), Diwali, Navratri, office wear, casual
- Know fabrics: silk, cotton, georgette, chikankari, zardozi, kundan

TOOLS YOU HAVE:
1. search_products - search catalogue by query/category/price
2. get_product_details - get full info of one product by ID
3. add_to_cart - add product to cart
4. remove_from_cart - remove product from cart  
5. get_cart - show current cart contents
6. get_my_orders - show user's past orders
7. place_order - place order with delivery address (collects name, phone, street, city, state, pincode)

RULES:
- ALWAYS call search_products before recommending — never guess products
- For place_order: collect ALL address fields first (name, phone, street, city, state, pincode), then confirm with user before placing
- NEVER place order without explicit user confirmation
- Understand mixed Hindi/English: "saree dikhao", "budget 3000 hai", "cart mein daalo", "order karo"
- Map occasions smartly: wedding→silk sarees/kundan jewellery, Diwali→bright festive, office→cotton/chanderi
- After adding to cart always mention cart total
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
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { messages } = await req.json();

    const tools = [{
      function_declarations: [
        {
          name: 'search_products',
          description: 'Search products in catalogue by query, category or price range',
          parameters: {
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
          parameters: {
            type: 'object',
            properties: {
              product_id: { type: 'number', description: 'product ID' }
            },
            required: ['product_id']
          }
        },
        {
          name: 'add_to_cart',
          description: 'Add a product to shopping cart',
          parameters: {
            type: 'object',
            properties: {
              product_id: { type: 'number', description: 'product ID to add' },
              quantity: { type: 'number', description: 'quantity, default 1' }
            },
            required: ['product_id']
          }
        },
        {
          name: 'remove_from_cart',
          description: 'Remove a product from cart',
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
          description: 'Get current cart contents and total',
          parameters: { type: 'object', properties: {} }
        },
        {
          name: 'get_my_orders',
          description: 'Get user past orders from order history',
          parameters: { type: 'object', properties: {} }
        },
        {
          name: 'place_order',
          description: 'Place an order with delivery address. Collect all address fields before calling.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'full name' },
              phone: { type: 'string', description: '10 digit phone number' },
              street: { type: 'string', description: 'street address' },
              city: { type: 'string', description: 'city' },
              state: { type: 'string', description: 'state' },
              pincode: { type: 'string', description: '6 digit pincode' }
            },
            required: ['name', 'phone', 'street', 'city', 'state', 'pincode']
          }
        }
      ]
    }];

    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: Array.isArray(m.parts) ? m.parts : [{ text: m.content || '' }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
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
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
