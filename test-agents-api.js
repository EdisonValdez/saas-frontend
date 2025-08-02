#!/usr/bin/env node

/**
 * Test script for /api/agents/invoke endpoint
 * 
 * This script helps verify that the JWT token forwarding is working correctly.
 * Run this after starting your Next.js development server.
 */

const BASE_URL = 'http://localhost:3000'

async function testAgentsAPI() {
    console.log('🧪 Testing /api/agents/invoke endpoint...\n')

    try {
        // Test 1: Unauthenticated request (should fail with 401)
        console.log('1. Testing unauthenticated request...')
        const unauthResponse = await fetch(`${BASE_URL}/api/agents/invoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: 'Test prompt'
            })
        })

        if (unauthResponse.status === 401) {
            console.log('✅ Unauthenticated request correctly rejected (401)')
        } else {
            console.log(`❌ Expected 401, got ${unauthResponse.status}`)
        }

        // Test 2: Invalid request body
        console.log('\n2. Testing invalid request body...')
        const invalidResponse = await fetch(`${BASE_URL}/api/agents/invoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Missing prompt field
            })
        })

        if (invalidResponse.status === 400 || invalidResponse.status === 401) {
            console.log('✅ Invalid request body correctly rejected')
        } else {
            console.log(`❌ Expected 400 or 401, got ${invalidResponse.status}`)
        }

        // Test 3: GET request (should be method not allowed)
        console.log('\n3. Testing GET request...')
        const getResponse = await fetch(`${BASE_URL}/api/agents/invoke`, {
            method: 'GET'
        })

        if (getResponse.status === 405) {
            console.log('✅ GET request correctly rejected (405)')
        } else {
            console.log(`❌ Expected 405, got ${getResponse.status}`)
        }

        console.log('\n📝 To test authenticated requests:')
        console.log('1. Start your Next.js development server: npm run dev')
        console.log('2. Log in to your application')
        console.log('3. Open browser developer tools')
        console.log('4. Navigate to Network tab')
        console.log('5. Make a request to the chat agent')
        console.log('6. Check the /api/agents/invoke request in the Network tab')
        console.log('7. Verify the request is being made and has proper status code')

    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.log('\n🔧 Make sure your Next.js server is running on http://localhost:3000')
    }
}

// Run the test
testAgentsAPI()
