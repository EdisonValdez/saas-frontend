import { getApiURL } from './utils'

export async function testDirectAuthentication(email: string, password: string) {
    console.log('[DEBUG] Starting direct authentication test')
    console.log('[DEBUG] Email:', email)

    try {
        const BACKEND_URL = getApiURL()
        const endpoint = `${BACKEND_URL}/auth/jwt/create/`

        console.log('[DEBUG] Backend URL:', BACKEND_URL)
        console.log('[DEBUG] Auth endpoint:', endpoint)

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        console.log('[DEBUG] Direct auth response status:', response.status)
        console.log('[DEBUG] Response headers:', Object.fromEntries(response.headers.entries()))

        const responseText = await response.text()
        console.log('[DEBUG] Response body (raw text):', responseText)

        let data
        try {
            data = JSON.parse(responseText)
            console.log('[DEBUG] Parsed JSON data:', data)
        } catch (e) {
            console.error('[DEBUG] JSON parse error:', e)
            return {
                success: false,
                error: 'Invalid JSON response',
                responseText,
                status: response.status,
            }
        }

        const result = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            data,
            responseText,
        }

        console.log('[DEBUG] Final authentication test result:', result)
        return result
    } catch (error) {
        console.error('[DEBUG] Direct auth exception:')
        console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown error')
        console.error('  - Error name:', error instanceof Error ? error.name : 'Unknown')
        console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        console.error('  - Full error object:', error)

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
        }
    }
}

export async function testBackendConnection() {
    console.log('[DEBUG] Testing backend connection')

    try {
        const BACKEND_URL = getApiURL()
        console.log('[DEBUG] Testing connection to:', BACKEND_URL)

        // Try a simple GET request to see if the backend is reachable
        const response = await fetch(BACKEND_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        console.log('[DEBUG] Backend connection test - Status:', response.status)
        console.log('[DEBUG] Backend connection test - Status Text:', response.statusText)

        const responseText = await response.text()
        console.log('[DEBUG] Backend response:', responseText.substring(0, 200))

        return {
            success: true,
            status: response.status,
            statusText: response.statusText,
            backendUrl: BACKEND_URL,
            responsePreview: responseText.substring(0, 200),
        }
    } catch (error) {
        console.error('[DEBUG] Backend connection failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            backendUrl: getApiURL(),
        }
    }
}
