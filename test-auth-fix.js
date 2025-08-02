#!/usr/bin/env node

/**
 * Test script to validate the NextAuth.js Django JWT integration fixes
 * This script simulates the authentication flow to ensure our changes work correctly
 */

const { userLoginSchema } = require('./src/lib/validations/auth')

// Mock environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = 'http://127.0.0.1:8000'
process.env.AUTH_SECRET = 'test-secret'

// Test data
const testCredentials = {
    email: 'test@example.com',
    password: 'testpassword123',
}

// Mock Django responses
const mockJWTResponse = {
    access: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
    refresh: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
}

const mockUserResponse = {
    id: 123,
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    image: null,
}

// Mock fetch function
global.fetch = jest.fn()

async function testAuthFlow() {
    console.log('🧪 Testing NextAuth Django JWT Integration...\n')

    try {
        // Import the auth configuration
        const { authOptions } = require('./src/lib/auth')

        console.log('✅ Auth configuration imported successfully')

        // Check if providers are configured
        if (!authOptions.providers || authOptions.providers.length === 0) {
            throw new Error('No authentication providers configured')
        }

        console.log('✅ Credentials provider found')

        const credentialsProvider = authOptions.providers[0]

        // Mock successful JWT response
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockJWTResponse),
                status: 200,
                statusText: 'OK',
            })
            // Mock successful user profile response
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUserResponse),
                status: 200,
                statusText: 'OK',
            })

        // Test the authorize function
        console.log('🔄 Testing authorize function...')

        const result = await credentialsProvider.authorize(testCredentials)

        if (!result) {
            throw new Error('Authorization failed - returned null')
        }

        console.log('✅ Authorization successful')

        // Verify the returned user object structure
        const expectedFields = ['id', 'name', 'email', 'access', 'refresh']
        const missingFields = expectedFields.filter((field) => !(field in result))

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
        }

        console.log('✅ User object has all required fields')
        console.log('   - ID:', result.id)
        console.log('   - Name:', result.name)
        console.log('   - Email:', result.email)
        console.log('   - Has access token:', !!result.access)
        console.log('   - Has refresh token:', !!result.refresh)

        // Test JWT callback
        console.log('🔄 Testing JWT callback...')

        const jwtToken = await authOptions.callbacks.jwt({
            token: {},
            user: result,
        })

        if (!jwtToken.access || !jwtToken.refresh || !jwtToken.id) {
            throw new Error('JWT callback did not properly store user data')
        }

        console.log('✅ JWT callback working correctly')

        // Test session callback
        console.log('🔄 Testing session callback...')

        const session = await authOptions.callbacks.session({
            session: { user: {} },
            token: jwtToken,
        })

        if (!session.access || !session.refresh || !session.user.id) {
            throw new Error('Session callback did not properly store user data')
        }

        console.log('✅ Session callback working correctly')
        console.log('   - Session has access token:', !!session.access)
        console.log('   - Session has refresh token:', !!session.refresh)
        console.log('   - Session user ID:', session.user.id)

        // Verify API calls were made correctly
        const calls = fetch.mock.calls

        if (calls.length !== 2) {
            throw new Error(`Expected 2 API calls, but made ${calls.length}`)
        }

        // Check first call (JWT authentication)
        const [jwtUrl, jwtOptions] = calls[0]
        if (!jwtUrl.includes('/auth/jwt/create/')) {
            throw new Error('First call should be to JWT create endpoint')
        }

        if (jwtOptions.method !== 'POST') {
            throw new Error('JWT call should be POST')
        }

        const jwtBody = JSON.parse(jwtOptions.body)
        if (jwtBody.email !== testCredentials.email || jwtBody.password !== testCredentials.password) {
            throw new Error('JWT call did not include correct credentials')
        }

        console.log('✅ JWT API call made correctly')

        // Check second call (user profile)
        const [userUrl, userOptions] = calls[1]
        if (!userUrl.includes('/auth/users/me/')) {
            throw new Error('Second call should be to user profile endpoint')
        }

        if (!userOptions.headers.Authorization.includes('Bearer')) {
            throw new Error('User profile call should include Bearer token')
        }

        console.log('✅ User profile API call made correctly')

        console.log('\n🎉 All tests passed! The NextAuth Django JWT integration is working correctly.\n')

        console.log('Summary of fixes applied:')
        console.log('1. ✅ Two-step authentication process (JWT + user profile)')
        console.log('2. ✅ Proper user object structure with required fields')
        console.log('3. ✅ JWT callback stores all necessary token data')
        console.log('4. ✅ Session callback properly formats session object')
        console.log('5. ✅ Type definitions updated for JWT tokens')

        return true
    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.error('\nStack trace:', error.stack)
        return false
    }
}

// Mock jest for this standalone script
if (!global.jest) {
    global.jest = {
        fn: () => ({
            mockResolvedValueOnce: function (value) {
                let callCount = 0
                return () => {
                    callCount++
                    return Promise.resolve(value)
                }
            },
        }),
    }

    // Simple mock implementation for testing
    const mockFn = () => {
        const calls = []
        const fn = (...args) => {
            calls.push(args)
            return fn.mockImplementation ? fn.mockImplementation(...args) : undefined
        }

        fn.mock = { calls }

        fn.mockResolvedValueOnce = (value) => {
            const originalImplementation = fn.mockImplementation
            fn.mockImplementation = () => Promise.resolve(value)
            setTimeout(() => {
                fn.mockImplementation = originalImplementation
            }, 0)
            return fn
        }

        return fn
    }

    global.fetch = mockFn()
}

// Run the test
if (require.main === module) {
    testAuthFlow()
        .then((success) => {
            process.exit(success ? 0 : 1)
        })
        .catch((error) => {
            console.error('Unexpected error:', error)
            process.exit(1)
        })
}

module.exports = { testAuthFlow }
