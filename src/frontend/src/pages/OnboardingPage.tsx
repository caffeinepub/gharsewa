import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Home, Loader2, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Role, type UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

interface Props {
  onProfileSaved: (profile: UserProfile) => void;
}

export default function OnboardingPage({ onProfileSaved }: Props) {
  const { clear } = useInternetIdentity();
  const saveProfile = useSaveProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    role?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(phone))
      e.phone = "Enter a valid 10-digit phone number";
    if (!role) e.role = "Please select your role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const profile: UserProfile = {
      name: name.trim(),
      phone: phone.trim(),
      role: role!,
      createdAt: BigInt(Date.now()),
    };
    try {
      await saveProfile.mutateAsync(profile);
      toast.success("Profile created! Welcome to GharSewa 🎉");
      onProfileSaved(profile);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pattern-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl terracotta-gradient flex items-center justify-center mx-auto mb-4 shadow-card">
              <span className="text-3xl">🏠</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome to GharSewa
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set up your profile to continue
            </p>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Ramesh Shrestha"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`mt-1 ${errors.name ? "border-destructive" : ""}`}
                data-ocid="onboarding.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive mt-1"
                  data-ocid="onboarding.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 9841234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                className={`mt-1 ${errors.phone ? "border-destructive" : ""}`}
                data-ocid="onboarding.input"
              />
              {errors.phone && (
                <p
                  className="text-xs text-destructive mt-1"
                  data-ocid="onboarding.error_state"
                >
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Role selection */}
            <div>
              <Label className="font-medium">I want to...</Label>
              {errors.role && (
                <p
                  className="text-xs text-destructive mt-1"
                  data-ocid="onboarding.error_state"
                >
                  {errors.role}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole(Role.customer);
                    setErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === Role.customer
                      ? "border-terracotta bg-terracotta/5 text-terracotta"
                      : "border-border bg-white text-foreground hover:border-terracotta/40"
                  }`}
                  data-ocid="onboarding.customer_toggle"
                >
                  <Home className="w-8 h-8" />
                  <span className="font-semibold text-sm">Book Services</span>
                  <span className="text-xs text-muted-foreground">
                    I need help at home
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole(Role.provider);
                    setErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === Role.provider
                      ? "border-terracotta bg-terracotta/5 text-terracotta"
                      : "border-border bg-white text-foreground hover:border-terracotta/40"
                  }`}
                  data-ocid="onboarding.provider_toggle"
                >
                  <Briefcase className="w-8 h-8" />
                  <span className="font-semibold text-sm">Offer Services</span>
                  <span className="text-xs text-muted-foreground">
                    I provide services
                  </span>
                </button>
              </div>
            </div>

            <Button
              className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-semibold h-11"
              onClick={handleSubmit}
              disabled={saveProfile.isPending}
              data-ocid="onboarding.submit_button"
            >
              {saveProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create Profile
            </Button>

            <button
              type="button"
              onClick={clear}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-terracotta transition-colors py-1"
              data-ocid="onboarding.cancel_button"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
