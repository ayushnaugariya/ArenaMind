/**
 * ArenaMind AI — main.js
 * Intelligent Stadium Experience System
 * All modules: Crowd, Queue, Navigation, Assistant, Ordering, Alerts, Map
 */

// ============================================================
// STADIUM DATA MODEL
// ============================================================

const ZONES = [
  { id: 'ga', name: 'Gate A', type: 'gate', base: 85 },
  { id: 'gb', name: 'Gate B', type: 'gate', base: 62 },
  { id: 'gc', name: 'Gate C', type: 'gate', base: 38 },
  { id: 'gd', name: 'Gate D', type: 'gate', base: 25 },
  { id: 'ge', name: 'Gate E', type: 'gate', base: 45 },
  { id: 'sa', name: 'Section A', type: 'section', base: 90 },
  { id: 'sb', name: 'Section B', type: 'section', base: 70 },
  { id: 'sc', name: 'Section C', type: 'section', base: 55 },
  { id: 'sd', name: 'Section D', type: 'section', base: 40 },
  { id: 'se', name: 'Section E', type: 'section', base: 30 },
  { id: 'fc', name: 'Food Court', type: 'food', base: 78 },
  { id: 'rn', name: 'Restroom N', type: 'restroom', base: 65 },
  { id: 'rs', name: 'Restroom S', type: 'restroom', base: 35 },
  { id: 'ms', name: 'Merch Shop', type: 'merch', base: 50 },
  { id: 'vip', name: 'VIP Lounge', type: 'vip', base: 20 },
];

const QUEUE_POINTS = [
  { id: 'pizza', name: 'Pizza Stall', type: 'food', emoji: '🍕', serviceRate: 12, queueBase: 60 },
  { id: 'burger', name: 'Burger Stall', type: 'food', emoji: '🍔', serviceRate: 6, queueBase: 85 },
  { id: 'hotdog', name: 'Hotdog Stall', type: 'food', emoji: '🌭', serviceRate: 15, queueBase: 135 },
  { id: 'drinks', name: 'Drinks Bar', type: 'food', emoji: '🥤', serviceRate: 18, queueBase: 90 },
  { id: 'rest_n', name: 'North Restroom', type: 'restroom', emoji: '🚻', serviceRate: 10, queueBase: 65 },
  { id: 'rest_s', name: 'South Restroom', type: 'restroom', emoji: '🚻', serviceRate: 10, queueBase: 35 },
  { id: 'merch_main', name: 'Main Merch', type: 'merch', emoji: '👕', serviceRate: 4, queueBase: 50 },
  { id: 'merch_kiosk', name: 'Merch Kiosk', type: 'merch', emoji: '🏷️', serviceRate: 7, queueBase: 28 },
];

const MENU_ITEMS = {
  food: [
    { id: 'm1', name: 'Pizza Slice', emoji: '🍕', price: 220, category: 'food' },
    { id: 'm2', name: 'Burger', emoji: '🍔', price: 280, category: 'food' },
    { id: 'm3', name: 'Hotdog', emoji: '🌭', price: 150, category: 'food' },
    { id: 'm4', name: 'Nachos', emoji: '🫔', price: 180, category: 'food' },
    { id: 'm5', name: 'Sandwich', emoji: '🥪', price: 160, category: 'food' },
    { id: 'm6', name: 'Biryani', emoji: '🍛', price: 250, category: 'food' },
  ],
  drinks: [
    { id: 'd1', name: 'Cola', emoji: '🥤', price: 80, category: 'drinks' },
    { id: 'd2', name: 'Water', emoji: '💧', price: 40, category: 'drinks' },
    { id: 'd3', name: 'Lemonade', emoji: '🍋', price: 100, category: 'drinks' },
    { id: 'd4', name: 'Energy Drink', emoji: '⚡', price: 130, category: 'drinks' },
  ],
  snacks: [
    { id: 's1', name: 'Popcorn', emoji: '🍿', price: 90, category: 'snacks' },
    { id: 's2', name: 'Chips', emoji: '🥔', price: 70, category: 'snacks' },
    { id: 's3', name: 'Ice Cream', emoji: '🍦', price: 120, category: 'snacks' },
    { id: 's4', name: 'Peanuts', emoji: '🥜', price: 60, category: 'snacks' },
  ],
};

// Route graph
const ROUTES = {
  'A1': { 'food_pizza': ['A1', 'Corridor A', 'Food Court', 'Pizza Stall'], 'food_burger': ['A1', 'Corridor A', 'Gate B Passage', 'Burger Stall'], 'restroom_north': ['A1', 'Concourse North', 'North Restroom'], 'gate_a': ['A1', 'Gate A (CONGESTED)'], 'gate_b': ['A1', 'Corridor A', 'Gate B'], 'gate_c': ['A1', 'Corridor A', 'Main Concourse', 'Gate C'], 'gate_d': ['A1', 'Corridor A', 'Gate D'], 'merch': ['A1', 'Corridor A', 'Main Concourse', 'Merch Shop'], 'medic': ['A1', 'Corridor A', 'Medical Station'] },
  'B1': { 'food_pizza': ['B1', 'Corridor B', 'Pizza Stall'], 'food_burger': ['B1', 'West Pass', 'Burger Stall'], 'restroom_south': ['B1', 'Concourse South', 'South Restroom'], 'gate_a': ['B1', 'Gate A (CONGESTED — avoid)'], 'gate_b': ['B1', 'Gate B (busy)'], 'gate_c': ['B1', 'Corridor B', 'Gate C'], 'gate_d': ['B1', 'Corridor B', 'Gate D (clear)'], 'merch': ['B1', 'Corridor B', 'Merch Kiosk'], 'medic': ['B1', 'Corridor B', 'Medical Station'] },
  'C1': { 'food_pizza': ['C1', 'Corridor C', 'Pizza Stall'], 'food_hotdog': ['C1', 'Corridor C', 'Hotdog Stall'], 'restroom_north': ['C1', 'Corridor C', 'North Restroom'], 'gate_c': ['C1', 'Gate C'], 'gate_d': ['C1', 'South Pass', 'Gate D'], 'merch': ['C1', 'Corridor C', 'Merch Shop'], 'medic': ['C1', 'Corridor C', 'Medical Station'] },
};
// Fallback route builder
function buildRoute(from, to) {
  if (ROUTES[from] && ROUTES[from][to]) return ROUTES[from][to];
  return [from, 'Main Concourse', to.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())];
}

// ============================================================
// STATE
// ============================================================
let crowdData = {};
let queueData = {};
let cartItems = [];
let currentMenuCat = 'food';
let currentQueueFilter = 'all';
let alertLog = [];
let mapInitialized = false;
let googleMapObj = null;
let currentApiKey = secureGetStorage('arenamind_google_key') || null;

// ============================================================
// UTILITIES
// ============================================================
function jitter(base, spread = 15) {
  return Math.max(1, Math.min(100, base + (Math.random() - 0.5) * spread));
}
function timeNow() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function densityClass(pct) {
  if (pct < 40) return 'low';
  if (pct < 70) return 'med';
  return 'high';
}
function densityLabel(pct) {
  if (pct < 40) return 'Low';
  if (pct < 70) return 'Medium';
  return 'High';
}
function waitClass(min) {
  if (min <= 7) return 'wait-low';
  if (min <= 14) return 'wait-med';
  return 'wait-high';
}
function queueStatus(min) {
  if (min <= 7) return '<span class="status-dot sdot-open"></span>Open';
  if (min <= 14) return '<span class="status-dot sdot-busy"></span>Busy';
  return '<span class="status-dot sdot-full"></span>Full';
}

// ============================================================
// CROWD DATA ENGINE
// ============================================================
function updateCrowdData() {
  ZONES.forEach(z => {
    const prev = crowdData[z.id] || z.base;
    crowdData[z.id] = Math.round(jitter(prev, 10));
  });
}

function updateQueueData() {
  QUEUE_POINTS.forEach(q => {
    const prev = queueData[q.id] !== undefined ? queueData[q.id] : q.queueBase;
    const newQ = Math.max(2, Math.min(200, prev + (Math.random() - 0.48) * 20));
    queueData[q.id] = Math.round(newQ);
  });
}

function getWaitTime(queueId) {
  const qp = QUEUE_POINTS.find(q => q.id === queueId);
  if (!qp) return 0;
  return Math.ceil(queueData[qp.id] / qp.serviceRate);
}

// ============================================================
// ALERTS ENGINE
// ============================================================
const ALERT_TEMPLATES = [
  { type:'danger', fn: () => { const z = ZONES.filter(z => (crowdData[z.id]||0) > 75); if(z.length) return `⚠ ${z[Math.floor(Math.random()*z.length)].name} is overcrowded`; return null; } },
  { type:'warning', fn: () => { const q = QUEUE_POINTS.filter(q => getWaitTime(q.id) > 15); if(q.length) return `⏳ ${q[Math.floor(Math.random()*q.length)].name} wait: ${getWaitTime(q[0].id)} min`; return null; } },
  { type:'info', fn: () => { const msgs = ['🏟 Halftime starts in 5 minutes — head to stalls now!', '📣 Fan zone activity at Gate C', '🎵 Live music at North Concourse', '⚽ Match resumes in 2 minutes — return to seats!']; return msgs[Math.floor(Math.random()*msgs.length)]; } },
];

function generateAlert() {
  const tmpl = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];
  const msg = tmpl.fn();
  if (!msg) return;
  alertLog.unshift({ type: tmpl.type, msg, time: timeNow() });
  if (alertLog.length > 20) alertLog.pop();
  renderAlerts();
}

function renderAlerts() {
  const strip = document.getElementById('alertsStrip');
  const mini = document.getElementById('alertsMini');
  const statAlerts = document.getElementById('statAlerts');

  // Strip (top bar)
  const recent = alertLog.slice(0, 5);
  strip.innerHTML = recent.map(a =>
    `<div class="alert-chip ${a.type === 'danger' ? 'danger' : a.type === 'info' ? 'info' : ''}">${a.msg}</div>`
  ).join('');

  // Mini card
  if (mini) {
    mini.innerHTML = alertLog.slice(0, 5).map(a =>
      `<div class="am-item"><span class="am-icon">${a.type==='danger'?'🔴':a.type==='info'?'🔵':'🟡'}</span><span>${a.msg}</span><span style="margin-left:auto;color:var(--text-muted);font-size:10px">${a.time}</span></div>`
    ).join('');
  }

  if (statAlerts) statAlerts.textContent = alertLog.slice(0,10).filter(a=>a.type==='danger'||a.type==='warning').length;
}

// ============================================================
// HEATMAP RENDERING
// ============================================================
function renderMiniHeatmap() {
  const el = document.getElementById('miniHeatmap');
  if (!el) return;
  el.innerHTML = ZONES.slice(0,10).map(z => {
    const pct = crowdData[z.id] || 0;
    const cls = densityClass(pct);
    return `<div class="mini-zone zone-${cls}"><strong>${pct}%</strong><span class="zone-name">${z.name}</span></div>`;
  }).join('');
}

function renderFullHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;
  grid.innerHTML = ZONES.map(z => {
    const pct = crowdData[z.id] || 0;
    const cls = densityClass(pct);
    const trend = Math.random() > 0.5 ? '↑' : '↓';
    return `<div class="hm-zone ${cls}">
      <div class="hm-name">${z.name}</div>
      <span class="hm-pct">${pct}%</span>
      <div class="hm-label">${densityLabel(pct)}</div>
      <div class="hm-trend" style="color:${trend==='↑'?'#ff6b35':'#00ff88'}">${trend} ${Math.floor(Math.random()*5)+1}%</div>
    </div>`;
  }).join('');

  // Stats
  const vals = ZONES.map(z => ({ name: z.name, pct: crowdData[z.id] || 0 }));
  const most = vals.reduce((a,b) => a.pct > b.pct ? a : b);
  const least = vals.reduce((a,b) => a.pct < b.pct ? a : b);
  const avg = Math.round(vals.reduce((s,v) => s + v.pct, 0) / vals.length);
  const hsMost = document.getElementById('hsMost');
  const hsLeast = document.getElementById('hsLeast');
  const hsAvg = document.getElementById('hsAvg');
  if (hsMost) hsMost.textContent = `${most.name} (${most.pct}%)`;
  if (hsLeast) hsLeast.textContent = `${least.name} (${least.pct}%)`;
  if (hsAvg) hsAvg.textContent = `${avg}%`;
}

// ============================================================
// QUEUE RENDERING
// ============================================================
function renderQueueTable() {
  const tbody = document.getElementById('queueBody');
  if (!tbody) return;
  const filtered = currentQueueFilter === 'all' ? QUEUE_POINTS : QUEUE_POINTS.filter(q => q.type === currentQueueFilter);
  const waits = filtered.map(q => ({ ...q, wait: getWaitTime(q.id), q: queueData[q.id] || 0 }));
  const minWait = Math.min(...waits.map(w => w.wait));

  tbody.innerHTML = waits.map(w =>
    `<tr class="${w.wait === minWait ? 'best-row' : ''}">
      <td>${w.emoji} ${w.name}</td>
      <td style="text-transform:capitalize">${w.type}</td>
      <td>${w.q} people</td>
      <td>${w.serviceRate}/min</td>
      <td><span class="wait-chip ${waitClass(w.wait)}">${w.wait} min</span></td>
      <td>${queueStatus(w.wait)}</td>
    </tr>`
  ).join('');

  const best = waits.find(w => w.wait === minWait);
  const queueRec = document.getElementById('queueRec');
  if (queueRec && best) {
    queueRec.innerHTML = `💡 <strong>Recommendation:</strong> Head to <strong>${best.emoji} ${best.name}</strong> — shortest wait of <strong>${best.wait} minutes</strong>. ${minWait <= 5 ? 'Go now before it gets busier!' : ''}`;
  }
}

function renderQueueMini() {
  const el = document.getElementById('queueMini');
  if (!el) return;
  const waits = QUEUE_POINTS.map(q => ({ ...q, wait: getWaitTime(q.id) })).sort((a,b) => a.wait - b.wait);
  el.innerHTML = waits.slice(0,5).map(w =>
    `<div class="qm-item"><span class="qm-name">${w.emoji} ${w.name}</span><span class="qm-wait ${w.wait<=7?'qm-best':w.wait<=14?'qm-avg':'qm-bad'}">${w.wait}m</span></div>`
  ).join('');

  // Update best food stat
  const bestFood = QUEUE_POINTS.filter(q=>q.type==='food').map(q=>({...q,wait:getWaitTime(q.id)})).sort((a,b)=>a.wait-b.wait)[0];
  const sf = document.getElementById('statBestFood');
  const statWait = document.getElementById('statWait');
  if (sf && bestFood) sf.textContent = bestFood.name.replace(' Stall','');
  if (statWait) statWait.textContent = (waits.reduce((s,w)=>s+w.wait,0)/waits.length).toFixed(1)+' min';
}

// ============================================================
// SURGE CHART
// ============================================================
function renderSurgeChart() {
  const el = document.getElementById('surgeChart');
  if (!el) return;
  const labels = ['Now','5m','10m','15m','20m','25m','30m'];
  const avgNow = Math.round(ZONES.reduce((s,z)=>s+(crowdData[z.id]||0),0)/ZONES.length);
  const vals = [avgNow, avgNow+5, avgNow+12, avgNow+18, avgNow+10, avgNow+4, avgNow-2].map(v=>Math.min(100,Math.max(5,v)));
  el.innerHTML = labels.map((l,i) => {
    const h = `${vals[i]}%`;
    const color = vals[i]>70?'#ff3355':vals[i]>50?'#ffcc00':'#00ff88';
    return `<div class="surge-bar-wrap">
      <div class="surge-bar" style="height:${h};background:${color};opacity:0.8"></div>
      <span class="surge-label">${l}</span>
    </div>`;
  }).join('');
}

// ============================================================
// NAVIGATION
// ============================================================
function findRoute() {
  const start = document.getElementById('navFrom').value;
  const end = document.getElementById('navTo').value;
  const result = document.getElementById('routeResult');
  
  if (!start || !end) return;

  const startName = ZONES.find(z => z.id === start)?.name || start;
  const endName = end.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

  // Simulate complex pathfinding logic
  const intermediateNodes = ['Concourse Alpha', 'Stairwell B', 'Level 2 Plaza'];
  const pathHtml = `
    <div class="rp-node start">📍 ${startName}</div>
    <div class="rp-arrow">→</div>
    ${intermediateNodes.map(node => `
      <div class="rp-node">${node}</div>
      <div class="rp-arrow">→</div>
    `).join('')}
    <div class="rp-node end">🎯 ${endName}</div>
  `;

  document.getElementById('routePath').innerHTML = pathHtml;
  document.getElementById('routeTime').textContent = (8 + Math.floor(Math.random() * 5)) + ' min';
  document.getElementById('routeDist').textContent = (340 + Math.floor(Math.random() * 100)) + 'm';
  document.getElementById('routeCrowd').textContent = 'Low (optimized path)';
  
  result.classList.remove('hidden');
}

// ============================================================
// AI ASSISTANT
// ============================================================
function getAIResponse(query) {
  const q = query.toLowerCase();
  const gates = ZONES.filter(z=>z.type==='gate').sort((a,b)=>(crowdData[a.id]||0)-(crowdData[b.id]||0));
  const foodQueues = QUEUE_POINTS.filter(q=>q.type==='food').map(q=>({...q,wait:getWaitTime(q.id)})).sort((a,b)=>a.wait-b.wait);
  const restrooms = QUEUE_POINTS.filter(q=>q.type==='restroom').map(q=>({...q,wait:getWaitTime(q.id)})).sort((a,b)=>a.wait-b.wait);
  const bestExit = gates[0];
  const worstGate = gates[gates.length-1];

  if (q.includes('gate') || q.includes('exit') || q.includes('crowd')) {
    return `🚪 **Gate Status Update:**\n\n✅ **${bestExit.name}** is currently the least crowded at **${crowdData[bestExit.id]}% capacity** — recommended for easy movement.\n\n⚠️ **${worstGate.name}** is congested at **${crowdData[worstGate.id]}%** — I'd suggest avoiding it right now.\n\nAll gates: ${gates.map(g=>`${g.name} (${crowdData[g.id]}%)`).join(', ')}.`;
  }

  if (q.includes('food') || q.includes('eat') || q.includes('buy') || q.includes('stall') || q.includes('quick')) {
    return `🍕 **Best Food Options Right Now:**\n\n⭐ **${foodQueues[0].emoji} ${foodQueues[0].name}** — only **${foodQueues[0].wait} min wait**. Head there now!\n\n📊 All stalls:\n${foodQueues.map((f,i)=>`${i+1}. ${f.emoji} ${f.name}: ${f.wait} min`).join('\n')}\n\nTip: The surge predictor shows food courts get busier in ~10 min — ideal time to order now!`;
  }

  if (q.includes('restroom') || q.includes('bathroom') || q.includes('toilet') || q.includes('washroom')) {
    return `🚻 **Restroom Recommendations:**\n\n✅ **${restrooms[0].name}** has the shortest wait: **${restrooms[0].wait} minutes**.\n\n${restrooms[1].name} wait: ${restrooms[1].wait} min.\n\nFor fastest access, use ${restrooms[0].name} — it's operating at lower capacity right now.`;
  }

  if (q.includes('route') || q.includes('get to') || q.includes('navigate') || q.includes('direction')) {
    return `🧭 **Navigation Help:**\n\nUse the **Smart Routes** tab for turn-by-turn navigation! I analyze real-time crowd data to route you through the least congested paths.\n\nCurrently, the clearest corridor is through **Gate ${bestExit.name.split(' ')[1]}** — ${crowdData[bestExit.id]}% occupancy.\n\nAvoid **${worstGate.name}** area — ${crowdData[worstGate.id]}% crowded right now.`;
  }

  if (q.includes('merch') || q.includes('shop') || q.includes('merchandise') || q.includes('jersey')) {
    const merchQueues = QUEUE_POINTS.filter(q=>q.type==='merch').map(q=>({...q,wait:getWaitTime(q.id)})).sort((a,b)=>a.wait-b.wait);
    return `👕 **Merchandise Recommendations:**\n\n✅ **${merchQueues[0].emoji} ${merchQueues[0].name}** — **${merchQueues[0].wait} min wait** — Best option now!\n\n📊 All merch points:\n${merchQueues.map((m,i)=>`${i+1}. ${m.emoji} ${m.name}: ${m.wait} min`).join('\n')}\n\nHalftime is the best time — lower crowds in merch areas during active play.`;
  }

  if (q.includes('parking') || q.includes('park')) {
    return `🅿️ **Parking Info:**\n\nBased on current gate congestion:\n\n✅ **East Parking** (near Gate D/E) — Currently clearest exit route.\n⚠️ **West Parking** (near Gate A) — Expect delays, Gate A is congested.\n\nRecommendation: If you're leaving via west parking, plan to exit 15 minutes early to avoid the rush.`;
  }

  if (q.includes('situation') || q.includes('update') || q.includes('right now') || q.includes('overview')) {
    const avgCrowd = Math.round(ZONES.reduce((s,z)=>s+(crowdData[z.id]||0),0)/ZONES.length);
    const alerts = alertLog.slice(0,3).map(a=>a.msg).join('\n');
    return `📊 **Current Stadium Situation (${timeNow()}):**\n\nAverage occupancy: **${avgCrowd}%**\n\n🚪 Best gate: ${bestExit.name} (${crowdData[bestExit.id]}%)\n🍕 Fastest food: ${foodQueues[0].emoji} ${foodQueues[0].name} (${foodQueues[0].wait}m wait)\n🚻 Best restroom: ${restrooms[0].name} (${restrooms[0].wait}m)\n\n📣 Recent alerts:\n${alerts}\n\nOverall: Stadium is running ${avgCrowd < 60 ? '✅ smoothly' : avgCrowd < 75 ? '🟡 at moderate capacity' : '🔴 at high capacity — plan carefully'}.`;
  }

  if (q.includes('order') || q.includes('seat') || q.includes('deliver')) {
    return `📱 **Seat Ordering:**\n\nYou can order food directly to your seat! Use the **Seat Ordering** tab in the left navigation.\n\nBenefits:\n✅ Skip all queues\n✅ Delivered in ~8–12 minutes\n✅ No missing match action\n\nJust enter your seat number and choose from the full menu. Payment processed at delivery.`;
  }

  if (q.includes('emergency') || q.includes('safe') || q.includes('evacuate') || q.includes('help')) {
    return `🚨 **Safety Information:**\n\nIf there is an emergency:\n1️⃣ Use the **EMERGENCY button** in the top right\n2️⃣ The system will show **safest evacuation routes**\n3️⃣ Currently: **Gate D** and **Gate E** are the clearest exits\n\nFor medical assistance, proceed to the **Medical Station** near Section C. Staff are stationed there at all times.\n\nStay calm and follow steward instructions. Is there something specific you need help with?`;
  }

  // Default
  const avgCrowd = Math.round(ZONES.reduce((s,z)=>s+(crowdData[z.id]||0),0)/ZONES.length);
  return `I'm analyzing the live stadium data for you! 🤖\n\nHere's what I can help you with:\n• 🚪 Gate congestion & best exits\n• 🍕 Food stalls with shortest queues  \n• 🚻 Restroom wait times\n• 🧭 Smart navigation routes\n• 📦 Order food to your seat\n• 🚨 Emergency procedures\n\nCurrent stadium: **${avgCrowd}% capacity**. Ask me anything specific!`;
}

function quickAsk(question) {
  document.getElementById('chatInput').value = question;
  sendChat();
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const query = input.value.trim();
  if (!query) return;
  
  // Rate limit check
  if (!checkRateLimit('sendChat', 2)) {
    alert('Please wait before sending another message');
    return;
  }
  
  input.value = '';

  // Sanitize and escape user message
  const sanitizedQuery = sanitizeInput(query);
  const displayQuery = escapeHTML(query);

  // User message
  messages.innerHTML += `<div class="msg user"><div class="msg-bubble">${displayQuery}</div><div class="msg-time">${timeNow()}</div></div>`;
  messages.scrollTop = messages.scrollHeight;

  // Thinking
  const thinkId = 'think-' + Date.now();
  messages.innerHTML += `<div class="msg assistant thinking" id="${thinkId}"><div class="msg-bubble"><div class="typing-dots"><span>.</span><span>.</span><span>.</span></div></div></div>`;
  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {
    const thinkEl = document.getElementById(thinkId);
    if (thinkEl) thinkEl.remove();
    const response = getAIResponse(query);
    const formatted = response.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messages.innerHTML += `<div class="msg assistant"><div class="msg-bubble">${formatted}</div><div class="msg-time">${timeNow()}</div></div>`;
    messages.scrollTop = messages.scrollHeight;
  }, 800 + Math.random() * 600);
}

// ============================================================
// MENU & ORDERING
// ============================================================
function renderMenu(category) {
  const items = MENU_ITEMS[category] || MENU_ITEMS.food;
  const el = document.getElementById('menuItems');
  if (!el) return;
  el.innerHTML = items.map(item =>
    `<div class="menu-card">
      <span class="menu-emoji">${item.emoji}</span>
      <div class="menu-name">${item.name}</div>
      <div class="menu-price">₹${item.price}</div>
      <button class="menu-add" onclick="addToCart('${item.id}','${item.name}','${item.emoji}',${item.price})">+ Add</button>
    </div>`
  ).join('');
}

function filterMenu(cat, btn) {
  currentMenuCat = cat;
  document.querySelectorAll('.mcat').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMenu(cat);
}

function addToCart(id, name, emoji, price) {
  const existing = cartItems.find(c => c.id === id);
  if (existing) { existing.qty++; }
  else { cartItems.push({ id, name, emoji, price, qty: 1 }); }
  renderCart();
}

function removeFromCart(id) {
  cartItems = cartItems.filter(c => c.id !== id);
  renderCart();
}

function renderCart() {
  const el = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const subtotalEl = document.getElementById('subtotalAmt');
  const finalEl = document.getElementById('finalAmt');

  if (cartItems.length === 0) {
    el.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    if (totalEl) totalEl.style.display = 'none';
    return;
  }

  el.innerHTML = cartItems.map(c =>
    `<div class="cart-item">
      <span class="ci-name">${c.emoji} ${c.name} x${c.qty}</span>
      <span class="ci-price">₹${c.price * c.qty}</span>
      <button class="ci-remove" onclick="removeFromCart('${c.id}')">×</button>
    </div>`
  ).join('');

  const subtotal = cartItems.reduce((s,c) => s + c.price * c.qty, 0);
  if (totalEl) totalEl.style.display = 'block';
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (finalEl) finalEl.textContent = `₹${subtotal + 30}`;
}

function placeOrder() {
  const seat = document.getElementById('seatNumber').value.trim();
  const confirm = document.getElementById('orderConfirm');
  if (!confirm) return;

  // Validate seat number
  if (!validateSeatNumber(seat)) {
    confirm.className = 'order-confirm';
    confirm.style.background = 'rgba(255, 204, 0, 0.1)';
    confirm.style.borderColor = 'rgba(255, 204, 0, 0.3)';
    confirm.style.color = 'var(--accent-yellow)';
    confirm.textContent = '⚠ Please enter a valid seat (alphanumeric + hyphens, max 20 chars).';
    confirm.classList.remove('hidden');
    logError('WARNING', 'Invalid seat number format attempted', seat);
    return;
  }

  if (cartItems.length === 0) {
    confirm.className = 'order-confirm';
    confirm.style.background = 'rgba(255, 62, 96, 0.1)';
    confirm.style.borderColor = 'rgba(255, 62, 96, 0.3)';
    confirm.style.color = 'var(--accent-red)';
    confirm.textContent = '⚠ Your cart is empty.';
    confirm.classList.remove('hidden');
    return;
  }

  const total = cartItems.reduce((s,c) => s + c.price * c.qty, 0) + 30;
  const eta = Math.floor(8 + Math.random() * 6);
  const sanitizedSeat = escapeHTML(seat);
  
  confirm.className = 'order-confirm';
  confirm.style.background = 'var(--bg-elevated)';
  confirm.innerHTML = `
    <div class="oc-header">✅ Order Received (#${Math.floor(Math.random()*9000)+1000})</div>
    <p>Preparing items for Seat ${sanitizedSeat}. Total: ₹${total}</p>
    <div class="oc-status-track" id="orderTracking">
      <div class="oc-step active" id="step1"><div class="oc-dot"></div> Preparing items...</div>
      <div class="oc-step" id="step2"><div class="oc-dot"></div> Out for delivery</div>
      <div class="oc-step" id="step3"><div class="oc-dot"></div> Arriving soon</div>
    </div>
  `;
  confirm.classList.remove('hidden');
  
  cartItems = [];
  renderCart();

  // Simulation steps
  setTimeout(() => { 
    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    if (s1 && s2) { s1.classList.remove('active'); s2.classList.add('active'); }
  }, 5000);
  setTimeout(() => { 
    const s2 = document.getElementById('step2');
    const s3 = document.getElementById('step3');
    if (s2 && s3) { s2.classList.remove('active'); s3.classList.add('active'); }
  }, 10000);

  // Add alert with sanitized seat
  alertLog.unshift({ type: 'info', msg: `📦 Order placed → Seat ${sanitizedSeat} (ETA ${eta} min)`, time: timeNow() });
  renderAlerts();
  
  logError('INFO', 'Order placed successfully', { seat: sanitizedSeat, total, eta });
}

// ============================================================
// STADIUM MAP (SVG Fallback)
// ============================================================
let currentMapFilter = 'all';

function setMapFilter(filter, btn) {
  currentMapFilter = filter;
  document.querySelectorAll('.map-ctrl-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderStadiumMap();
}

function renderStadiumMap() {
  const el = document.getElementById('stadiumSvgMap');
  if (!el) return;

  const showGates    = currentMapFilter === 'all' || currentMapFilter === 'gates';
  const showFood     = currentMapFilter === 'all' || currentMapFilter === 'food';
  const showServices = currentMapFilter === 'all' || currentMapFilter === 'services';
  const showSections = currentMapFilter === 'all' || currentMapFilter === 'gates';

  const gateColors = {
    ga: (crowdData['ga']||0) > 70 ? '#ff3355' : (crowdData['ga']||0) > 40 ? '#ffd700' : '#00ff88',
    gb: (crowdData['gb']||0) > 70 ? '#ff3355' : (crowdData['gb']||0) > 40 ? '#ffd700' : '#00ff88',
    gc: (crowdData['gc']||0) > 70 ? '#ff3355' : (crowdData['gc']||0) > 40 ? '#ffd700' : '#00ff88',
    gd: (crowdData['gd']||0) > 70 ? '#ff3355' : (crowdData['gd']||0) > 40 ? '#ffd700' : '#00ff88',
    ge: (crowdData['ge']||0) > 70 ? '#ff3355' : (crowdData['ge']||0) > 40 ? '#ffd700' : '#00ff88',
  };

  // Food stall wait times for display
  const pizzaWait = getWaitTime('pizza');
  const burgerWait = getWaitTime('burger');
  const hotdogWait = getWaitTime('hotdog');
  const drinksWait = getWaitTime('drinks');
  const foodColor = (w) => w <= 7 ? '#00ff88' : w <= 14 ? '#ffd700' : '#ff5577';

  el.innerHTML = `
  <svg viewBox="0 0 820 620" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;font-family:DM Sans,sans-serif">
    <defs>
      <radialGradient id="fieldGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1e4a1e"/>
        <stop offset="100%" stop-color="#122a12"/>
      </radialGradient>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#101820"/>
        <stop offset="100%" stop-color="#070b0f"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="820" height="620" fill="url(#bgGrad)"/>

    <!-- Stadium track / concourse ring -->
    <ellipse cx="410" cy="305" rx="370" ry="268" fill="none" stroke="#1a2d40" stroke-width="48"/>
    <ellipse cx="410" cy="305" rx="370" ry="268" fill="none" stroke="#0c1520" stroke-width="44"/>
    <ellipse cx="410" cy="305" rx="348" ry="248" fill="none" stroke="#1f3048" stroke-width="2" stroke-dasharray="6,4"/>

    <!-- Concourse inner boundary -->
    <ellipse cx="410" cy="305" rx="200" ry="148" fill="none" stroke="#1e2d3e" stroke-width="1.5"/>

    <!-- Seating sections -->
    ${showSections ? ZONES.filter(z=>z.type==='section').map((z,i) => {
      const angles = [-20, 52, 124, 196, 268];
      const a = (angles[i] * Math.PI) / 180;
      const r = 285;
      const x = 410 + r * Math.cos(a);
      const y = 305 + r * Math.sin(a);
      const pct = crowdData[z.id] || 0;
      const color = pct > 70 ? '#ff5577' : pct > 40 ? '#ffd700' : '#00ff88';
      const opacity = pct > 70 ? 0.28 : pct > 40 ? 0.22 : 0.18;
      return `<g filter="url(#softGlow)">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="38" fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-opacity="0.7" stroke-width="1.5"/>
      </g>
      <text x="${x.toFixed(1)}" y="${(y-10).toFixed(1)}" text-anchor="middle" fill="${color}" font-size="10" font-weight="700" opacity="0.95">${z.name}</text>
      <text x="${x.toFixed(1)}" y="${(y+6).toFixed(1)}" text-anchor="middle" fill="${color}" font-size="14" font-weight="800">${pct}%</text>
      <text x="${x.toFixed(1)}" y="${(y+19).toFixed(1)}" text-anchor="middle" fill="${color}" font-size="8" opacity="0.7">${pct>70?'HIGH':pct>40?'MED':'LOW'}</text>`;
    }).join('') : ''}

    <!-- Playing Field -->
    <ellipse cx="410" cy="305" rx="185" ry="136" fill="url(#fieldGrad)" stroke="#2a5a2a" stroke-width="2"/>
    <!-- Field stripe pattern -->
    <ellipse cx="410" cy="305" rx="175" ry="126" fill="none" stroke="#1a3d1a" stroke-width="12"/>
    <ellipse cx="410" cy="305" rx="160" ry="112" fill="none" stroke="#1e4a1e" stroke-width="10"/>
    <ellipse cx="410" cy="305" rx="145" ry="98" fill="none" stroke="#1a3d1a" stroke-width="8"/>
    <!-- Field lines -->
    <line x1="410" y1="175" x2="410" y2="435" stroke="#2a6a2a" stroke-width="1.5" opacity="0.7"/>
    <ellipse cx="410" cy="305" rx="185" ry="136" fill="none" stroke="#2a6a2a" stroke-width="1.5" opacity="0.7"/>
    <circle cx="410" cy="305" r="38" fill="none" stroke="#2a6a2a" stroke-width="1.5" opacity="0.7"/>
    <circle cx="410" cy="305" r="5" fill="#3a8a3a" opacity="0.8"/>
    <!-- Penalty boxes -->
    <rect x="365" y="175" width="90" height="52" fill="none" stroke="#2a6a2a" stroke-width="1.5" opacity="0.7"/>
    <rect x="365" y="373" width="90" height="52" fill="none" stroke="#2a6a2a" stroke-width="1.5" opacity="0.7"/>
    <!-- Field Label -->
    <text x="410" y="299" text-anchor="middle" fill="#4a9a4a" font-size="12" font-weight="700" opacity="0.6" letter-spacing="2">MATCH</text>
    <text x="410" y="316" text-anchor="middle" fill="#4a9a4a" font-size="10" opacity="0.5" letter-spacing="1">FIELD</text>

    ${showGates ? `
    <!-- GATES -->
    <!-- Gate A (top) -->
    <g filter="url(#glow)">
      <rect x="382" y="26" width="56" height="34" rx="8" fill="${gateColors.ga}" fill-opacity="0.18" stroke="${gateColors.ga}" stroke-width="1.8"/>
    </g>
    <text x="410" y="38" text-anchor="middle" fill="${gateColors.ga}" font-size="8" font-weight="800" letter-spacing="1">GATE A</text>
    <text x="410" y="51" text-anchor="middle" fill="${gateColors.ga}" font-size="12" font-weight="800">${crowdData['ga']||0}%</text>

    <!-- Gate B (right) -->
    <g filter="url(#glow)">
      <rect x="754" y="287" width="56" height="36" rx="8" fill="${gateColors.gb}" fill-opacity="0.18" stroke="${gateColors.gb}" stroke-width="1.8"/>
    </g>
    <text x="782" y="299" text-anchor="middle" fill="${gateColors.gb}" font-size="8" font-weight="800" letter-spacing="1">GATE B</text>
    <text x="782" y="314" text-anchor="middle" fill="${gateColors.gb}" font-size="12" font-weight="800">${crowdData['gb']||0}%</text>

    <!-- Gate C (left) -->
    <g filter="url(#glow)">
      <rect x="10" y="287" width="56" height="36" rx="8" fill="${gateColors.gc}" fill-opacity="0.18" stroke="${gateColors.gc}" stroke-width="1.8"/>
    </g>
    <text x="38" y="299" text-anchor="middle" fill="${gateColors.gc}" font-size="8" font-weight="800" letter-spacing="1">GATE C</text>
    <text x="38" y="314" text-anchor="middle" fill="${gateColors.gc}" font-size="12" font-weight="800">${crowdData['gc']||0}%</text>

    <!-- Gate D (bottom) -->
    <g filter="url(#glow)">
      <rect x="382" y="558" width="56" height="34" rx="8" fill="${gateColors.gd}" fill-opacity="0.18" stroke="${gateColors.gd}" stroke-width="1.8"/>
    </g>
    <text x="410" y="570" text-anchor="middle" fill="${gateColors.gd}" font-size="8" font-weight="800" letter-spacing="1">GATE D</text>
    <text x="410" y="583" text-anchor="middle" fill="${gateColors.gd}" font-size="12" font-weight="800">${crowdData['gd']||0}%</text>

    <!-- Gate E (top-right diagonal) -->
    <g filter="url(#glow)">
      <rect x="638" y="88" width="52" height="32" rx="8" fill="${gateColors.ge}" fill-opacity="0.18" stroke="${gateColors.ge}" stroke-width="1.8"/>
    </g>
    <text x="664" y="100" text-anchor="middle" fill="${gateColors.ge}" font-size="8" font-weight="800" letter-spacing="1">GATE E</text>
    <text x="664" y="113" text-anchor="middle" fill="${gateColors.ge}" font-size="12" font-weight="800">${crowdData['ge']||0}%</text>
    ` : ''}

    ${showFood ? `
    <!-- FOOD STALLS -->
    <!-- Pizza (top-right) -->
    <rect x="600" y="108" width="68" height="32" rx="6" fill="rgba(255,107,53,0.12)" stroke="#ff6b35" stroke-width="1.2"/>
    <text x="607" y="120" fill="#ff6b35" font-size="13">🍕</text>
    <text x="623" y="118" fill="#ff8c5a" font-size="9" font-weight="700">PIZZA</text>
    <text x="623" y="132" fill="${foodColor(pizzaWait)}" font-size="10" font-weight="800">${pizzaWait}m wait</text>

    <!-- Burger (top-left) -->
    <rect x="150" y="108" width="72" height="32" rx="6" fill="rgba(255,107,53,0.12)" stroke="#ff6b35" stroke-width="1.2"/>
    <text x="157" y="120" fill="#ff6b35" font-size="13">🍔</text>
    <text x="173" y="118" fill="#ff8c5a" font-size="9" font-weight="700">BURGER</text>
    <text x="173" y="132" fill="${foodColor(burgerWait)}" font-size="10" font-weight="800">${burgerWait}m wait</text>

    <!-- Hotdog (bottom-right) -->
    <rect x="600" y="470" width="72" height="32" rx="6" fill="rgba(255,107,53,0.12)" stroke="#ff6b35" stroke-width="1.2"/>
    <text x="607" y="482" fill="#ff6b35" font-size="13">🌭</text>
    <text x="623" y="480" fill="#ff8c5a" font-size="9" font-weight="700">HOTDOG</text>
    <text x="623" y="494" fill="${foodColor(hotdogWait)}" font-size="10" font-weight="800">${hotdogWait}m wait</text>

    <!-- Drinks (bottom-left) -->
    <rect x="150" y="470" width="70" height="32" rx="6" fill="rgba(255,107,53,0.12)" stroke="#ff6b35" stroke-width="1.2"/>
    <text x="157" y="482" fill="#ff6b35" font-size="13">🥤</text>
    <text x="173" y="480" fill="#ff8c5a" font-size="9" font-weight="700">DRINKS</text>
    <text x="173" y="494" fill="${foodColor(drinksWait)}" font-size="10" font-weight="800">${drinksWait}m wait</text>
    ` : ''}

    ${showServices ? `
    <!-- RESTROOMS -->
    <rect x="335" y="26" width="40" height="28" rx="5" fill="rgba(176,109,244,0.1)" stroke="#b06df4" stroke-width="1.2"/>
    <text x="340" y="36" fill="#b06df4" font-size="11">🚻</text>
    <text x="355" y="35" text-anchor="middle" fill="#b06df4" font-size="7" font-weight="700">NORTH</text>
    <text x="355" y="45" text-anchor="middle" fill="#b06df4" font-size="7">RESTROOM</text>

    <rect x="335" y="558" width="40" height="28" rx="5" fill="rgba(176,109,244,0.1)" stroke="#b06df4" stroke-width="1.2"/>
    <text x="340" y="568" fill="#b06df4" font-size="11">🚻</text>
    <text x="355" y="567" text-anchor="middle" fill="#b06df4" font-size="7" font-weight="700">SOUTH</text>
    <text x="355" y="578" text-anchor="middle" fill="#b06df4" font-size="7">RESTROOM</text>

    <!-- Medical -->
    <rect x="447" y="26" width="42" height="28" rx="5" fill="rgba(0,212,255,0.1)" stroke="#00d4ff" stroke-width="1.2"/>
    <text x="452" y="36" fill="#00d4ff" font-size="11">🏥</text>
    <text x="468" y="35" text-anchor="middle" fill="#00d4ff" font-size="7" font-weight="700">MEDICAL</text>
    <text x="468" y="45" text-anchor="middle" fill="#00d4ff" font-size="7">STATION</text>

    <!-- Merch -->
    <rect x="130" y="280" width="42" height="28" rx="5" fill="rgba(255,140,66,0.1)" stroke="#ff8c42" stroke-width="1.2"/>
    <text x="135" y="290" fill="#ff8c42" font-size="11">👕</text>
    <text x="151" y="289" text-anchor="middle" fill="#ff8c42" font-size="7" font-weight="700">MERCH</text>
    <text x="151" y="299" text-anchor="middle" fill="#ff8c42" font-size="7">KIOSK</text>

    <!-- VIP -->
    <rect x="648" y="280" width="46" height="28" rx="5" fill="rgba(255,215,0,0.08)" stroke="#ffd700" stroke-width="1.2"/>
    <text x="653" y="290" fill="#ffd700" font-size="11">⭐</text>
    <text x="671" y="289" text-anchor="middle" fill="#ffd700" font-size="7" font-weight="700">VIP</text>
    <text x="671" y="299" text-anchor="middle" fill="#ffd700" font-size="7">LOUNGE</text>
    ` : ''}

    <!-- Footer label -->
    <text x="410" y="610" text-anchor="middle" fill="#3a5060" font-size="9" letter-spacing="1">ArenaMind AI  •  Stadium Topology v2.1  •  Refreshes 5s</text>
  </svg>
  <div class="radar-wrap">
    <div class="radar-sweep"></div>
  </div>`;

  // Draw flow lines (neon trails)
  const svg = el.querySelector('svg');
  if (svg && currentMapFilter === 'all') {
    const flowPaths = [
      "M 410 100 Q 600 100 700 300",
      "M 410 100 Q 220 100 120 300",
      "M 410 510 Q 600 510 700 310",
      "M 410 510 Q 220 510 120 310"
    ];
    flowPaths.forEach(d => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(0, 212, 255, 0.15)");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke-dasharray", "4,8");
      path.style.animation = "dashMove 5s linear infinite";
      svg.appendChild(path);
    });
  }

  // Update map stats
  const vals = ZONES.map(z => crowdData[z.id] || 0);
  const avg = Math.round(vals.reduce((s,v) => s+v, 0) / vals.length);
  const hotZone = ZONES.reduce((a,b) => (crowdData[a.id]||0) > (crowdData[b.id]||0) ? a : b);
  const avgEl = document.getElementById('mapAvgDensity');
  const hotEl = document.getElementById('mapHotZone');
  if (avgEl) avgEl.textContent = avg + '%';
  if (hotEl) hotEl.textContent = hotZone.name + ' (' + (crowdData[hotZone.id]||0) + '%)';
}

// ============================================================
// MAP CONFIG & LIVE MODE
// ============================================================
function toggleMapConfig() {
  const cfg = document.getElementById('mapConfig');
  cfg.classList.toggle('hidden');
}

function saveApiKey() {
  const key = document.getElementById('googleMapsApiKey').value.trim();
  
  // Validate API key before storing
  if (!validateApiKey(key)) {
    alert('⚠ Invalid API key format. Google Maps API keys should be 20+ alphanumeric characters.');
    logError('WARNING', 'Invalid Google Maps API key format provided');
    return;
  }
  
  // Use secure storage
  const success = secureSetStorage('arenamind_google_key', key);
  if (success) {
    alert('✅ API Key saved securely. Reloading map systems...');
    currentApiKey = key;
    location.reload();
  } else {
    alert('❌ Failed to save API key. Please try again.');
    logError('ERROR', 'Failed to save API key to storage');
  }
}

function loadGoogleMaps() {
  if (!currentApiKey || currentApiKey === 'YOUR_API_KEY' || mapInitialized) return;

  // Use secure loading function
  try {
    loadGoogleMapsSecure(currentApiKey)
      .then(() => {
        mapInitialized = true;
        logError('INFO', 'Google Maps loaded successfully');
      })
      .catch(error => {
        logError('ERROR', 'Google Maps loading failed', error.message);
        mapError();
      });
  } catch (error) {
    logError('ERROR', 'Error loading Google Maps', error.message);
    mapError();
  }
}

function mapError() {
  // Fallback to SVG
  const mapFallback = document.getElementById('mapFallback');
  if (mapFallback) {
    mapFallback.style.display = 'block';
  }
  renderStadiumMap();
}

window.initMap = function () {
  const mapFallback = document.getElementById('mapFallback');
  const googleMap = document.getElementById('googleMap');
  const stadiumLoc = { lat: 18.9389, lng: 72.8258 };

  try {
    googleMapObj = new google.maps.Map(googleMap, {
      center: stadiumLoc,
      zoom: 17,
      mapTypeId: 'roadmap',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#101720' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8baac5' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0c1118' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1520' }] },
        { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#1a2735' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2d3e' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#141e2a' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a2735' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#141e2a' }] },
      ],
      disableDefaultUI: false,
    });

    // Custom markers
    ZONES.filter(z => z.type === 'gate').forEach(m => {
      const pct = crowdData[m.id] || 0;
      const color = pct > 70 ? '#ff3355' : pct > 40 ? '#ffd700' : '#00ff88';
      new google.maps.Marker({
        position: { lat: stadiumLoc.lat + (Math.random()-0.5)*0.002, lng: stadiumLoc.lng + (Math.random()-0.5)*0.002 },
        map: googleMapObj,
        title: `${m.name}: ${pct}%`,
        label: { text: m.name.split(' ')[1], color: '#000', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#fff'
        }
      });
    });

    if (mapFallback) mapFallback.style.display = 'none';
    if (googleMap) googleMap.style.display = 'block';
    mapInitialized = true;
  } catch(e) {
    mapError();
  }
};

function mapError() {
  const googleMap = document.getElementById('googleMap');
  if (googleMap) googleMap.style.display = 'none';
  renderStadiumMap();
  const notice = document.getElementById('mapApiNotice');
  if (notice) notice.style.display = 'flex';
}

// ============================================================
// UI CONTROLS
// ============================================================
const SECTION_TITLES = {
  dashboard: 'Command Center',
  heatmap: 'Crowd Heatmap',
  queue: 'Queue Predictor',
  navigation: 'Smart Routes',
  assistant: 'AI Assistant',
  ordering: 'Seat Ordering',
  maps: 'Stadium Map',
};

function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('section-' + id);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = SECTION_TITLES[id] || id;

  // Section-specific renders
  if (id === 'heatmap') renderFullHeatmap();
  if (id === 'queue') renderQueueTable();
  if (id === 'ordering') renderMenu(currentMenuCat);
  if (id === 'maps') { renderStadiumMap(); if (!mapInitialized) setTimeout(()=>{ renderStadiumMap(); }, 100); }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
  }
}

function toggleEmergency() {
  const overlay = document.getElementById('emergencyOverlay');
  overlay.classList.toggle('hidden');
}

function filterQueue(type, btn) {
  currentQueueFilter = type;
  document.querySelectorAll('.qtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderQueueTable();
}

// ============================================================
// MAIN LOOP
// ============================================================
function fullUpdate() {
  updateCrowdData();
  updateQueueData();
  renderMiniHeatmap();
  renderQueueMini();
  renderSurgeChart();

  // Capacity badge
  const capPct = document.getElementById('capacityPct');
  if (capPct) {
    const avg = Math.round(ZONES.reduce((s,z)=>s+(crowdData[z.id]||0),0)/ZONES.length);
    capPct.textContent = avg + '%';
    capPct.style.color = avg > 70 ? '#ff3355' : avg > 50 ? '#ffcc00' : '#00ff88';
  }

  // Attendees stat
  const sa = document.getElementById('statAttendees');
  if (sa) {
    const base = 54000 + Math.floor(Math.random() * 500);
    sa.textContent = base.toLocaleString();
  }

  // Refresh heatmap if visible
  const hSection = document.getElementById('section-heatmap');
  if (hSection && hSection.classList.contains('active')) renderFullHeatmap();

  // Refresh queue if visible
  const qSection = document.getElementById('section-queue');
  if (qSection && qSection.classList.contains('active')) renderQueueTable();

  // Refresh map SVG if visible
  const mSection = document.getElementById('section-maps');
  if (mSection && mSection.classList.contains('active') && !mapInitialized) renderStadiumMap();

  // Update map stats in panel
  const vals = ZONES.map(z => crowdData[z.id] || 0);
  const avg = Math.round(vals.reduce((s,v) => s+v, 0) / vals.length);
  const hotZone = ZONES.reduce((a,b) => (crowdData[a.id]||0) > (crowdData[b.id]||0) ? a : b);
  const avgEl = document.getElementById('mapAvgDensity');
  const hotEl = document.getElementById('mapHotZone');
  if (avgEl) avgEl.textContent = avg + '%';
  if (hotEl) hotEl.textContent = hotZone.name + ' (' + (crowdData[hotZone.id]||0) + '%)';
}

// ============================================================
// INIT
// ============================================================
// ============================================================
// INTERACTIVE LOOPS
// ============================================================

function startTickerLoop() {
  const ticker = document.getElementById('eventTicker');
  if (!ticker) return;
  const events = [
    'LIVE MATCH STATUS: 2nd HALF (72\')',
    'SCORE: HOME 2 - 1 AWAY',
    'INCIDENT: YELLOW CARD (HOME #14)',
    'STADIUM: Gate D is now CLEAR for easy exit',
    'FOOD: Pizza stall wait time dropped to 5m',
    'ALERT: High crowd density near Section A',
    'LIVE MATCH STATUS: 2nd HALF (75\')',
    'SUBSTITUTION: AWAY #10 OUT, #23 IN'
  ];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % events.length;
    const items = ticker.querySelectorAll('.ticker-item');
    if (items.length > 0) {
      items[0].textContent = events[idx];
      if (items[1]) items[1].textContent = events[(idx+1)%events.length];
    }
  }, 8000);
}

function startLogLoop() {
  const log = document.getElementById('systemLog');
  if (!log) return;
  const sysMsgs = [
    'Zone ga density sync: 82% (High)',
    'Queue pizza service rate stabilized: 12/min',
    'Gateway node 4 signal: Strong (-42dBm)',
    'Sensor Section B data recalibrated',
    'AI Assistant route optimization complete',
    'Energy consumption: 88% Optimal',
    'Environmental temp: 28.2C',
    'Gate D flow increased: +12ppm'
  ];
  setInterval(() => {
    const msg = sysMsgs[Math.floor(Math.random() * sysMsgs.length)];
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    if (Math.random() > 0.8) entry.classList.add('highlight');
    const time = new Date().toTimeString().split(' ')[0];
    entry.innerHTML = `<span class="log-time">${time}</span> [SYS] ${msg}`;
    log.prepend(entry);
    if (log.childNodes.length > 30) log.lastChild.remove();
  }, 4000 + Math.random() * 3000);
}

// ============================================================
// INIT
// ============================================================
function init() {
  // ✅ Expose ALL event handler functions to window for HTML onclick
  window.showSection = showSection;
  window.toggleSidebar = toggleSidebar;
  window.toggleEmergency = toggleEmergency;
  window.filterQueue = filterQueue;
  window.findRoute = findRoute;
  window.quickAsk = quickAsk;
  window.sendChat = sendChat;
  window.filterMenu = filterMenu;
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.placeOrder = placeOrder;
  window.renderStadiumMap = renderStadiumMap;
  window.setMapFilter = setMapFilter;
  window.toggleMapConfig = toggleMapConfig;
  window.saveApiKey = saveApiKey;

  // Initialize data
  updateCrowdData();
  updateQueueData();
  if (currentApiKey) loadGoogleMaps();
  
  startTickerLoop();
  startLogLoop();
  
  // Initial render
  fullUpdate();
  renderMenu('food');
  generateAlert();
  generateAlert();
  generateAlert();
  
  // Live update intervals
  setInterval(fullUpdate, 5000);
  setInterval(generateAlert, 12000);

  // Match status cycling
  const matchStatuses = ['Match in Progress', 'Half Time', 'Second Half', 'Injury Time'];
  let msIdx = 0;
  setInterval(() => {
    msIdx = (msIdx + 1) % matchStatuses.length;
    const el = document.getElementById('matchStatus');
    if (el) el.textContent = matchStatuses[msIdx];
  }, 45000);

  // SVG map fallback render
  setTimeout(renderStadiumMap, 500);
  console.log('🏟 ArenaMind AI initialized — All systems operational');
}

document.addEventListener('DOMContentLoaded', init);
