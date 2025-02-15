import { auth } from './lib/auth'

export const BASE_PATH = '/api/auth'

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|login|pricing|about).*)',
        '/api/workspaces/:path*',
        '/api/teams/:path*',
        '/api/invitations/checkout',
        '/api/subscriptions/create-portal-link',
        '/dashboard/:path*',
    ],
}

export default auth((req) => {
    console.log('Middleware', req.url)
    // const reqUrl = new URL(req.url)
    // if (!req.auth && reqUrl.pathname !== '/') {
    //     const url = req.url.replace(req.nextUrl.pathname, '/login')
    //     return Response.redirect(url)
    // }
})
