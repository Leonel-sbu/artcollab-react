/**
 * CSRF Protection Tests
 * Tests for CSRF token handling and protection
 * 
 * Run with: node tests/csrf.test.js
 * Requires: Backend running on localhost:5000
 */

const http = require('http');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5000;

// Test state
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

let testUser = { email: '', password: 'TestPass123!', name: 'Test User' };
let authCookie = '';
let csrfToken = '';

// ============================================
// Test Utilities
// ============================================

function generateEmail(prefix = 'user') {
    return `${prefix}${Date.now()}@test.com`;
}

function makeRequest(method, path, options = {}) {
    return new Promise((resolve, reject) => {
        const { body, headers = {}, cookie = '' } = options;

        const data = body ? JSON.stringify(body) : null;
        const requestHeaders = {
            'Content-Type': 'application/json',
            'Content-Length': data ? Buffer.byteLength(data) : 0,
            ...headers
        };

        if (cookie) {
            requestHeaders['Cookie'] = cookie;
        }

        const req = http.request({
            hostname: API_HOST,
            port: API_PORT,
            path,
            method,
            headers: requestHeaders
        }, (res) => {
            let responseData = '';
            const setCookie = res.headers['set-cookie'];

            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    resolve({
                        status: res.statusCode,
                        data: parsed,
                        cookie: setCookie
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        cookie: setCookie
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) req.write(data);
        req.end();
    });
}

function extractCookie(cookieArray) {
    if (!cookieArray) return '';
    return cookieArray.map(c => c.split(';')[0]).join('; ');
}

async function test(name, fn) {
    testCount++;
    try {
        await fn();
        passedCount++;
        console.log(`✓ ${name}`);
    } catch (error) {
        failedCount++;
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertStatus(res, expected, message = '') {
    assert(res.status === expected,
        `${message} Expected ${expected}, got ${res.status}. Response: ${JSON.stringify(res.data)}`);
}

// ============================================
// CSRF Tests
// ============================================

async function testCsrfTokenEndpointPublic() {
    // CSRF token endpoint should be public (exempt from CSRF)
    const res = await makeRequest('GET', '/api/csrf-token');

    assertStatus(res, 200, 'CSRF token endpoint should be accessible');
    assert(res.data.csrfToken, 'Should return CSRF token');
    csrfToken = res.data.csrfToken;
}

async function testLoginWithoutCsrfWorks() {
    // Login should work without CSRF (exempt route)
    testUser.email = generateEmail('logincsrf');

    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    const res = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    assertStatus(res, 200, 'Login without CSRF should work');

    if (res.cookie) {
        authCookie = extractCookie(res.cookie);
    }
}

async function testRegisterWithoutCsrfWorks() {
    // Register should work without CSRF (exempt route)
    testUser.email = generateEmail('regcsrf');

    const res = await makeRequest('POST', '/api/auth/register', {
        body: {
            name: 'CSRF Test',
            email: testUser.email,
            password: 'TestPass123!'
        }
    });

    assertStatus(res, 201, 'Register without CSRF should work');
}

async function testStateChangeWithoutCsrfRejected() {
    // Get fresh auth
    testUser.email = generateEmail('statecsrf');

    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    const loginRes = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    if (loginRes.cookie) {
        authCookie = extractCookie(loginRes.cookie);
    }

    // Try to create artwork WITHOUT CSRF token - should be rejected
    const res = await makeRequest('POST', '/api/artworks', {
        body: {
            title: 'Test Artwork',
            price: 1000,
            description: 'Test'
        },
        cookie: authCookie
    });

    // CSRF should reject (403) or require auth
    assert(res.status === 403 || res.status === 401,
        'State-changing without CSRF should be rejected');
}

async function testStateChangeWithValidCsrfSucceeds() {
    // Get fresh auth
    testUser.email = generateEmail('validcsrf');

    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    const loginRes = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    let sessionCookie = '';
    if (loginRes.cookie) {
        sessionCookie = extractCookie(loginRes.cookie);
        authCookie = sessionCookie;
    }

    // Get CSRF token - this will also set/update the CSRF cookie
    const csrfRes = await makeRequest('GET', '/api/csrf-token', {
        cookie: sessionCookie
    });

    assert(csrfRes.data.csrfToken, 'Should get CSRF token');
    csrfToken = csrfRes.data.csrfToken;

    // Extract the CSRF cookie from the response - this is needed for validation
    let csrfCookie = '';
    if (csrfRes.cookie) {
        csrfCookie = extractCookie(csrfRes.cookie);
    }

    // Combine cookies - we need BOTH the session cookie and the CSRF cookie
    const combinedCookie = sessionCookie + (csrfCookie ? '; ' + csrfCookie : '');

    // Try to create artwork WITH CSRF token
    const res = await makeRequest('POST', '/api/artworks', {
        body: {
            title: 'Test Artwork',
            price: 1000,
            description: 'Test'
        },
        cookie: combinedCookie,
        headers: {
            'X-CSRF-Token': csrfToken
        }
    });

    // Should not be rejected by CSRF (might fail for other reasons like validation)
    assert(res.status !== 403, 'Valid CSRF token should not be rejected. Got: ' + JSON.stringify(res.data));
}

async function testLogoutWithoutCsrfWorks() {
    // Logout should work without CSRF (exempt route)
    testUser.email = generateEmail('logoutcsrf');

    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    const loginRes = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    if (loginRes.cookie) {
        authCookie = extractCookie(loginRes.cookie);
    }

    // Logout without CSRF should work
    const res = await makeRequest('POST', '/api/auth/logout', {
        cookie: authCookie
    });

    assertStatus(res, 200, 'Logout without CSRF should work');
}

async function testProtectedGetStillWorks() {
    // GET requests should not require CSRF
    testUser.email = generateEmail('getcsrf');

    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    const loginRes = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    if (loginRes.cookie) {
        authCookie = extractCookie(loginRes.cookie);
    }

    // GET to protected route should work without CSRF
    const res = await makeRequest('GET', '/api/auth/me', {
        cookie: authCookie
    });

    assertStatus(res, 200, 'GET to protected route should work without CSRF');
}

// ============================================
// Run Tests
// ============================================

async function runTests() {
    console.log('========================================');
    console.log('CSRF Protection Tests');
    console.log('========================================\n');

    // CSRF Tests
    console.log('--- CSRF Endpoint Tests ---');
    await test('CSRF token endpoint public', testCsrfTokenEndpointPublic);

    console.log('\n--- Auth Without CSRF ---');
    await test('Login without CSRF', testLoginWithoutCsrfWorks);
    await test('Register without CSRF', testRegisterWithoutCsrfWorks);
    await test('Logout without CSRF', testLogoutWithoutCsrfWorks);

    console.log('\n--- CSRF Protection ---');
    await test('State change without CSRF rejected', testStateChangeWithoutCsrfRejected);
    await test('State change with valid CSRF succeeds', testStateChangeWithValidCsrfSucceeds);

    console.log('\n--- GET Requests ---');
    await test('Protected GET without CSRF works', testProtectedGetStillWorks);

    // Summary
    console.log('\n========================================');
    console.log(`Results: ${passedCount}/${testCount} passed`);
    if (failedCount > 0) {
        console.log(`Failed: ${failedCount}`);
    }
    console.log('========================================');

    process.exit(failedCount > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
