// export interface StripePrice {
//   id: string | null;
//   object: string | null;
//   active: boolean | null;
//   billingScheme: string | null;
//   created: number | null;
//   currency: string | null;
//   livemode: boolean | null;
//   lookupKey: string | null;
//   metadata: object | null;
//   nickname: string | null;
//   product: string | null;
//   recurring: any;
//   taxBehavior: string | null;
//   tiersMmode: string | null;
//   transformQuantity: string | null;
//   type: string | null;
//   unitAmount: number | null;
//   unitAamountDecimal: string;
// }

export interface StripePrice {
    freq: string
    interval: string
    price: string
    currency: string
    price_id: string
    product_id: string
    name: string
    avail: boolean
    nickname?: string
    services: [
        {
            feature_id: string
            feature_desc: string
        },
    ]
}

export interface Plan {
    name: string
    product_id: string
    description?: string
    prices: StripePrice[]
    features: string[]
    price: number
    price_id: string
    freq: string
    avail: boolean
    services: any
    currency: string
}

export interface PlanFeature {
    feature_id: string
    feature_desc: string
}

export interface Subscription {
    subscription_id: string
    period_start?: string
    period_end?: string
    status: string
    cancel_at?: string
    cancel_at_period_end: boolean
    trial_start?: string
    trial_end?: string
}
