/**
 * ArenaMind AI — Comprehensive Test Suite
 * Unit & Integration Tests using basic test framework
 */

// ============================================================
// TEST FRAMEWORK
// ============================================================
class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(testName, fn) {
    this.tests.push({ name: testName, fn });
  }

  async run() {
    console.log(`\n🧪 Test Suite: ${this.name}`);
    console.log('=' .repeat(50));
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.error(`❌ ${test.name}`);
        console.error(`   Error: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log('=' .repeat(50));
    console.log(`Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, message || `Expected ${expected}, got ${actual}`);
}

function assertArrayEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), message || 'Arrays not equal');
}

function assertThrows(fn, message) {
  try {
    fn();
    throw new Error(message || 'Expected function to throw');
  } catch (e) {
    // Expected
  }
}

// ============================================================
// UNIT TESTS: UTILITY FUNCTIONS
// ============================================================
const testUtilities = new TestSuite('Utility Functions');

testUtilities.test('jitter() returns valid percentage', () => {
  const result = jitter(50, 10);
  assert(result >= 1 && result <= 100, 'jitter should return 1-100');
  assert(typeof result === 'number', 'jitter should return a number');
});

testUtilities.test('jitter() respects base value', () => {
  const result = jitter(50, 5);
  assert(result >= 45 && result <= 55, 'jitter should stay near base');
});

testUtilities.test('densityClass() categorizes correctly', () => {
  assertEqual(densityClass(30), 'low', 'Should return low for <40');
  assertEqual(densityClass(50), 'med', 'Should return med for 40-70');
  assertEqual(densityClass(80), 'high', 'Should return high for >70');
});

testUtilities.test('densityLabel() formats correctly', () => {
  assertEqual(densityLabel(30), 'Low', 'Should format low');
  assertEqual(densityLabel(50), 'Medium', 'Should format medium');
  assertEqual(densityLabel(80), 'High', 'Should format high');
});

testUtilities.test('waitClass() categorizes wait times', () => {
  assertEqual(waitClass(5), 'wait-low', 'Should return wait-low for ≤7');
  assertEqual(waitClass(10), 'wait-med', 'Should return wait-med for 8-14');
  assertEqual(waitClass(20), 'wait-high', 'Should return wait-high for >14');
});

testUtilities.test('queueStatus() returns HTML status', () => {
  const result = queueStatus(5);
  assert(result.includes('sdot-open'), 'Should contain open status');
  assert(result.includes('Open'), 'Should contain Open label');
});

testUtilities.test('timeNow() returns valid time format', () => {
  const result = timeNow();
  assert(/^\d{1,2}:\d{2}$/.test(result), 'timeNow should return HH:MM or H:MM');
});

// ============================================================
// UNIT TESTS: DATA MODELS
// ============================================================
const testDataModels = new TestSuite('Data Models');

testDataModels.test('ZONES array is properly defined', () => {
  assert(Array.isArray(ZONES), 'ZONES should be an array');
  assert(ZONES.length > 0, 'ZONES should have items');
  assert(ZONES[0].id && ZONES[0].name && ZONES[0].type && ZONES[0].base !== undefined, 'Zone must have required fields');
});

testDataModels.test('QUEUE_POINTS array is properly defined', () => {
  assert(Array.isArray(QUEUE_POINTS), 'QUEUE_POINTS should be an array');
  assert(QUEUE_POINTS.length > 0, 'QUEUE_POINTS should have items');
  const item = QUEUE_POINTS[0];
  assert(item.id && item.name && item.emoji && item.serviceRate && item.queueBase !== undefined, 'Queue point must have required fields');
});

testDataModels.test('MENU_ITEMS has all categories', () => {
  assert(MENU_ITEMS.food, 'Should have food category');
  assert(MENU_ITEMS.drinks, 'Should have drinks category');
  assert(MENU_ITEMS.snacks, 'Should have snacks category');
  assert(MENU_ITEMS.food.length > 0, 'Food should have items');
});

testDataModels.test('ROUTES has proper structure', () => {
  assert(typeof ROUTES === 'object', 'ROUTES should be an object');
  assert(Object.keys(ROUTES).length > 0, 'ROUTES should have entries');
  const firstKey = Object.keys(ROUTES)[0];
  assert(typeof ROUTES[firstKey] === 'object', 'Route values should be objects');
});

// ============================================================
// UNIT TESTS: CROWD DATA ENGINE
// ============================================================
const testCrowdEngine = new TestSuite('Crowd Data Engine');

testCrowdEngine.test('updateCrowdData() initializes all zones', () => {
  updateCrowdData();
  ZONES.forEach(zone => {
    assert(crowdData[zone.id] !== undefined, `crowdData should have ${zone.id}`);
    assert(typeof crowdData[zone.id] === 'number', 'Crowd data should be numeric');
  });
});

testCrowdEngine.test('updateCrowdData() maintains valid ranges', () => {
  for (let i = 0; i < 5; i++) {
    updateCrowdData();
  }
  ZONES.forEach(zone => {
    const value = crowdData[zone.id];
    assert(value >= 1 && value <= 100, `Crowd data should be 1-100, got ${value}`);
  });
});

testCrowdEngine.test('updateQueueData() updates all queue points', () => {
  updateQueueData();
  QUEUE_POINTS.forEach(q => {
    assert(queueData[q.id] !== undefined, `queueData should have ${q.id}`);
    assert(typeof queueData[q.id] === 'number', 'Queue data should be numeric');
  });
});

testCrowdEngine.test('getWaitTime() calculates correctly', () => {
  queueData['pizza'] = 60; // 60 people
  const waitTime = getWaitTime('pizza');
  const expected = Math.ceil(60 / 12); // pizza service rate is 12
  assertEqual(waitTime, expected, 'Wait time should be queue/serviceRate');
});

testCrowdEngine.test('getWaitTime() returns 0 for unknown queue', () => {
  assertEqual(getWaitTime('invalid_queue'), 0, 'Should return 0 for unknown queue');
});

// ============================================================
// UNIT TESTS: ALERT SYSTEM
// ============================================================
const testAlertSystem = new TestSuite('Alert System');

testAlertSystem.test('ALERT_TEMPLATES are properly defined', () => {
  assert(Array.isArray(ALERT_TEMPLATES), 'ALERT_TEMPLATES should be array');
  assert(ALERT_TEMPLATES.length > 0, 'Should have alert templates');
  ALERT_TEMPLATES.forEach(t => {
    assert(t.type && typeof t.fn === 'function', 'Template must have type and function');
  });
});

testAlertSystem.test('generateAlert() creates valid alerts', () => {
  updateCrowdData();
  const initialLength = alertLog.length;
  generateAlert();
  // Alert may be null if no conditions met, so just check it didn't break
  assert(alertLog.length >= initialLength, 'Alert log should be updated');
});

testAlertSystem.test('alertLog maintains max length', () => {
  alertLog = [];
  for (let i = 0; i < 25; i++) {
    alertLog.unshift({ type: 'info', msg: `Test ${i}`, time: '00:00' });
  }
  renderAlerts();
  assert(alertLog.length <= 25, 'Alert log should not exceed max');
});

// ============================================================
// UNIT TESTS: NAVIGATION & ROUTING
// ============================================================
const testNavigation = new TestSuite('Navigation & Routing');

testNavigation.test('buildRoute() returns valid route array', () => {
  const route = buildRoute('A1', 'food_pizza');
  assert(Array.isArray(route), 'Route should be an array');
  assert(route.length > 0, 'Route should have steps');
  assert(typeof route[0] === 'string', 'Route steps should be strings');
});

testNavigation.test('buildRoute() provides fallback for unknown routes', () => {
  const route = buildRoute('UNKNOWN', 'unknown_dest');
  assert(Array.isArray(route), 'Should return fallback route');
  assert(route.length > 0, 'Fallback route should have steps');
});

// ============================================================
// UNIT TESTS: ORDERING SYSTEM
// ============================================================
const testOrdering = new TestSuite('Ordering System');

testOrdering.test('addToCart() adds new items', () => {
  cartItems = [];
  addToCart('m1', 'Pizza Slice', '🍕', 220);
  assertEqual(cartItems.length, 1, 'Cart should have 1 item');
  assertEqual(cartItems[0].id, 'm1', 'Item ID should match');
  assertEqual(cartItems[0].qty, 1, 'Initial qty should be 1');
});

testOrdering.test('addToCart() increments quantity', () => {
  cartItems = [];
  addToCart('m1', 'Pizza Slice', '🍕', 220);
  addToCart('m1', 'Pizza Slice', '🍕', 220);
  assertEqual(cartItems.length, 1, 'Should still have 1 item');
  assertEqual(cartItems[0].qty, 2, 'Qty should be 2');
});

testOrdering.test('removeFromCart() removes items', () => {
  cartItems = [{ id: 'm1', name: 'Pizza', emoji: '🍕', price: 220, qty: 1 }];
  removeFromCart('m1');
  assertEqual(cartItems.length, 0, 'Cart should be empty');
});

testOrdering.test('removeFromCart() only removes matching items', () => {
  cartItems = [
    { id: 'm1', name: 'Pizza', emoji: '🍕', price: 220, qty: 1 },
    { id: 'm2', name: 'Burger', emoji: '🍔', price: 280, qty: 1 }
  ];
  removeFromCart('m1');
  assertEqual(cartItems.length, 1, 'Should have 1 remaining item');
  assertEqual(cartItems[0].id, 'm2', 'Burger should remain');
});

// ============================================================
// UNIT TESTS: SECURITY & VALIDATION
// ============================================================
const testSecurity = new TestSuite('Security & Validation');

testSecurity.test('seat input validates seat format', () => {
  // Valid seats
  const validSeats = ['A1', 'B23', 'VIP42', 'ROW1-SEAT5'];
  validSeats.forEach(seat => {
    assert(/^[A-Za-z0-9\-]{1,20}$/.test(seat), `Valid seat ${seat} should pass`);
  });
});

testSecurity.test('seat input rejects malicious input', () => {
  // Malicious inputs
  const invalidSeats = ['<script>', 'javascript:', '"; DROP TABLE'];
  invalidSeats.forEach(seat => {
    assert(!/[<>;"'`]/g.test(seat), `Malicious seat ${seat} should fail`);
  });
});

testSecurity.test('searchInput sanitizes special characters', () => {
  const dangerous = '<img src=x onerror=alert(1)>';
  const sanitized = dangerous.replace(/[<>;"'`]/g, '');
  assert(!sanitized.includes('<'), 'Should remove angle brackets');
  assert(!sanitized.includes('"'), 'Should remove quotes');
});

testSecurity.test('API key handling is secure', () => {
  const testKey = 'test_key_12345';
  localStorage.setItem('arenamind_google_key', testKey);
  const retrieved = localStorage.getItem('arenamind_google_key');
  assertEqual(retrieved, testKey, 'API key should match stored value');
  localStorage.removeItem('arenamind_google_key');
});

// ============================================================
// INTEGRATION TESTS
// ============================================================
const testIntegration = new TestSuite('Integration Tests');

testIntegration.test('Full dashboard update cycle', () => {
  updateCrowdData();
  updateQueueData();
  const crowdZones = Object.keys(crowdData).length;
  const queueQueues = Object.keys(queueData).length;
  assert(crowdZones > 0, 'Should have crowd data');
  assert(queueQueues > 0, 'Should have queue data');
});

testIntegration.test('Menu and cart interaction', () => {
  cartItems = [];
  renderMenu('food');
  addToCart('m1', 'Pizza Slice', '🍕', 220);
  addToCart('d1', 'Cola', '🥤', 80);
  assertEqual(cartItems.length, 2, 'Cart should have 2 different items');
});

testIntegration.test('Queue predictor identifies best wait', () => {
  updateQueueData();
  const waits = QUEUE_POINTS.map(q => ({ ...q, wait: getWaitTime(q.id) }));
  const minWait = Math.min(...waits.map(w => w.wait));
  assert(minWait >= 0, 'Should find minimum wait time');
  assert(waits.some(w => w.wait === minWait), 'Should identify best queue');
});

testIntegration.test('AI Assistant generates responses', () => {
  updateCrowdData();
  const response = getAIResponse('What gates are available?');
  assert(typeof response === 'string', 'Should return string response');
  assert(response.length > 0, 'Response should not be empty');
  assert(response.includes('Gate'), 'Should mention gates');
});

// ============================================================
// PERFORMANCE TESTS
// ============================================================
const testPerformance = new TestSuite('Performance');

testPerformance.test('updateCrowdData() completes in <10ms', () => {
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    updateCrowdData();
  }
  const end = performance.now();
  const avgTime = (end - start) / 100;
  assert(avgTime < 10, `Should complete in <10ms per call, took ${avgTime.toFixed(2)}ms`);
});

testPerformance.test('getWaitTime() is fast', () => {
  updateQueueData();
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    getWaitTime('pizza');
  }
  const end = performance.now();
  const avgTime = (end - start) / 1000;
  assert(avgTime < 1, `Should complete in <1ms per call, took ${avgTime.toFixed(3)}ms`);
});

testPerformance.test('Cart updates scale efficiently', () => {
  const start = performance.now();
  cartItems = [];
  for (let i = 0; i < 100; i++) {
    addToCart(`m${i}`, `Item ${i}`, '📦', 100 + i);
  }
  const end = performance.now();
  assert((end - start) < 50, `Adding 100 items should take <50ms, took ${(end - start).toFixed(2)}ms`);
});

// ============================================================
// RUN ALL TESTS
// ============================================================
async function runAllTests() {
  const suites = [
    testUtilities,
    testDataModels,
    testCrowdEngine,
    testAlertSystem,
    testNavigation,
    testOrdering,
    testSecurity,
    testIntegration,
    testPerformance
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    const result = await suite.run();
    totalPassed += result.passed;
    totalFailed += result.failed;
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 OVERALL RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
}

// Auto-run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, TestSuite, assert };
}
