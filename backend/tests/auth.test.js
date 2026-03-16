/**
 * Comprehensive End-to-End Test Suite for User Registration Flow
 * 
 * This test suite validates:
 * - Successful registration with valid credentials
 * - Validation of required fields and input constraints
 * - Handling of whitespace-only and invalid inputs
 * - Duplicate email prevention
 * - Proper error messages for all failure scenarios
 * - Integration with frontend expected responses
 * 
 * Run with: node tests/auth.test.js
 */

const http = require('http');

const API_BASE_URL = process.env.API_BASE_URL || 'localhost';
const API_PORT = process.env.API_PORT || 5000;

// Test utilities
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

function generateUniqueEmail(prefix = 'test') {
    const timestamp = Date.now();
    return `${prefix}${timestamp}@test.com`;
}

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: API_BASE_URL,
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? Buffer.byteLength(data) : 0
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(data);
        }
        req.end();
    });
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
    if (!condition) {
        throw new Error(message);
    }
}

function assertStatus(response, expectedStatus, operation) {
    assert(
        response.status === expectedStatus,
        `${operation} - Expected status ${expectedStatus}, got ${response.status}`
    );
}

function assertSuccess(response, operation) {
    assert(
        response.data.success === true,
        `${operation} - Expected success=true, got ${response.data.success}`
    );
}

function assertFail(response, operation) {
    assert(
        response.data.success === false,
        `${operation} - Expected success=false, got ${response.data.success}`
    );
}

function assertMessage(response, expectedMessage, operation) {
    assert(
        response.data.message === expectedMessage,
        `${operation} - Expected message "${expectedMessage}", got "${response.data.message}"`
    );
}

function assertHasToken(response, operation) {
    assert(
        response.data.token && typeof response.data.token === 'string',
        `${operation} - Expected token in response`
    );
}

function assertHasUser(response, operation) {
    assert(
        response.data.user && typeof response.data.user === 'object',
        `${operation} - Expected user object in response`
    );
}

async function runTests() {
    console.log('\n========================================');
    console.log('User Registration Flow - E2E Test Suite');
    console.log('========================================\n');
    console.log(`API: http://${API_BASE_URL}:${API_PORT}\n`);

    // Test 1: Successful registration with valid credentials
    await test('POST /api/auth/register - Valid registration returns 201', async () => {
        const email = generateUniqueEmail();
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Valid Test User',
            email: email,
            password: 'password123'
        });

        assertStatus(response, 201, 'Registration');
        assertSuccess(response, 'Registration');
        assertHasToken(response, 'Registration');
        assertHasUser(response, 'Registration');
        assert(response.data.user.name === 'Valid Test User', 'User name mismatch');
        assert(response.data.user.email === email, 'User email mismatch');
        assert(response.data.user.role === 'artist', 'Default role should be artist');
    });

    // Test 2: Registration with different valid roles
    await test('POST /api/auth/register - Registration with role=buyer', async () => {
        const email = generateUniqueEmail('buyer');
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Buyer User',
            email: email,
            password: 'password123',
            role: 'buyer'
        });

        assertStatus(response, 201, 'Buyer registration');
        assertSuccess(response, 'Buyer registration');
        assert(response.data.user.role === 'buyer', 'Role should be buyer');
    });

    await test('POST /api/auth/register - Registration with role=learner', async () => {
        const email = generateUniqueEmail('learner');
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Learner User',
            email: email,
            password: 'password123',
            role: 'learner'
        });

        assertStatus(response, 201, 'Learner registration');
        assert(response.data.user.role === 'learner', 'Role should be learner');
    });

    await test('POST /api/auth/register - Registration with role=admin', async () => {
        const email = generateUniqueEmail('admin');
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Admin User',
            email: email,
            password: 'password123',
            role: 'admin'
        });

        assertStatus(response, 201, 'Admin registration');
        assert(response.data.user.role === 'admin', 'Role should be admin');
    });

    // Test 3: Email normalization (case insensitivity)
    await test('POST /api/auth/register - Email normalization (lowercase)', async () => {
        const email = generateUniqueEmail('normalize');
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Normalized User',
            email: email.toUpperCase(),
            password: 'password123'
        });

        assertStatus(response, 201, 'Email normalization');
        assert(response.data.user.email === email.toLowerCase(), 'Email should be normalized to lowercase');
    });

    // Test 4: Name trimming
    await test('POST /api/auth/register - Name trimming (whitespace)', async () => {
        const email = generateUniqueEmail('trim');
        const response = await makeRequest('POST', '/api/auth/register', {
            name: '  John Doe  ',
            email: email,
            password: 'password123'
        });

        assertStatus(response, 201, 'Name trimming');
        assert(response.data.user.name === 'John Doe', 'Name should be trimmed');
    });

    // Test 5: Required fields validation
    await test('POST /api/auth/register - Missing name returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {
            email: generateUniqueEmail('noname'),
            password: 'password123'
        });

        assertStatus(response, 400, 'Missing name');
        assertFail(response, 'Missing name');
        assertMessage(response, 'name, email, password are required', 'Missing name');
    });

    await test('POST /api/auth/register - Missing email returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Test User',
            password: 'password123'
        });

        assertStatus(response, 400, 'Missing email');
        assertFail(response, 'Missing email');
        assertMessage(response, 'name, email, password are required', 'Missing email');
    });

    await test('POST /api/auth/register - Missing password returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Test User',
            email: generateUniqueEmail('nopass')
        });

        assertStatus(response, 400, 'Missing password');
        assertFail(response, 'Missing password');
        assertMessage(response, 'name, email, password are required', 'Missing password');
    });

    await test('POST /api/auth/register - Empty body returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {});

        assertStatus(response, 400, 'Empty body');
        assertFail(response, 'Empty body');
        assertMessage(response, 'name, email, password are required', 'Empty body');
    });

    // Test 6: Whitespace-only inputs
    await test('POST /api/auth/register - Whitespace-only name returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {
            name: '   ',
            email: generateUniqueEmail('wsname'),
            password: 'password123'
        });

        assertStatus(response, 400, 'Whitespace name');
        assertFail(response, 'Whitespace name');
        assertMessage(response, 'Name cannot be empty or contain only whitespace', 'Whitespace name');
    });

    // Test 7: Password length validation
    await test('POST /api/auth/register - Password less than 8 chars returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Test User',
            email: generateUniqueEmail('shortpass'),
            password: '1234567'
        });

        assertStatus(response, 400, 'Short password');
        assertFail(response, 'Short password');
        assertMessage(response, 'Password must be at least 8 characters', 'Short password');
    });

    await test('POST /api/auth/register - Password exactly 8 chars succeeds', async () => {
        const email = generateUniqueEmail('exactpass');
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Test User',
            email: email,
            password: '12345678'
        });

        assertStatus(response, 201, 'Exact 8 char password');
        assertSuccess(response, 'Exact 8 char password');
    });

    // Test 8: Invalid role validation
    await test('POST /api/auth/register - Invalid role returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Test User',
            email: generateUniqueEmail('invalidrole'),
            password: 'password123',
            role: 'superadmin'
        });

        assertStatus(response, 400, 'Invalid role');
        assertFail(response, 'Invalid role');
        assertMessage(response, 'Invalid role. Must be one of: admin, artist, buyer, learner', 'Invalid role');
    });

    await test('POST /api/auth/register - Invalid role (number) returns 400', async () => {
        const response = await makeRequest('POST', '/api/auth/register', {
            name: 'Test User',
            email: generateUniqueEmail('invalidrole2'),
            password: 'password123',
            role: 123
        });

        assertStatus(response, 400, 'Invalid role type');
        assertFail(response, 'Invalid role type');
    });

    // Test 9: Duplicate email prevention
    await test('POST /api/auth/register - Duplicate email returns 409', async () => {
        const email = generateUniqueEmail('duplicate');

        // First registration should succeed
        const response1 = await makeRequest('POST', '/api/auth/register', {
            name: 'First User',
            email: email,
            password: 'password123'
        });
        assertStatus(response1, 201, 'First registration');

        // Second registration with same email should fail
        const response2 = await makeRequest('POST', '/api/auth/register', {
            name: 'Second User',
            email: email,
            password: 'password123'
        });
        assertStatus(response2, 409, 'Duplicate email');
        assertFail(response2, 'Duplicate email');
        assertMessage(response2, 'Email already in use', 'Duplicate email');
    });

    // Test 10: Case-insensitive duplicate email
    await test('POST /api/auth/register - Case-insensitive duplicate email returns 409', async () => {
        const email = generateUniqueEmail('caseinsensitive');

        // First registration
        const response1 = await makeRequest('POST', '/api/auth/register', {
            name: 'First User',
            email: email,
            password: 'password123'
        });
        assertStatus(response1, 201, 'First registration');

        // Second registration with different case
        const response2 = await makeRequest('POST', '/api/auth/register', {
            name: 'Second User',
            email: email.toUpperCase(),
            password: 'password123'
        });
        assertStatus(response2, 409, 'Case-insensitive duplicate');
        assertFail(response2, 'Case-insensitive duplicate');
    });

    // Test 11: Special characters in name
    await test('POST /api/auth/register - Name with special characters succeeds', async () => {
        const email = generateUniqueEmail('special');
        const response = await makeRequest('POST', '/api/auth/register', {
            name: "John O'Brien-Smith",
            email: email,
            password: 'password123'
        });

        assertStatus(response, 201, 'Special chars in name');
        assert(response.data.user.name === "John O'Brien-Smith", 'Name with special chars should be preserved');
    });

    // Test 12: Long but valid inputs
    await test('POST /api/auth/register - Long name succeeds', async () => {
        const email = generateUniqueEmail('longname');
        const longName = 'A'.repeat(100);
        const response = await makeRequest('POST', '/api/auth/register', {
            name: longName,
            email: email,
            password: 'password123'
        });

        assertStatus(response, 201, 'Long name');
        assert(response.data.user.name === longName, 'Long name should be preserved');
    });

    // Test 13: Login flow after registration
    await test('POST /api/auth/login - Can login after registration', async () => {
        const email = generateUniqueEmail('login');
        const password = 'password123';

        // Register
        await makeRequest('POST', '/api/auth/register', {
            name: 'Login Test',
            email: email,
            password: password
        });

        // Login
        const response = await makeRequest('POST', '/api/auth/login', {
            email: email,
            password: password
        });

        assertStatus(response, 200, 'Login after registration');
        assertSuccess(response, 'Login after registration');
        assertHasToken(response, 'Login after registration');
        assertHasUser(response, 'Login after registration');
    });

    // Test 14: Login with wrong password
    await test('POST /api/auth/login - Wrong password returns 401', async () => {
        const email = generateUniqueEmail('wrongpass');
        const password = 'password123';

        // Register
        await makeRequest('POST', '/api/auth/register', {
            name: 'Test',
            email: email,
            password: password
        });

        // Login with wrong password
        const response = await makeRequest('POST', '/api/auth/login', {
            email: email,
            password: 'wrongpassword'
        });

        assertStatus(response, 401, 'Wrong password');
        assertFail(response, 'Wrong password');
    });

    // Test 15: Login with non-existent user
    await test('POST /api/auth/login - Non-existent user returns 401', async () => {
        const response = await makeRequest('POST', '/api/auth/login', {
            email: 'nonexistent@test.com',
            password: 'password123'
        });

        assertStatus(response, 401, 'Non-existent user');
        assertFail(response, 'Non-existent user');
    });

    // Print summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    console.log(`Total: ${testCount}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log('========================================\n');

    // Exit with appropriate code
    process.exit(failedCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
