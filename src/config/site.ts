export type SiteConfig = typeof siteConfig

export const siteConfig = {
    name: 'Acme',
    description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    url: 'https://www.acme.com/',
    ogImage: '/',
    links: {
        twitter: '/',
        github: '/',
        docs: '/',
    },
    paths: {
        signIn: '/login',
        signUp: '/register',
        resendActivationLink: '/resend-activation',
        resetUsername: '/reset-username',

        // update from now on
        appHome: '/dashboard',
        settings: {
            profile: '/settings/profile',
            authentication: '/settings/profile/authentication',
            email: '/settings/profile/email',
            password: '/settings/profile/password',
        },
        api: {
            auth: {
                signUp: '/api/auth/register',
                userActivation: '/api/auth/activate-user',
                resendActivationLink: '/api/auth/resend-activation',
                resetUsername: '/api/auth/reset-username',
                resetPassword: '/api/auth/reset-password',
                passwordResetConfirm: '/api/auth/password-reset-confirm',
                usernameResetConfirm: '/api/auth/username-reset-confirm',
            },
            subscriptions: {
                pricing: '/api/subscriptions/pricing',
                plans: '/api/subscriptions/plans',
                checkout: '/api/subscriptions/checkout',
                userSubscription: '/api/subscriptions/my-subscription',
            },
            workspaces: {
                workspaces: '/api/workspaces/',
            },
            invitations: {
                invitations: '/api/invitations/',
            },
        },
    },
    backend: {
        api: {
            auth: {
                tokenCreate: '/auth/jwt/create/',
                tokenRefresh: '/auth/jwt/refresh/',
                tokenVerify: '/auth/jwt/verify/',
                users: '/auth/users/',
                userActivate: '/auth/users/activation/',
                resendActivationEmail: '/auth/users/resend_activation/',
                resetUsername: '/auth/users/reset_email/',
                resetPassword: '/auth/users/reset_password/',
                resetPasswordConfirm: '/auth/users/reset_password_confirm/',
                resetUsernameConfirm: '/auth/users/reset_email_confirm/',
                userDetails: '/auth/users/me/',
                userDelete: '/auth/users/me/',
            },
            subscriptions: {
                userSubscription: '/api/subscriptions/my-subscription/',
                userSubscriptionItems: '/api/subscriptions/my-subscription-items/',
                userSubscribableProducts: '/api/subscriptions/subscribable-product/',
                checkout: '/api/subscriptions/checkout/',
                stripeWebhook: '/api/subscriptions/webhook',
                billingPortal: '/api/subscriptions/customer-portal/',
            },
            //update from now on
            workspaces: {
                workspaces: '/api/workspaces/',
                teams: '/api/teams/',
                invitations: '/api/invitations/',
                workspaceMemberships: '/api/workspacememberships/',
                teamMemberships: '/api/teammemberships/',
                workspaceInvitations: '/api/invitations/workspace_invitations/?workspace_id=',
                teamInvitations: 'api/invitations/team_invitations/?team_id=',
            },
            teams: {},
            interests: {
                interests: '/api/interests/',
            },
        },
    },
}
