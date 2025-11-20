const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const COURIER_URL = process.env.COURIER_URL || 'http://localhost:3000';
const SHARED_SECRET = process.env.SHARED_SECRET || 'tajne-heslo-123';

const ORDERS_FILE = path.join(__dirname, 'orders.json');


let orders = {}; 

function loadOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      orders = JSON.parse(data);
      console.log(`📂 Nacteno ${Object.keys(orders).length} objednavek z ${ORDERS_FILE}`);
    }
  } catch (error) {
    console.error('❌ Chyba pri nactani orders.json:', error.message);
    orders = {};
  }
}

function saveOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Chyba pri ukladani orders.json:', error.message);
  }
}


loadOrders();

app.use(cors());


app.post('/update', express.raw({ type: 'application/json' }), (req, res) => {
 
  const rawBody = req.body.toString('utf8');
  const data = JSON.parse(rawBody);
  const { id, status, event_id, timestamp } = data;
  
  const sigHeader = (req.get('X-Signature') || '').trim();
  const expectedSig = crypto
    .createHmac('sha256', SHARED_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex');


  if (sigHeader !== expectedSig) {
    console.log(`❌ [ULOHA 5] Neplatny podpis`);
    console.log(`   Ocekavano: ${expectedSig.substring(0, 20)}...`);
    console.log(`   Obdrzeno: ${sigHeader.substring(0, 20)}...`);
    return res.status(401).json({ error: 'Invalid signature' });
  }


  if (!orders[id]) {
    orders[id] = {
      id,
      status,
      history: [],
      createdAt: new Date().toISOString()
    };
  }

  orders[id].status = status;
  orders[id].history.push({
    status,
    timestamp,
    event_id
  });

  saveOrders();

  console.log(` ${id}: ${status}`);
  console.log(`   Podpis: platny ✓`);
  res.status(200).json({ message: 'Update received' });
});
app.use(express.json());


app.get('/orders', (req, res) => {
  res.json(Object.values(orders));
});


app.post('/orders/create', async (req, res) => {
  const orderId = `obj-${Date.now()}`;
  

  let callbackUrl;
  if (process.env.CALLBACK_URL) {
    callbackUrl = process.env.CALLBACK_URL;
  } else {
 
    const host = req.get('host');
    callbackUrl = `${req.protocol}://${host}/update`;
  }
  
  const finalCallbackUrl = callbackUrl;

  const order = {
    id: orderId,
    callbackUrl: finalCallbackUrl
  };


  orders[orderId] = {
    id: orderId,
    status: 'Zadost o objednavku',
    history: [],
    createdAt: new Date().toISOString()
  };

  saveOrders(); 
  console.log(`\n[RESTAURANT ROBIN&SAM] Nova objednavka ${orderId}`);
  console.log(`   Callback URL: ${finalCallbackUrl}`);
  console.log(`   Cilovy kuryrni server: ${COURIER_URL}`);

  try {

    const response = await fetch(`${COURIER_URL}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(` [ULOHA 1] Kuryr prijal objednavku (202 Accepted)`);
      console.log(`   Cekam na webhook notifikace...`);
      res.status(201).json({ 
        message: 'Order created', 
        order: orders[orderId] 
      });
    } else {
      console.log(`❌ Kuryr odmitl objednavku: ${response.status}`);
      res.status(response.status).json({ error: 'Courier rejected order' });
    }
  } catch (error) {
    console.error(`❌ Chyba pri komunikaci s kuryrem:`, error.message);
    console.error(`   Ujisti se, ze kuryr bezi na: ${COURIER_URL}`);
    res.status(503).json({ error: 'Cannot reach courier service' });
  }
});


app.get('/', (req, res) => {
  res.json({ 
    service: 'Restaurant Server',
    status: 'running',
    courierUrl: COURIER_URL,
    ordersCount: Object.keys(orders).length,
    endpoints: {
      'POST /orders/create': 'Vytvor novou objednavku',
      'GET /orders': 'Seznam vsech objednavek',
      'POST /update': 'Webhook endpoint (vola courier)',
      'GET /health': 'Health check'
    },
    frontend: 'Spust: cd client && npm run dev'
  });
});


app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'restaurant-server',
    courierUrl: COURIER_URL,
    ordersCount: Object.keys(orders).length
  });
});

app.listen(PORT, () => {
  console.log(` Restaurant Server bezi na http://localhost:${PORT}`);
});

