import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type PaymentMethod,
  type Rating,
  Role,
  type ServiceRequest,
  Status,
  type UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

export function useCustomerRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<ServiceRequest[]>({
    queryKey: ["customerRequests"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getRequestsByCustomer(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10000,
  });
}

export function usePendingRequests() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<ServiceRequest[]>({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServiceRequestsByStatus(Status.pending);
    },
    enabled: !!actor && !!identity,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 0,
  });
}

export function useProviderRequests() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<ServiceRequest[]>({
    queryKey: ["providerRequests"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getRequestsByProvider(identity.getPrincipal());
    },
    enabled: !!actor && !!identity,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}

export function useMyRatings() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Rating[]>({
    queryKey: ["myRatings"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserRatings(identity.getPrincipal());
    },
    enabled: !!actor && !!identity,
  });
}

export function useSubmitRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: ServiceRequest) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitServiceRequest(request);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customerRequests"] });
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}

export function useUpdatePrice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      newPrice,
    }: { requestId: bigint; newPrice: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateRequestPrice(requestId, newPrice);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customerRequests"] }),
  });
}

export function useAcceptRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptServiceRequest(requestId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
      qc.invalidateQueries({ queryKey: ["providerRequests"] });
    },
  });
}

export function useMarkComplete() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markRequestComplete(requestId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providerRequests"] });
      qc.invalidateQueries({ queryKey: ["customerRequests"] });
    },
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      method,
    }: { requestId: bigint; method: PaymentMethod }) => {
      if (!actor) throw new Error("Not connected");
      const paymentId = await actor.createPayment(requestId, method);
      await actor.markPaymentPaid(paymentId);
      return paymentId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customerRequests"] }),
  });
}

export function useAddRating() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      ratingValue,
      comment,
    }: {
      requestId: bigint;
      ratingValue: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addRating(requestId, ratingValue, comment);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customerRequests"] }),
  });
}

export function useCancelRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelServiceRequest(requestId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customerRequests"] });
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}
