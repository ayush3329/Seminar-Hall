import {z} from 'zod'

export const zRecentChatsUser = z.object({
    fullname: z.string().max(20).min(5)
})