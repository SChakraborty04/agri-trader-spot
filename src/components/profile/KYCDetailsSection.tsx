import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileCheck2, Upload, Check, X, FileText, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { KYCDetails } from "@/hooks/useProfileData";
import { cn } from "@/lib/utils";

interface KYCDetailsSectionProps {
  kycDetails: KYCDetails;
  onSave: (kyc: KYCDetails) => Promise<boolean>;
}

export function KYCDetailsSection({ kycDetails, onSave }: KYCDetailsSectionProps) {
  const [formData, setFormData] = useState<KYCDetails>(kycDetails);
  const [errors, setErrors] = useState<Partial<Record<keyof KYCDetails, string>>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  const panFileRef = useRef<HTMLInputElement>(null);
  const gstinFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(kycDetails);
  }, [kycDetails]);

  const handleChange = (field: keyof KYCDetails, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePanChange = (value: string) => {
    // PAN format: AAAAA9999A (5 letters, 4 digits, 1 letter)
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    handleChange("panNumber", cleaned);
  };

  const handleGstinChange = (value: string) => {
    // GSTIN format: 15 characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    handleChange("gstinNumber", cleaned);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "panFile" | "gstinFile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allow images and PDFs
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please select an image or PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleChange(field, result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (field: "panFile" | "gstinFile") => {
    handleChange(field, null);
    if (field === "panFile" && panFileRef.current) {
      panFileRef.current.value = "";
    }
    if (field === "gstinFile" && gstinFileRef.current) {
      gstinFileRef.current.value = "";
    }
  };

  const validatePan = (pan: string): boolean => {
    // PAN format: AAAAA9999A
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateGstin = (gstin: string): boolean => {
    // GSTIN format: 2 digits state code + 10 char PAN + 1 digit + Z + 1 check digit
    if (!gstin) return true; // Optional field
    return gstin.length === 15;
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof KYCDetails, string>> = {};

    if (!formData.panNumber) {
      newErrors.panNumber = "PAN number is mandatory";
    } else if (!validatePan(formData.panNumber)) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (formData.gstinNumber && !validateGstin(formData.gstinNumber)) {
      newErrors.gstinNumber = "GSTIN must be 15 characters";
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
      toast.success("KYC details saved successfully");
    }
  };

  const getFileName = (dataUrl: string | null): string => {
    if (!dataUrl) return "";
    if (dataUrl.startsWith("data:image/")) return "Image uploaded";
    if (dataUrl.startsWith("data:application/pdf")) return "PDF uploaded";
    return "File uploaded";
  };

  return (
    <Card className="rounded-2xl border-border/50 border-dashed bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <FileCheck2 className="w-5 h-5" />
          KYC Details
        </CardTitle>
        <CardDescription>
          Tax registration information for transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Info Banner */}
        <div className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Verification will be handled later. Just provide your details for now.
          </p>
        </div>

        {/* PAN Number */}
        <div className="space-y-2">
          <Label htmlFor="panNumber">
            PAN Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="panNumber"
            value={formData.panNumber}
            onChange={(e) => handlePanChange(e.target.value)}
            placeholder="ABCDE1234F"
            className={cn(errors.panNumber && "border-destructive")}
          />
          {errors.panNumber ? (
            <p className="text-xs text-destructive">{errors.panNumber}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Permanent Account Number (10 characters)
            </p>
          )}
        </div>

        {/* PAN Upload */}
        <div className="space-y-2">
          <Label>PAN Document (Optional)</Label>
          {formData.panFile ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/30">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm flex-1">{getFileName(formData.panFile)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile("panFile")}
                className="h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => panFileRef.current?.click()}
              className="w-full border-dashed"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PAN Document
            </Button>
          )}
          <input
            ref={panFileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e, "panFile")}
            className="hidden"
          />
        </div>

        {/* GSTIN Number */}
        <div className="space-y-2">
          <Label htmlFor="gstinNumber">GSTIN Number</Label>
          <Input
            id="gstinNumber"
            value={formData.gstinNumber}
            onChange={(e) => handleGstinChange(e.target.value)}
            placeholder="22AAAAA0000A1Z5"
            className={cn(errors.gstinNumber && "border-destructive")}
          />
          {errors.gstinNumber ? (
            <p className="text-xs text-destructive">{errors.gstinNumber}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Goods and Services Tax Identification Number (optional)
            </p>
          )}
        </div>

        {/* GSTIN Upload */}
        <div className="space-y-2">
          <Label>GSTIN Document (Optional)</Label>
          {formData.gstinFile ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/30">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm flex-1">{getFileName(formData.gstinFile)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile("gstinFile")}
                className="h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => gstinFileRef.current?.click()}
              className="w-full border-dashed"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload GSTIN Document
            </Button>
          )}
          <input
            ref={gstinFileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e, "gstinFile")}
            className="hidden"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="w-full"
          variant="secondary"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save KYC Details"}
        </Button>
      </CardContent>
    </Card>
  );
}
