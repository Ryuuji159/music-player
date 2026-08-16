import { z } from "zod";
import { queueSchema, type QueueItemDto } from "@skrd/contracts";
import { request } from "./http";

export const queueAPI = {
    current: (): Promise<QueueItemDto[]> => {
        return request("/queue", queueSchema);
    },
    append: (url: string) => {
        return request("/queue/append", z.unknown(), { method: "POST", body: JSON.stringify({ url }) });
    },
    appendVideo: (videoId: string) => {
        return request(`/queue/append/video/${videoId}`, z.unknown(), { method: "POST" });
    },
    move: (id: string, siblingId: string, placement: "before" | "after") => {
        return request(`/queue/item/${id}/move`, z.unknown(), { method: "POST", body: JSON.stringify({ siblingId, placement }) });
    },
    remove: (id: string) => {
        return request(`/queue/item/${id}`, z.unknown(), { method: "DELETE" });
    },
    clear: () => {
        return request("/queue/clear", z.unknown(), { method: "DELETE" });
    },
};