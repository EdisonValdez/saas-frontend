/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import * as z from 'zod'

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getAccessToken } from './get-access-token'
import { isJWTTokenValid } from './verify-token'
import type { NextRequest } from 'next/server'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getApiURL = () => {
    // Default API URL, potentially overridden by environment variables
    let url = 'http://127.0.0.1:8000' // Default to local development URL

    // Override with environment variable if available and not empty
    if (process.env.NEXT_PUBLIC_BACKEND_API_URL && process.env.NEXT_PUBLIC_BACKEND_API_URL.trim() !== '') {
        url = process.env.NEXT_PUBLIC_BACKEND_API_URL.trim()
    }

    // Ensure URL starts with http/https protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Default to https if not specified, especially for production
        url = `https://${url}`
    }

    // Enforce HTTPS in production for security
    if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
        console.warn(`getApiURL: Replacing http with https for URL '${url}' in production.`)
        url = url.replace('http://', 'https://')
    }

    return url
}

export const getApiURLWithEndpoint = (endpoint: string): string => {
    const url = getApiURL()
    return url.concat(endpoint)
}

export const postData = async ({ url, data = {} }: { url: string; data?: Record<string, any> }) => {
    try {
        // Send the POST request
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const resData = await res.json()
            return { response: resData || 'Oops, an error happened.', status: res.status, ok: false }
        }

        // Handle status 204 (No Content) separately
        if (res.status === 204) {
            return {
                response: null, // No content to return
                status: res.status,
                ok: true,
            }
        }

        // Attempt to parse response as JSON, handle non-JSON or empty responses
        let resData
        try {
            resData = await res.json()
        } catch (error) {
            resData = null
        }

        // Log details for debugging (can be removed in production)
        console.debug('Request URL:', url)
        console.debug('Request Data:', data)
        console.debug('Response Status:', res.status)
        console.debug('Response Data:', resData)

        // Check for successful status codes (200, 201, etc.)
        if (res.ok) {
            return {
                response: resData,
                status: res.status,
                ok: true,
            }
        }

        // Handle other HTTP errors
        return {
            response: resData || 'An error occurred. Please try again later.',
            status: res.status,
            ok: false,
        }
    } catch (error) {
        // Log error details for debugging (can be removed in production)
        console.error('Network error or CORS issue:', error)

        // Return a standard error response
        return {
            response: 'Network error or CORS issue',
            status: 0,
            ok: false,
        }
    }
}

export const splitPath = (path: string) => {
    const split = path.split('/')
    return split.filter((item) => item !== '')
}

// Replace with your actual error type
interface APIError {
    message: string
    details?: any // Use the appropriate type if you have a structure for detailed errors
}

async function authenticatedFetch<T>( // Added a generic type 'T' for API response data
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', // Restrict method parameter
    accessToken: string,
    body?: any // Optional body
): Promise<T> {
    const response = await fetch(endpoint, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${accessToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
        let errorDetails: APIError
        try {
            errorDetails = await response.json()
        } catch (err) {
            // Handle errors while parsing error details (if body is not JSON)
            errorDetails = { message: 'API Error' /* ... */ }
        }
        throw new Error(`API error with status ${response.status}: ${errorDetails.message}`)
    }

    // TypeScript infers the return type as 'T'
    return await response.json()
}

// This is a middleware function you might need to implement based on the suggestions.
// It should authenticate the request and attach the token or user information to the request object.
export async function authenticateAndValidate(
    request: NextRequest
): Promise<{ isValid: boolean; accessToken?: string; errors?: any }> {
    const accessToken = await getAccessToken()
    if (!accessToken) {
        return { isValid: false, errors: 'Unauthorized' }
    }

    const isTokenValid = await isJWTTokenValid(accessToken)
    if (!isTokenValid) {
        return { isValid: false, errors: 'Unauthorized' }
    }

    return { isValid: true, accessToken }
}

export function formatDateWithTime(dateString?: string) {
    return dateString ? new Date(dateString).toLocaleString() : ''
}

export async function parseContextAndAuthenticate(
    context: any,
    schema: z.ZodType<any>,
    req?: Request, // Optionally pass the request object
    bodySchema?: z.ZodType<any> // Optionally pass a schema for body validation
) {
    try {
        // Parse and validate context
        const parsedContext = schema.parse(context)
        const accessToken = await getAccessToken()

        if (!accessToken || !(await isJWTTokenValid(accessToken))) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // If a request and body schema are provided, validate the request body
        if (req && bodySchema && (req.method === 'POST' || req.method === 'PUT')) {
            const body = await req.json()
            const parsedBody = bodySchema.parse(body)
            return { ...parsedContext, accessToken, parsedBody }
        }

        return { ...parsedContext, accessToken }
    } catch (error) {
        console.error('Error parsing context:', error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Validation failed', details: error.issues }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        return new Response(JSON.stringify({ error: 'Invalid request context or unauthorized' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

/**
 * Cleans an object by removing keys with `null`, `undefined`, or empty string values.
 *
 * @param obj - The object to clean.
 * @returns A new object with the cleaned keys.
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key as keyof T] // Ensure the key is treated as keyof T
        if (value != null && value !== '') {
            // Explicitly define acc[key] as a mutable key in Partial<T>
            ;(acc as Partial<T>)[key as keyof T] = value // Use key as keyof T for type safety
        }
        return acc
    }, {} as Partial<T>)
}
