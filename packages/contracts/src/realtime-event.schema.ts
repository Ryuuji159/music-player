import z from "zod";
import { queueSchema } from "./queue-item.schema";
import { playerCommandSchema } from "./player-command.schema";

export const realtimeEventSchema = z.discriminatedUnion("type", [
    z.object({type: z.literal("queue.updated"), data: queueSchema}),
    z.object({type: z.literal("player.command"), data: playerCommandSchema})
]);
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;