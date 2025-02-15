import * as z from 'zod'

export const messageFormSchema = z.object({
    content: z.string(),
})

export const chatMessagePayloadSchema = z.object({
    role: z.string(),
    content: z.string(),
    chatSessionId: z.string().optional(),
    workspaceId: z.string().optional(),
})

export const chatSessionCreateFormSchema = z.object({
    name: z.string().min(6),
    message: z.string().optional(),
    ai_model: z.string().optional(),
    ai_provider: z.string().optional(),
})

export const chatSessionUpdateFormSchema = z.object({
    name: z.string().optional(),
    ai_model: z.string().optional(),
    ai_provider: z.string().optional(),
    max_tokens: z.coerce.number().optional(),
    stream: z.boolean().optional(),
    stream_options: z.record(z.any()).optional(),
    temperature: z.coerce.number().optional(),
    top_p: z.coerce.number().optional(),
    stop_sequences: z.array(z.string()).optional(),
    top_k: z.coerce.number().optional(),
    frequency_penalty: z.number().optional(),
    logit_bias: z.record(z.number()).optional(),
    logprobs: z.boolean().optional(),
    top_logprobs: z.number().optional(),
    n: z.number().optional(),
    presence_penalty: z.number().optional(),
    response_format: z.string().optional(),
    seed: z.number().optional(),
    user_identifier: z.string().optional(),
    service_tier: z.string().optional(),
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional(),
    total_tokens: z.number().optional(),
    duration: z.string().optional(),
})

export const chatSessionListSchema = z.array(
    z.object({
        id: z.string(),
        user: z.object({
            id: z.string(),
            username: z.string(),
            email: z.string(),
        }),
        started_at: z.string(),
        name: z.string().optional(),
        ai_provider: z.string(),
        ai_model: z.string(),
        status: z.string(),
        max_tokens: z.number().optional(),
        stream: z.boolean(),
        stream_options: z.record(z.any()).optional(),
        temperature: z.number().optional(),
        top_p: z.number().optional(),
        stop_sequences: z.array(z.string()).optional(),
        top_k: z.number().optional(),
        frequency_penalty: z.number().optional(),
        logit_bias: z.record(z.number()).optional(),
        logprobs: z.boolean().optional(),
        top_logprobs: z.number().optional(),
        n: z.number().optional(),
        presence_penalty: z.number().optional(),
        response_format: z.string().optional(),
        seed: z.number().optional(),
        user_identifier: z.string().optional(),
        service_tier: z.string().optional(),
        prompt_tokens: z.number().optional(),
        completion_tokens: z.number().optional(),
        total_tokens: z.number().optional(),
        duration: z.string().optional(),
        total_messages: z.number(),
        messages: z.array(
            z.object({
                id: z.string(),
                user: z.object({
                    id: z.string(),
                    username: z.string(),
                    email: z.string(),
                }),
                session: z.string(),
                role: z.string(),
                content: z.string(),
                prompt_tokens: z.number(),
                completion_tokens: z.number(),
                total_tokens: z.number(),
            })
        ),
    })
)
