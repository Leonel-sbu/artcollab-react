
/**
 * Production Integration Tests
 * Critical flows for production readiness validation
 * 
 * Run with: node tests/integration.test.js
 * Requires: Backend running on localhost:5000
 */

const http = require('http');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5000;

// Test state
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

// Test users (generated per test run)
let testUser = { email: '', password: 'TestPass123!', name: 'Test User' };
let adminUser = { email: 'admin@artcollab.com', password: 'AdminPass123!' };
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

            // Capture cookies from response
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

async function fetchCsrfToken(cookie = '') {
    const res = await makeRequest('GET', '/api/csrf-token', {
        cookie
    });

    if (res.status !== 200 || !res.data.csrfToken) {
        throw new Error('Unable to fetch CSRF token');
    }

    const csrfCookie = extractCookie(res.cookie);
    return {
        csrfToken: res.data.csrfToken,
        csrfCookie
    };
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
// Auth Flow Tests
// ============================================

async function testRegistration() {
    testUser.email = generateEmail('register');

    const res = await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    assertStatus(res, 201, 'Registration');
    assert(res.data.success === true, 'Registration should succeed');
    assert(res.data.user, 'Should return user');
    assert(res.data.user.email === testUser.email, 'Should return correct email');

    // Store auth cookie
    if (res.cookie) {
        authCookie = extractCookie(res.cookie);
    }
}

async function testLogin() {
    testUser.email = generateEmail('login');

    // First register
    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    // Now test login
    const res = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    assertStatus(res, 200, 'Login');
    assert(res.data.success === true, 'Login should succeed');

    // Store auth cookie
    if (res.cookie) {
        authCookie = extractCookie(res.cookie);
    }
}

async function testLoginInvalidCredentials() {
    const res = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: 'nonexistent@test.com',
            password: 'wrongpassword'
        }
    });

    assertStatus(res, 401, 'Invalid login should return 401');
}

async function testLogout() {
    // First login to get cookie
    testUser.email = generateEmail('logout');
    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    // Now logout
    const res = await makeRequest('POST', '/api/auth/logout', {
        cookie: authCookie
    });

    assertStatus(res, 200, 'Logout');
}

async function testGetMe() {
    // First login to get cookie
    testUser.email = generateEmail('me');
    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    // Test /me endpoint
    const res = await makeRequest('GET', '/api/auth/me', {
        cookie: authCookie
    });

    assertStatus(res, 200, 'Get /me');
    assert(res.data.user, 'Should return user');
}

// ============================================
// Protected Route Tests
// ============================================

async function testProtectedRouteWithoutAuth() {
    const res = await makeRequest('GET', '/api/auth/me');

    assertStatus(res, 401, 'Protected route without auth should return 401');
}

async function testArtworkCreateWithoutAuth() {
    const res = await makeRequest('POST', '/api/artworks', {
        body: {
            title: 'Test Artwork',
            price: 1000,
            description: 'Test'
        }
    });

    assertStatus(res, 401, 'Create artwork without auth should return 401');
}

async function testCartWithoutAuth() {
    const res = await makeRequest('GET', '/api/cart');

    assertStatus(res, 401, 'Cart without auth should return 401');
}

// ============================================
// Admin Route Tests
// ============================================

async function testAdminRouteWithoutAuth() {
    const res = await makeRequest('GET', '/api/admin/stats');

    assertStatus(res, 401, 'Admin route without auth should return 401');
}

async function testAdminRouteWithRegularUser() {
    // Create regular user
    testUser.email = generateEmail('regular');
    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    // Login as regular user
    await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    // Try to access admin route
    const res = await makeRequest('GET', '/api/admin/stats', {
        cookie: authCookie
    });

    assertStatus(res, 403, 'Regular user accessing admin should return 403');
}

// ============================================
// Validation Tests
// ============================================

async function testRegistrationValidation() {
    const res = await makeRequest('POST', '/api/auth/register', {
        body: {
            name: '',  // Invalid - empty
            email: 'not-an-email',  // Invalid
            password: 'short'  // Too short
        }
    });

    assertStatus(res, 400, 'Invalid registration should return 400');
    assert(res.data.errors, 'Should return validation errors');
}

async function testArtworkValidation() {
    // Login first
    testUser.email = generateEmail('artval');
    await makeRequest('POST', '/api/auth/register', {
        body: {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password
        }
    });

    await makeRequest('POST', '/api/auth/login', {
        body: {
            email: testUser.email,
            password: testUser.password
        }
    });

    // Get CSRF token for authenticated request
    const csrfData = await fetchCsrfToken(authCookie);
    const combinedCookie = authCookie + (csrfData.csrfCookie ? '; ' + csrfData.csrfCookie : '');

    // Try to create artwork with invalid data
    const res = await makeRequest('POST', '/api/artworks', {
        body: {
            title: '',  // Invalid - empty
            price: 'not-a-number'  // Invalid
        },
        cookie: combinedCookie,
        headers: {
            'X-CSRF-Token': csrfData.csrfToken
        }
    });

    assertStatus(res, 400, 'Invalid artwork should return 400');
}

// ============================================
// Rate Limiting Tests
// ============================================

async function testLoginRateLimit() {
    // Try to login with wrong password multiple times
    for (let i = 0; i < 6; i++) {
        await makeRequest('POST', '/api/auth/login', {
            body: {
                email: 'ratelimit@test.com',
                password: 'wrong'
            }
        });
    }

    // 7th attempt should be rate limited
    const res = await makeRequest('POST', '/api/auth/login', {
        body: {
            email: 'ratelimit@test.com',
            password: 'wrong'
        }
    });

    assertStatus(res, 429, 'Rate limited requests should return 429');
}

// ============================================
// Health Check Tests
// ============================================

async function testHealthEndpoint() {
    const res = await makeRequest('GET', '/api/health');

    assertStatus(res, 200, 'Health check');
    assert(res.data.status === 'ok' || res.data.status === 'degraded', 'Should return status');
}

async function testHealthDatabaseCheck() {
    const res = await makeRequest('GET', '/api/health');

    assert(res.data.database, 'Should include database status');
}

// ============================================
// Run All Tests
// ============================================

async function runTests() {
    console.log('========================================');
    console.log('Production Integration Tests');
    console.log('========================================\n');

    // Auth Tests
    console.log('--- Auth Flow Tests ---');
    await test('Registration', testRegistration);
    await test('Login', testLogin);
    await test('Invalid login credentials', testLoginInvalidCredentials);
    await test('Logout', testLogout);
    await test('Get /me', testGetMe);

    // Protected Routes
    console.log('\n--- Protected Route Tests ---');
    await test('Protected route without auth', testProtectedRouteWithoutAuth);
    await test('Create artwork without auth', testArtworkCreateWithoutAuth);
    await test('Cart without auth', testCartWithoutAuth);

    // Admin Routes
    console.log('\n--- Admin Route Tests ---');
    await test('Admin route without auth', testAdminRouteWithoutAuth);
    await test('Admin route with regular user', testAdminRouteWithRegularUser);

    // Validation
    console.log('\n--- Validation Tests ---');
    await test('Registration validation', testRegistrationValidation);
    await test('Artwork validation', testArtworkValidation);

    // Rate Limiting
    console.log('\n--- Rate Limiting Tests ---');
    await test('Login rate limit', testLoginRateLimit);

    // Health
    console.log('\n--- Health Check Tests ---');
    await test('Health endpoint', testHealthEndpoint);
    await test('Health database check', testHealthDatabaseCheck);

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
