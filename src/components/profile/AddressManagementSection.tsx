import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Trash2, Check, Star, X, Building2, Warehouse, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Address } from "@/hooks/useProfileData";
import { cn } from "@/lib/utils";

interface AddressManagementSectionProps {
  addresses: Address[];
  onAdd: (address: Omit<Address, "id">) => Promise<Address | null>;
  onUpdate: (id: string, updates: Partial<Address>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const ADDRESS_TYPE_ICONS = {
  Business: Building2,
  Warehouse: Warehouse,
  Other: MoreHorizontal,
};

const ADDRESS_TYPE_LABELS = {
  Business: "Business",
  Warehouse: "Warehouse",
  Other: "Other",
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function AddressManagementSection({ 
  addresses, 
  onAdd, 
  onUpdate, 
  onDelete 
}: AddressManagementSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Address, "id">>({
    type: "Business",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: addresses.length === 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const handleChange = (field: keyof Omit<Address, "id">, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePincodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    handleChange("pincode", cleaned);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Address, string>> = {};

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address Line 1 is required";
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!validate()) return;

    setSaving(true);
    const result = await onAdd(formData);
    setSaving(false);

    if (result) {
      setFormData({
        type: "Business",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isDefault: false,
      });
      setIsAdding(false);
      toast.success("Address added successfully");
    }
  };

  const handleSetDefault = async (id: string) => {
    setSaving(true);
    const success = await onUpdate(id, { isDefault: true });
    setSaving(false);
    if (success) {
      toast.success("Default address updated");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setSaving(true);
    const success = await onDelete(id);
    setSaving(false);
    if (success) {
      toast.success("Address deleted");
    }
  };

  const defaultAddress = addresses.find(a => a.isDefault);
  const otherAddresses = addresses.filter(a => !a.isDefault);

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Address Management
        </CardTitle>
        <CardDescription>
          Manage your delivery and business addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="space-y-3">
            {/* Default Address First */}
            {defaultAddress && (
              <AddressCard
                address={defaultAddress}
                onSetDefault={handleSetDefault}
                onDelete={handleDeleteAddress}
              />
            )}
            
            {/* Other Addresses */}
            {otherAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onSetDefault={handleSetDefault}
                onDelete={handleDeleteAddress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No addresses added yet
            </p>
          </div>
        )}

        {/* Add Address Form */}
        {isAdding ? (
          <div className="border border-border/50 rounded-xl p-4 space-y-4 bg-secondary/30">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Add New Address</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAdding(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Address Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value as Address["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                placeholder="Street address, building name"
                className={cn(errors.addressLine1 && "border-destructive")}
              />
              {errors.addressLine1 && (
                <p className="text-xs text-destructive">{errors.addressLine1}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                placeholder="Apartment, suite, floor (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="6-digit pincode"
                  className={cn(errors.pincode && "border-destructive")}
                />
                {errors.pincode && (
                  <p className="text-xs text-destructive">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleChange("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleChange("isDefault", checked)}
                />
                <Label className="text-sm cursor-pointer">
                  Set as default address
                </Label>
              </div>
            </div>

            <Button onClick={handleAdd} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {saving ? "Adding..." : "Add Address"}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface AddressCardProps {
  address: Address;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

function AddressCard({ address, onSetDefault, onDelete }: AddressCardProps) {
  const Icon = ADDRESS_TYPE_ICONS[address.type] || MoreHorizontal;
  
  return (
    <div
      className={cn(
        "border rounded-xl p-4 relative",
        address.isDefault
          ? "border-primary/50 bg-primary/5"
          : "border-border/50"
      )}
    >
      {address.isDefault && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-primary">
          <Star className="w-3 h-3 fill-primary" />
          Default
        </div>
      )}
      
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">
            {ADDRESS_TYPE_LABELS[address.type] || address.type}
          </p>
          <p className="text-sm font-medium">
            {address.addressLine1}
          </p>
          {address.addressLine2 && (
            <p className="text-sm text-muted-foreground">{address.addressLine2}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {[address.city, address.state, address.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
        {!address.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetDefault(address.id)}
            className="text-xs h-8"
          >
            <Star className="w-3 h-3 mr-1" />
            Set as Default
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(address.id)}
          className="text-xs h-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}