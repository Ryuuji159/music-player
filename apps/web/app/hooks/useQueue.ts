import { useMutation, useQuery } from "@tanstack/react-query";
import { queueAPI } from "~/api/queue";

export const queueKeys = {
    all: ["queue"] as const,
};

export function useQueue() {
    return useQuery({
        queryKey: queueKeys.all,
        queryFn: queueAPI.current,
        staleTime: Infinity,
    });
}

export function useAppendToQueue() {
    return useMutation({ mutationFn: queueAPI.append });
}

export function useAppendVideoToQueue() {
    return useMutation({ mutationFn: queueAPI.appendVideo });
}

export function useMoveQueueItem() {
    return useMutation({
        mutationFn: (args: { id: string; siblingId: string; placement: "before" | "after" }) =>
            queueAPI.move(args.id, args.siblingId, args.placement),
    });
}

export function useRemoveQueueItem() {
    return useMutation({ mutationFn: queueAPI.remove });
}

export function useClearQueue() {
    return useMutation({ mutationFn: queueAPI.clear });
}
