import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Check, Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BusinessProfile } from "@/hooks/useProfileData";
import { cn } from "@/lib/utils";

interface BusinessProfileSectionProps {
  profile: BusinessProfile | null;
  onSave: (profile: BusinessProfile) => Promise<boolean>;
}

export function BusinessProfileSection({ profile, onSave }: BusinessProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState<BusinessProfile>({
    businessName: profile?.businessName || "",
    legalBusinessName: profile?.legalBusinessName || "",
    contactPersonName: profile?.contactPersonName || "",
    contactPhoneNumber: profile?.contactPhoneNumber || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessProfile, string>>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Allow only numbers and limit length
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    handleChange("contactPhoneNumber", cleaned);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessProfile, string>> = {};

    if (formData.contactPhoneNumber && formData.contactPhoneNumber.length !== 10) {
      newErrors.contactPhoneNumber = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);

    if (success) {
      setIsEditing(false);
      toast.success("Business profile saved successfully");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
      setIsEditing(false);
    }
  };

  // Empty state
  if (!profile && !isEditing) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Buyer / Business Profile
          </CardTitle>
          <CardDescription>
            Add your business details for procurement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              No business profile created yet
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Business Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // View mode
  if (!isEditing && profile) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Buyer / Business Profile
            </CardTitle>
            <CardDescription>
              Your business details for procurement
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Business Name</p>
              <p className="text-sm font-medium">{profile.businessName || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Legal Business Name</p>
              <p className="text-sm font-medium">{profile.legalBusinessName || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Contact Person</p>
              <p className="text-sm font-medium">{profile.contactPersonName || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Contact Phone</p>
              <p className="text-sm font-medium">
                {profile.contactPhoneNumber ? `+91 ${profile.contactPhoneNumber}` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Buyer / Business Profile
        </CardTitle>
        <CardDescription>
          {profile ? "Update your business details" : "Add your business details for procurement"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleChange("businessName", e.target.value)}
            placeholder="Your trading business name"
          />
          <p className="text-xs text-muted-foreground">
            The name you operate under
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalBusinessName">Legal Business Name</Label>
          <Input
            id="legalBusinessName"
            value={formData.legalBusinessName}
            onChange={(e) => handleChange("legalBusinessName", e.target.value)}
            placeholder="Registered company name"
          />
          <p className="text-xs text-muted-foreground">
            As per your legal registration documents
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPersonName">Contact Person Name</Label>
          <Input
            id="contactPersonName"
            value={formData.contactPersonName}
            onChange={(e) => handleChange("contactPersonName", e.target.value)}
            placeholder="Name of primary contact"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhoneNumber">Contact Phone Number</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border/50 bg-muted text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="contactPhoneNumber"
              value={formData.contactPhoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="9876543210"
              className={cn(
                "rounded-l-none",
                errors.contactPhoneNumber && "border-destructive"
              )}
            />
          </div>
          {errors.contactPhoneNumber && (
            <p className="text-xs text-destructive">{errors.contactPhoneNumber}</p>
          )}
        </div>

        <div className="flex gap-3">
          {profile && (
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : profile ? "Update" : "Create"} {!saving && "Business Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
