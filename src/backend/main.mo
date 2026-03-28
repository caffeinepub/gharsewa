import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // Types
  public type Role = {
    #customer;
    #provider;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ServiceType = {
    #cleaning;
    #plumbing;
    #electrical;
    #painting;
    #moving;
  };

  public type Urgency = {
    #low;
    #medium;
    #high;
  };

  public type Status = {
    #pending;
    #accepted;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type PaymentMethod = {
    #esewa;
    #khalti;
    #mobile_banking;
  };

  public type PaymentStatus = {
    #pending;
    #paid;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    role : Role;
    createdAt : Int;
  };

  public type ServiceRequest = {
    id : Nat;
    customer : Principal;
    provider : ?Principal;
    serviceType : ServiceType;
    urgency : Urgency;
    status : Status;
    description : Text;
    location : Text;
    price : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Rating = {
    customer : Principal;
    provider : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  public type Payment = {
    id : Nat;
    requestId : Nat;
    customer : Principal;
    provider : Principal;
    amount : Nat;
    method : PaymentMethod;
    status : PaymentStatus;
    createdAt : Int;
    updatedAt : Int;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      switch (Text.compare(p1.name, p2.name)) {
        case (#equal) { Text.compare(p1.phone, p2.phone) };
        case (order) { order };
      };
    };

    public func compareByRole(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  module ServiceRequest {
    public func compare(sr1 : ServiceRequest, sr2 : ServiceRequest) : Order.Order {
      Nat.compare(sr1.id, sr2.id);
    };

    public func compareByPrice(sr1 : ServiceRequest, sr2 : ServiceRequest) : Order.Order {
      if (sr1.price < sr2.price) { #less } else if (sr1.price > sr2.price) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  // Storage
  var userProfiles = Map.empty<Principal, UserProfile>();
  var requests = Map.empty<Nat, ServiceRequest>();
  var ratings = Map.empty<Nat, Rating>();
  var payments = Map.empty<Nat, Payment>();

  var nextRequestId = 0;
  var nextRatingId = 0;
  var nextPaymentId = 0;

  // Stable storage for preupgrade/postupgrade
  stable var userProfileEntries : [(Principal, UserProfile)] = [];
  stable var requestEntries : [(Nat, ServiceRequest)] = [];
  stable var ratingEntries : [(Nat, Rating)] = [];
  stable var paymentEntries : [(Nat, Payment)] = [];
  stable var nextRequestIdStable = 0;
  stable var nextRatingIdStable = 0;
  stable var nextPaymentIdStable = 0;

  system func preupgrade() {
    userProfileEntries := userProfiles.toArray();
    requestEntries := requests.toArray();
    ratingEntries := ratings.toArray();
    paymentEntries := payments.toArray();
    nextRequestIdStable := nextRequestId;
    nextRatingIdStable := nextRatingId;
    nextPaymentIdStable := nextPaymentId;
  };

  system func postupgrade() {
    userProfiles := Map.fromIter(userProfileEntries.values());
    requests := Map.fromIter(requestEntries.values());
    ratings := Map.fromIter(ratingEntries.values());
    payments := Map.fromIter(paymentEntries.values());
    nextRequestId := nextRequestIdStable;
    nextRatingId := nextRatingIdStable;
    nextPaymentId := nextPaymentIdStable;
    userProfileEntries := [];
    requestEntries := [];
    ratingEntries := [];
    paymentEntries := [];
  };

  // User Management
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all profiles");
    };
    userProfiles.values().toArray().sort();
  };

  public query ({ caller }) func getUserProfilesByRole() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles by role");
    };
    userProfiles.values().toArray().sort(UserProfile.compareByRole);
  };

  public query ({ caller }) func getAllProviders() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view providers");
    };
    userProfiles.filter(func(_, p) { p.role == #provider }).values().toArray();
  };

  public query ({ caller }) func getAllProvidersByPhone() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view providers");
    };
    userProfiles.filter(func(_, p) { p.role == #provider }).values().toArray();
  };

  // Service Request Management
  public shared ({ caller }) func submitServiceRequest(request : ServiceRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit requests");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };
    if (profile.role != #customer) {
      Runtime.trap("Unauthorized: Only customers can submit requests");
    };
    let newRequest : ServiceRequest = {
      request with
      id = nextRequestId;
      customer = caller;
      provider = null;
      status = #pending;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    requests.add(nextRequestId, newRequest);
    nextRequestId += 1;
    newRequest.id;
  };

  public shared ({ caller }) func cancelServiceRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel requests");
    };
    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };
    if (request.customer != caller) {
      Runtime.trap("Unauthorized: Only the customer can cancel this request");
    };
    if (request.status != #pending and request.status != #accepted) {
      Runtime.trap("Request cannot be cancelled in its current state");
    };
    let updatedRequest = {
      request with
      status = #cancelled;
      updatedAt = Time.now();
    };
    requests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func acceptServiceRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept requests");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only providers can accept requests") };
      case (?p) { p };
    };
    if (profile.role != #provider) {
      Runtime.trap("Unauthorized: Only providers can accept requests");
    };
    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };
    if (request.status != #pending) { Runtime.trap("Request not pending") };
    let updatedRequest = {
      request with
      provider = ?caller;
      status = #accepted;
      updatedAt = Time.now();
    };
    requests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func startServiceRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start requests");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only providers can start requests") };
      case (?p) { p };
    };
    if (profile.role != #provider) {
      Runtime.trap("Unauthorized: Only providers can start requests");
    };
    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };
    switch (request.provider) {
      case (null) { Runtime.trap("Provider not assigned") };
      case (?p) {
        if (p != caller) {
          Runtime.trap("Unauthorized: Only the assigned provider can start this request");
        };
      };
    };
    if (request.status != #accepted) { Runtime.trap("Request not accepted") };
    let updatedRequest = {
      request with
      status = #inProgress;
      updatedAt = Time.now();
    };
    requests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func updateRequestPrice(requestId : Nat, newPrice : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update price");
    };
    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };
    if (request.customer != caller) {
      Runtime.trap("Unauthorized: Only the customer can update the price");
    };
    if (request.status != #pending) { Runtime.trap("Request not pending") };
    let updatedRequest = {
      request with
      price = newPrice;
      updatedAt = Time.now();
    };
    requests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func markRequestComplete(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark complete");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only providers can mark complete") };
      case (?p) { p };
    };
    if (profile.role != #provider) {
      Runtime.trap("Unauthorized: Only providers can mark complete");
    };
    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };
    switch (request.provider) {
      case (null) { Runtime.trap("Provider not assigned") };
      case (?p) {
        if (p != caller) {
          Runtime.trap("Unauthorized: Only the assigned provider can mark complete");
        };
      };
    };
    if (request.status != #inProgress) { Runtime.trap("Request not in progress") };
    let updatedRequest = {
      request with
      status = #completed;
      updatedAt = Time.now();
    };
    requests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func addRating(requestId : Nat, ratingValue : Nat, comment : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add ratings");
    };
    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };
    if (request.status != #completed) { Runtime.trap("Request not completed") };
    if (request.customer != caller) {
      Runtime.trap("Unauthorized: Only the customer can rate");
    };
    if (ratingValue < 1 or ratingValue > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    let rating : Rating = {
      customer = caller;
      provider = switch (request.provider) {
        case (null) { Runtime.trap("Provider not assigned") };
        case (?p) { p };
      };
      rating = ratingValue;
      comment;
      createdAt = Time.now();
    };
    ratings.add(nextRatingId, rating);
    nextRatingId += 1;
    nextRatingId - 1;
  };

  public shared ({ caller }) func createPayment(requestId : Nat, method : PaymentMethod) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payments");
    };
    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };
    if (request.customer != caller) {
      Runtime.trap("Unauthorized: Only the customer can create payment");
    };
    if (request.status != #completed) { Runtime.trap("Request not completed") };
    let payment : Payment = {
      id = nextPaymentId;
      requestId;
      customer = caller;
      provider = switch (request.provider) {
        case (null) { Runtime.trap("Provider not assigned") };
        case (?p) { p };
      };
      amount = request.price;
      method;
      status = #pending;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    payments.add(nextPaymentId, payment);
    nextPaymentId += 1;
    payment.id;
  };

  public shared ({ caller }) func markPaymentPaid(paymentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark payments as paid");
    };
    let payment = switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?p) { p };
    };
    if (payment.customer != caller) {
      Runtime.trap("Unauthorized: Only the customer can mark paid");
    };
    let updatedPayment = {
      payment with
      status = #paid;
      updatedAt = Time.now();
    };
    payments.add(paymentId, updatedPayment);
  };

  public query ({ caller }) func getUserServiceRequests(user : Principal) : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service requests");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    requests.filter(func(_, r) { r.customer == user }).values().toArray().sort();
  };

  public query ({ caller }) func getProviderServiceRequests(user : Principal) : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service requests");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    requests.filter(
      func(_, r) {
        switch (r.provider) {
          case (null) { false };
          case (?p) { p == user };
        };
      }
    ).values().toArray().sort(ServiceRequest.compareByPrice);
  };

  public query ({ caller }) func getUserRatings(user : Principal) : async [Rating] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view ratings");
    };
    ratings.values().toArray().filter(func(r) { r.provider == user });
  };

  public query ({ caller }) func getServiceRequestsByStatus(status : Status) : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service requests");
    };
    requests.filter(func(_, r) { r.status == status }).values().toArray();
  };

  public query ({ caller }) func getServiceRequestsByUrgency(urgency : Urgency) : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service requests");
    };
    requests.filter(func(_, r) { r.urgency == urgency }).values().toArray();
  };

  public query ({ caller }) func getRequestsByCustomer(customer : Principal) : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service requests");
    };
    if (caller != customer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    requests.filter(func(_, r) { r.customer == customer }).values().toArray();
  };

  public query ({ caller }) func getRequestsByProvider(provider : Principal) : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view service requests");
    };
    if (caller != provider and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    requests.filter(
      func(_, r) {
        switch (r.provider) {
          case (?p) { p == provider };
          case (null) { false };
        };
      }
    ).values().toArray();
  };

  public query ({ caller }) func getAllServiceRequests() : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all service requests");
    };
    requests.values().toArray().sort();
  };

  public query ({ caller }) func getAllServiceRequestsByPrice() : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all service requests");
    };
    requests.values().toArray().sort(ServiceRequest.compareByPrice);
  };

  public query ({ caller }) func getAllRatings() : async [Rating] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all ratings");
    };
    ratings.values().toArray();
  };
};
