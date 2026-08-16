import z from "zod";

export const playerErrorSchema = z.object({
    code: z.number().int(),
});

export type PlayerErrorDto = z.infer<typeof playerErrorSchema>;
