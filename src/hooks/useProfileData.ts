import { useState, useEffect, useCallback } from "react";
import { 
  getAuthToken,
  fetchFullProfile,
  updatePersonalProfile,
  createBuyerProfile,
  createAddress,
  PersonalProfileAPI,
  PersonalProfileResponse,
  BusinessProfileAPI,
  BusinessProfileResponse,
  AddressAPI,
  AddressResponse,
} from "@/lib/api";
import { toast } from "sonner";

export interface PersonalProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "";
  status?: number;
  buyerId?: number | null;
}

export interface BusinessProfile {
  id?: number;
  businessName: string;
  legalBusinessName: string;
  contactPersonName: string;
  contactPhoneNumber: string;
  kycStatus?: number;
}

export interface Address {
  id: string;
  type: "Business" | "Warehouse" | "Other";
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

// Convert API format to frontend format
function apiToPersonal(data: PersonalProfileResponse | null): PersonalProfile {
  if (!data) {
    return {
      firstName: "",
      lastName: "",
      displayName: "",
      dateOfBirth: "",
      gender: "",
      status: 0,
      buyerId: null,
    };
  }
  
  // Convert gender from number to string
  let genderStr: "male" | "female" | "" = "";
  if (data.gender === 0) genderStr = "male";
  else if (data.gender === 1) genderStr = "female";
  
  return {
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    displayName: data.display_name || "",
    dateOfBirth: data.date_of_birth || "",
    gender: genderStr,
    status: data.status,
    buyerId: data.buyer_id,
  };
}

function personalToApi(data: PersonalProfile): PersonalProfileAPI {
  // Convert gender from string to number
  let genderNum: number | null = null;
  if (data.gender === "male") genderNum = 0;
  else if (data.gender === "female") genderNum = 1;
  
  // Format date_of_birth - send null if empty, otherwise ensure YYYY-MM-DD format
  let dateOfBirth: string | null = null;
  if (data.dateOfBirth && data.dateOfBirth.trim() !== "") {
    // Parse and reformat to ensure correct ISO date format
    const dateObj = new Date(data.dateOfBirth);
    if (!isNaN(dateObj.getTime())) {
      // Format as YYYY-MM-DD
      dateOfBirth = dateObj.toISOString().split('T')[0];
    }
  }
  
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    date_of_birth: dateOfBirth,
    gender: genderNum,
  };
}

function apiToBusiness(data: BusinessProfileResponse | null): BusinessProfile | null {
  if (!data) return null;
  return {
    id: data.buyer_id,
    businessName: data.buyer_name || "",
    legalBusinessName: data.buyer_legal_name || "",
    contactPersonName: data.contact_name || "",
    contactPhoneNumber: data.contact_number || "",
    kycStatus: data.kyc_status,
  };
}

function businessToApi(data: BusinessProfile): BusinessProfileAPI {
  return {
    buyer_name: data.businessName,
    buyer_legal_name: data.legalBusinessName,
    contact_name: data.contactPersonName,
    contact_number: data.contactPhoneNumber,
  };
}

function apiToAddress(data: AddressResponse): Address {
  return {
    id: String(data.address_id),
    type: data.address_type as "Business" | "Warehouse" | "Other",
    addressLine1: data.address_line1 || "",
    addressLine2: data.address_line2 || "",
    city: data.city || "",
    state: data.state || "",
    pincode: data.pincode || "",
    country: data.country || "India",
    isDefault: data.is_default || false,
  };
}

function addressToApi(data: Omit<Address, "id">): Omit<AddressAPI, "address_id"> {
  return {
    address_type: data.type,
    address_line1: data.addressLine1,
    address_line2: data.addressLine2 || null,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    country: data.country,
    is_default: data.isDefault,
  };
}

export function useProfileData() {
  const [personalProfile, setPersonalProfile] = useState<PersonalProfile>({
    firstName: "",
    lastName: "",
    displayName: "",
    dateOfBirth: "",
    gender: "",
    status: 0,
    buyerId: null,
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load data from API on mount
  const loadProfileData = useCallback(async () => {
    const token = getAuthToken();
    console.log("AUTH TOKEN:", getAuthToken());
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchFullProfile();
      
      setPersonalProfile(apiToPersonal(data.personal));
      setBusinessProfile(apiToBusiness(data.business));
      setAddresses(data.addresses?.map(apiToAddress) || []);
    } catch (error) {
      console.error("Error loading profile data:", error);
      // Don't show error for expected 404s
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const savePersonalProfile = async (profile: PersonalProfile): Promise<boolean> => {
    setSaving(true);
    try {
      const result = await updatePersonalProfile(personalToApi(profile));
      setPersonalProfile(apiToPersonal(result));
      return true;
    } catch (error) {
      console.error("Error saving personal profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveBusinessProfile = async (profile: BusinessProfile): Promise<boolean> => {
    setSaving(true);
    try {
      // Always create since we don't have an update endpoint
      const result = await createBuyerProfile(businessToApi(profile));
      setBusinessProfile(apiToBusiness(result));
      return true;
    } catch (error) {
      console.error("Error saving business profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save business profile");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (address: Omit<Address, "id">): Promise<Address | null> => {
    setSaving(true);
    try {
      const result = await createAddress(addressToApi(address));
      const newAddress = apiToAddress(result);
      
      // If this is set as default, update other addresses
      if (newAddress.isDefault) {
        setAddresses(prev => [
          ...prev.map(a => ({ ...a, isDefault: false })),
          newAddress,
        ]);
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }
      
      return newAddress;
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add address");
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Note: Update and delete address endpoints are not yet available in the backend
  // These are placeholder functions that will work once the backend adds support
  const updateAddress = async (id: string, updates: Partial<Address>): Promise<boolean> => {
    toast.error("Address update is not yet supported by the backend");
    return false;
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    toast.error("Address deletion is not yet supported by the backend");
    return false;
  };

  return {
    personalProfile,
    businessProfile,
    addresses,
    loading,
    saving,
    savePersonalProfile,
    saveBusinessProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    refetch: loadProfileData,
  };
}