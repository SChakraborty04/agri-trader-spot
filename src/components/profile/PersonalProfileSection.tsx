import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { User, Camera, CalendarIcon, Check, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { PersonalProfile } from "@/hooks/useProfileData";
import { cn } from "@/lib/utils";

interface PersonalProfileSectionProps {
  profile: PersonalProfile;
  onSave: (profile: PersonalProfile) => Promise<boolean>;
  onUploadPicture?: (file: File) => Promise<string | null>;
}

export function PersonalProfileSection({ profile, onSave, onUploadPicture }: PersonalProfileSectionProps) {
  const [formData, setFormData] = useState<PersonalProfile>(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalProfile, string>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Auto-generate display name
  useEffect(() => {
    if (formData.firstName || formData.lastName) {
      const autoName = `${formData.firstName} ${formData.lastName}`.trim();
      if (!formData.displayName || formData.displayName === `${profile.firstName} ${profile.lastName}`.trim()) {
        setFormData(prev => ({ ...prev, displayName: autoName }));
      }
    }
  }, [formData.firstName, formData.lastName, profile.firstName, profile.lastName]);

  const handleChange = (field: keyof PersonalProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // If we have an upload function, use it to upload to server
    if (onUploadPicture) {
      setUploadingPicture(true);
      const imageUrl = await onUploadPicture(file);
      setUploadingPicture(false);
      
      if (imageUrl) {
        setFormData(prev => ({ ...prev, profilePicture: imageUrl }));
        toast.success("Profile picture uploaded successfully");
      }
    } else {
      // Fallback to local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, profilePicture: result }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalProfile, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
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
      setIsDirty(false);
      toast.success("Personal profile saved successfully");
    }
  };

  const getInitials = () => {
    return `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const selectedDate = formData.dateOfBirth 
    ? parse(formData.dateOfBirth, "yyyy-MM-dd", new Date())
    : undefined;

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Personal Profile
        </CardTitle>
        <CardDescription>
          Your basic personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              {formData.profilePicture ? (
                <AvatarImage src={formData.profilePicture} alt="Profile" />
              ) : (
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPicture}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploadingPicture ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Upload your profile picture</p>
            <p className="text-xs">JPG, PNG up to 5MB</p>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Enter your first name"
              className={cn(errors.firstName && "border-destructive")}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Enter your last name"
              className={cn(errors.lastName && "border-destructive")}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            placeholder="How you want to be addressed"
          />
          <p className="text-xs text-muted-foreground">
            Auto-generated from your name, but you can customize it
          </p>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11 rounded-xl border-border/50 bg-secondary",
                  !formData.dateOfBirth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateOfBirth
                  ? format(parse(formData.dateOfBirth, "yyyy-MM-dd", new Date()), "PPP")
                  : "Select your date of birth"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    handleChange("dateOfBirth", format(date, "yyyy-MM-dd"));
                  }
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={1920}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleChange("gender", value as "male" | "female")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="w-full"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Personal Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}