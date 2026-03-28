import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ServiceRequest {
    id: bigint;
    status: Status;
    serviceType: ServiceType;
    provider?: Principal;
    urgency: Urgency;
    customer: Principal;
    createdAt: bigint;
    description: string;
    updatedAt: bigint;
    price: bigint;
}
export interface Rating {
    provider: Principal;
    customer: Principal;
    createdAt: bigint;
    comment: string;
    rating: bigint;
}
export interface UserProfile {
    name: string;
    createdAt: bigint;
    role: Role;
    phone: string;
}
export enum PaymentMethod {
    mobile_banking = "mobile_banking",
    esewa = "esewa",
    khalti = "khalti"
}
export enum Role {
    provider = "provider",
    customer = "customer"
}
export enum ServiceType {
    cleaning = "cleaning",
    plumbing = "plumbing",
    painting = "painting",
    electrical = "electrical",
    moving = "moving"
}
export enum Status {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum Urgency {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptServiceRequest(requestId: bigint): Promise<void>;
    addRating(requestId: bigint, ratingValue: bigint, comment: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelServiceRequest(requestId: bigint): Promise<void>;
    createPayment(requestId: bigint, method: PaymentMethod): Promise<bigint>;
    getAllProviders(): Promise<Array<UserProfile>>;
    getAllProvidersByPhone(): Promise<Array<UserProfile>>;
    getAllRatings(): Promise<Array<Rating>>;
    getAllServiceRequests(): Promise<Array<ServiceRequest>>;
    getAllServiceRequestsByPrice(): Promise<Array<ServiceRequest>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProviderServiceRequests(user: Principal): Promise<Array<ServiceRequest>>;
    getRequestsByCustomer(customer: Principal): Promise<Array<ServiceRequest>>;
    getRequestsByProvider(provider: Principal): Promise<Array<ServiceRequest>>;
    getServiceRequestsByStatus(status: Status): Promise<Array<ServiceRequest>>;
    getServiceRequestsByUrgency(urgency: Urgency): Promise<Array<ServiceRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfilesByRole(): Promise<Array<UserProfile>>;
    getUserRatings(user: Principal): Promise<Array<Rating>>;
    getUserServiceRequests(user: Principal): Promise<Array<ServiceRequest>>;
    isCallerAdmin(): Promise<boolean>;
    markPaymentPaid(paymentId: bigint): Promise<void>;
    markRequestComplete(requestId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitServiceRequest(request: ServiceRequest): Promise<bigint>;
    updateRequestPrice(requestId: bigint, newPrice: bigint): Promise<void>;
}
