import * as z from 'zod'

export const workspaceSchema = z.object({
    name: z.string().min(3),
    slug: z.string().optional(),
    status: z.string().optional(),
})

export const teamSchema = z.object({
    name: z.string(),
    slug: z.string().optional(),
    workspace: z.string().optional(),
})

export const invitationSchema = z.object({
    email: z.string().email(),
    role: z.string(),
    team: z.string().optional(),
    workspace: z.string().optional(),
})

// export const invitationSchema = z
//     .object({
//         email: z.string().email(),
//         role: z.string(),
//         team: z.string().uuid().optional(),
//         workspace: z.string().uuid().optional(),
//     })
//     .refine(
//         (data) => {
//             const fieldsProvided = ['team', 'workspace'].filter(
//                 (field) => data[field as keyof typeof data] != null
//             ).length
//             return fieldsProvided === 1
//         },
//         {
//             message: "Either 'team' or 'workspace' must be provided, but not both",
//         }
//     )

export const invitationIdSchema = z.object({
    invitationId: z.string(),
})
