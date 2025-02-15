import * as z from 'zod'
import { workspaceSchema } from './workspace'

export const userRegisterSchema = z
    .object({
        email: z.string().email(),
        name: z.string().min(2).max(100),
        password: z.string().min(8).max(100),
        re_password: z.string().min(8).max(100),
    })
    .refine((data) => data.password === data.re_password, {
        message: 'Passwords do not match',
        path: ['re_password'],
    })

export const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
})

export const userEmailSchema = z.object({
    email: z.string().email(),
})

export const usernameRetypeSchema = z
    .object({
        new_email: z.string().email(),
        re_new_email: z.string().min(8).max(100),
    })
    .refine((data) => data.new_email === data.re_new_email, {
        message: 'Emails do not match',
        path: ['re_new_email'],
    })

export const passwordRetpeSchema = z
    .object({
        new_password: z.string().min(8).max(100),
        re_new_password: z.string().min(8).max(100),
    })
    .refine((data) => data.new_password === data.re_new_password, {
        message: 'Passwords do not match',
        path: ['re_new_password'],
    })

export const userActivationSchema = z.object({
    uid: z.string().min(1, 'UID is required'),
    token: z.string().min(1, 'Token is required'),
})

export const userDetailsSchema = z.object({
    id: z.number().optional(), // Optional primary key
    username: z.string().optional(), // Optional username
    email: z.string().email().nullable().optional(), // Optional email, can be null
    name: z.string().nullable().optional(), // Optional name, can be null
    subscription_status: z.string().optional(), // Optional subscription status
    has_active_subscription: z.boolean().optional(), // Optional boolean flag
    workspaces: z.array(workspaceSchema).nullable().optional(), // Optional array of workspaces, can be null
    image: z.string().url().nullable().optional(), // Optional image URL, can be null
})
