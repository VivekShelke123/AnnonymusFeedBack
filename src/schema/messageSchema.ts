import {z} from 'zod';

export const messageSchema = z.object({
    content : z
    .string()
    .min(10 , {message : "Message is too Short "})
    .max(300 , {message : 'Message is to long'}),
});