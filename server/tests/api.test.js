process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('../server');

let server;
let baseUrl;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✅ PASS: ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  REBYTE SYSTEM API VERIFICATION TEST RUNNER');
  console.log('======================================================\n');

  // Start test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    let adminToken = '';
    let studentToken = '';
    let registeredStudentId = '';
    let createdRentalId = '';
    let createdPickupToken = '';

    // --- TEST 1: Healthcheck ---
    console.log('--- TEST 1: Healthcheck & Dual-Mode Config ---');
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200, 'GET /api/health returned 200 OK');
    assert(healthRes.body.status === 'ONLINE', 'Platform status is ONLINE');
    assert(healthRes.body.database_mode.includes('Fallback') || healthRes.body.database_mode.includes('Supabase'), 'Dual-mode database reported');

    // --- TEST 2: Admin Login & JWT Generation ---
    console.log('\n--- TEST 2: Admin Login & JWT Audit ---');
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@viva.edu.in',
      password: 'admin123'
    });
    assert(adminLoginRes.status === 200, 'POST /api/auth/login (Admin) returned 200 OK');
    assert(adminLoginRes.body.token, 'Admin JWT token received');
    assert(adminLoginRes.body.user.role === 'admin', 'Admin role authenticated');
    adminToken = adminLoginRes.body.token;

    // --- TEST 3: Student Login & JWT Generation ---
    console.log('\n--- TEST 3: Student Login & JWT Audit ---');
    const studentLoginRes = await request('POST', '/api/auth/login', {
      email: 'anushka.ece@viva.edu.in',
      password: 'student123'
    });
    assert(studentLoginRes.status === 200, 'POST /api/auth/login (Student) returned 200 OK');
    assert(studentLoginRes.body.token, 'Student JWT token received');
    assert(studentLoginRes.body.user.role === 'student', 'Student role authenticated');
    studentToken = studentLoginRes.body.token;

    // --- TEST 4: RBAC & 403 Security Hardening ---
    console.log('\n--- TEST 4: RBAC 403 Forbidden Barrier Check ---');
    // Without token
    const noAuthRes = await request('GET', '/api/admin/users');
    assert(noAuthRes.status === 401, 'Unauthenticated request to /api/admin/users returns 401');

    // Student token attempting admin endpoint
    const forbiddenRes = await request('GET', '/api/admin/users', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(forbiddenRes.status === 403, 'Student accessing /api/admin/users returns 403 Forbidden');
    assert(forbiddenRes.body.success === false, 'Response payload has success: false');
    assert(forbiddenRes.body.message.includes('403 Forbidden'), 'Standardized 403 message returned');

    // --- TEST 5: Lifecycle Step 1 (Student Register & OTP Simulation) ---
    console.log('\n--- TEST 5: Step 1 (Student Registration & OTP Simulation) ---');
    // Rejection for non-college domain
    const badDomainRes = await request('POST', '/api/auth/register', {
      email: 'fake.student@gmail.com',
      password: 'pass',
      name: 'Fake Student',
      college_id: 'VIVA-000'
    });
    assert(badDomainRes.status === 400, 'Registration rejects non-college domain with 400');

    // Valid registration
    const regRes = await request('POST', '/api/auth/register', {
      email: 'aditya.ece@viva.edu.in',
      password: 'adityaPassword123',
      name: 'Aditya Kadam',
      college_id: 'VIVA-ECE-2024-077',
      department: 'Electronics & Computer Engineering',
      year: 'SE - Sem IV',
      phone: '+91 99887 76655'
    });
    assert(regRes.status === 201, 'POST /api/auth/register returned 201 Created');
    assert(regRes.body.data.status === 'pending_verification', 'New user status is pending_verification');
    assert(regRes.body.data.otp_simulation.length === 6, 'Mock 6-digit OTP generated');
    registeredStudentId = regRes.body.data.id;

    // --- TEST 6: Lifecycle Step 2 (Admin Verifies Student Account) ---
    console.log('\n--- TEST 6: Step 2 (Admin Verifies Student Account) ---');
    const verifyUserRes = await request('POST', `/api/admin/users/${registeredStudentId}/verify`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(verifyUserRes.status === 200, `POST /api/admin/users/${registeredStudentId}/verify returned 200`);
    assert(verifyUserRes.body.data.status === 'verified', 'Student status updated to verified');

    // --- TEST 7: Lifecycle Step 3 (Browse Catalog & Filters) ---
    console.log('\n--- TEST 7: Step 3 (Catalog Search & Category Filter) ---');
    const catRes = await request('GET', '/api/inventory?category=Microcontrollers');
    assert(catRes.status === 200, 'GET /api/inventory?category=Microcontrollers returned 200');
    assert(catRes.body.data.length > 0, 'Returned items for Microcontrollers');
    assert(catRes.body.data.every(i => i.category === 'Microcontrollers'), 'All returned items match category');

    // Search query
    const searchRes = await request('GET', '/api/inventory?search=esp32');
    assert(searchRes.status === 200, 'GET /api/inventory?search=esp32 returned 200');
    assert(searchRes.body.data.some(i => i.id === 'inv-esp32'), 'ESP32 found by search query');

    // --- TEST 8: Lifecycle Step 4 & 5 (Mixed Basket Rental Checkout & Payment Token) ---
    console.log('\n--- TEST 8: Step 4 & 5 (Rental Request, Deposit & Offline Token) ---');
    const rentalOrderRes = await request('POST', '/api/rentals', {
      items: [
        { id: 'inv-esp32', quantity: 1, duration_days: 10, type: 'RENT' },
        { id: 'inv-sensor-hcsr04', quantity: 1, duration_days: 10, type: 'RENT' }
      ],
      payment_method: 'OFFLINE_STORE_CASH',
      duration_days: 10
    }, {
      Authorization: `Bearer ${studentToken}`
    });

    assert(rentalOrderRes.status === 201, 'POST /api/rentals returned 201 Created');
    assert(rentalOrderRes.body.data.pickup_token.startsWith('RNT-'), 'Unique offline token generated (RNT-*-###)');
    assert(rentalOrderRes.body.data.rentals.length === 2, '2 rental items processed in mixed basket');
    assert(rentalOrderRes.body.data.summary.security_deposit > 0, 'Security deposit correctly computed');
    createdRentalId = rentalOrderRes.body.data.rentals[0].id;
    createdPickupToken = rentalOrderRes.body.data.pickup_token;

    // --- TEST 9: Student Rentals Live Tracker Query ---
    console.log('\n--- TEST 9: Student Rentals List & Tracker ---');
    const myRentalsRes = await request('GET', '/api/rentals/my', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(myRentalsRes.status === 200, 'GET /api/rentals/my returned 200');
    assert(myRentalsRes.body.data.some(r => r.id === createdRentalId), 'Created rental found in student account');

    // --- TEST 10: Lifecycle Step 6 (Explicit COLLECTED State Handler) ---
    console.log('\n--- TEST 10: Step 6 (Explicit COLLECTED State Handler) ---');
    const collectRes = await request('PATCH', `/api/rentals/${createdRentalId}/collect`, {
      counter_officer: 'Prof. K. Venkatesh',
      token_scanned: createdPickupToken
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(collectRes.status === 200, `PATCH /api/rentals/${createdRentalId}/collect returned 200`);
    assert(collectRes.body.data.status === 'COLLECTED', 'Rental transitioned to explicit COLLECTED state');
    assert(collectRes.body.data.collected_at !== null, 'collected_at timestamp recorded');
    assert(collectRes.body.data.due_date !== null, 'due_date timestamp generated for countdown tracker');

    // --- TEST 11: Lifecycle Step 7 (Condition Assessment, Fine & Deposit Refund Restock) ---
    console.log('\n--- TEST 11: Step 7 (Return Condition Inspection & Deposit Refund) ---');
    const returnRes = await request('PATCH', `/api/rentals/${createdRentalId}/return`, {
      condition_on_return: 'GOOD',
      damage_fine: 0,
      late_fine: 0,
      notes: 'Returned in pristine condition with original anti-static bag.'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(returnRes.status === 200, `PATCH /api/rentals/${createdRentalId}/return returned 200`);
    assert(returnRes.body.data.rental.status === 'RETURNED', 'Rental status updated to RETURNED');
    assert(returnRes.body.data.settlement.refunded_amount > 0, 'Security deposit refunded');
    assert(returnRes.body.data.refund_ledger.status === 'REFUNDED', 'Automated refund logged in payment ledger');

    // --- TEST 12: Admin Pillar 5 (E-Waste Donation 1-Click Restock) ---
    console.log('\n--- TEST 12: Admin Pillar 5 (Donations 1-Click Restock) ---');
    const restockRes = await request('POST', '/api/admin/donations/don-01/restock', {
      condition_grade: 'Grade A Refurbished',
      target_shelf: 'Green Shelf G-01',
      daily_rate: 8,
      security_deposit: 80
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(restockRes.status === 200, 'POST /api/admin/donations/don-01/restock returned 200');
    assert(restockRes.body.data.donation.status === 'RESTOCKED', 'Donation status updated to RESTOCKED');
    assert(restockRes.body.data.catalogItem.stock >= 1, 'Refurbished item active in catalog stock');

    // --- TEST 13: Admin Pillar 6 (Mini Project Mentorship Assignment) ---
    console.log('\n--- TEST 13: Admin Pillar 6 (Assign Faculty Mentor) ---');
    const mentorRes = await request('PATCH', '/api/admin/projects/proj-02/mentor', {
      mentor_name: 'Prof. K. Venkatesh',
      status: 'APPROVED'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(mentorRes.status === 200, 'PATCH /api/admin/projects/proj-02/mentor returned 200');
    assert(mentorRes.body.data.mentor_assigned === 'Prof. K. Venkatesh', 'Prof. K. Venkatesh assigned as faculty mentor');
    assert(mentorRes.body.data.status === 'APPROVED', 'Project status updated to APPROVED');

    // --- TEST 14: Admin Pillar 7 (Reports & Dynamic Revenue Sharing Slider) ---
    console.log('\n--- TEST 14: Admin Pillar 7 (Reports & Dynamic Revenue Sharing Slider) ---');
    const analyticsRes = await request('GET', '/api/admin/analytics?college_pct=75', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(analyticsRes.status === 200, 'GET /api/admin/analytics returned 200');
    assert(analyticsRes.body.data.kpis.utilization_rate_pct !== undefined, 'KPI utilization rate calculated');
    assert(analyticsRes.body.data.revenue_sharing.college_percentage === 75, 'College share set to 75%');
    assert(analyticsRes.body.data.revenue_sharing.service_provider_percentage === 25, 'Provider share set to 25%');

    // --- TEST 15: Admin Pillar 8 (Login Audit History) ---
    console.log('\n--- TEST 15: Admin Pillar 8 (Login Audit History) ---');
    const auditsRes = await request('GET', '/api/admin/audits/logins', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(auditsRes.status === 200, 'GET /api/admin/audits/logins returned 200');
    assert(auditsRes.body.data.length > 0, 'Audit history contains records');
    assert(auditsRes.body.data.some(a => a.email === 'admin@viva.edu.in' && a.status === 'SUCCESS'), 'Admin login captured in audit');

    console.log('\n======================================================');
    console.log(`  ALL API TESTS PASSED! (${passedTests}/${totalTests} assertions)`);
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Suite Aborted with Error:', err.message);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
