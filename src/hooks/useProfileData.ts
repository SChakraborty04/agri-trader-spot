import { useState, useEffect, useCallback } from "react";
import { 
  getAuthToken,
  fetchFullProfile,
  updatePersonalProfile,
  updateBusinessProfile,
  fetchAddresses,
  createAddress,
  updateAddressAPI,
  deleteAddressAPI,
  updateKYCDetails,
  PersonalProfileAPI,
  BusinessProfileAPI,
  AddressAPI,
  KYCDetailsAPI,
} from "@/lib/api";
import { toast } from "sonner";

export interface PersonalProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "";
  profilePicture: string | null;
}

export interface BusinessProfile {
  id?: number;
  businessName: string;
  legalBusinessName: string;
  contactPersonName: string;
  contactPhoneNumber: string;
}

export interface Address {
  id: string;
  type: "business" | "warehouse" | "other";
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface KYCDetails {
  panNumber: string;
  panFile: string | null;
  gstinNumber: string;
  gstinFile: string | null;
}

// Convert API format to frontend format
function apiToPersonal(data: PersonalProfileAPI | null): PersonalProfile {
  if (!data) {
    return {
      firstName: "",
      lastName: "",
      displayName: "",
      dateOfBirth: "",
      gender: "",
      profilePicture: null,
    };
  }
  return {
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    displayName: data.display_name || "",
    dateOfBirth: data.date_of_birth || "",
    gender: data.gender || "",
    profilePicture: data.profile_picture,
  };
}

function personalToApi(data: PersonalProfile): PersonalProfileAPI {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    display_name: data.displayName,
    date_of_birth: data.dateOfBirth || null,
    gender: data.gender || null,
    profile_picture: data.profilePicture,
  };
}

function apiToBusiness(data: BusinessProfileAPI | null): BusinessProfile | null {
  if (!data) return null;
  return {
    id: data.id,
    businessName: data.business_name || "",
    legalBusinessName: data.legal_business_name || "",
    contactPersonName: data.contact_person_name || "",
    contactPhoneNumber: data.contact_phone_number || "",
  };
}

function businessToApi(data: BusinessProfile): BusinessProfileAPI {
  return {
    id: data.id,
    business_name: data.businessName,
    legal_business_name: data.legalBusinessName,
    contact_person_name: data.contactPersonName,
    contact_phone_number: data.contactPhoneNumber,
  };
}

function apiToAddress(data: AddressAPI): Address {
  return {
    id: String(data.id),
    type: data.address_type,
    addressLine1: data.address_line_1 || "",
    addressLine2: data.address_line_2 || "",
    city: data.city || "",
    state: data.state || "",
    pincode: data.pincode || "",
    country: data.country || "India",
    isDefault: data.is_default || false,
  };
}

function addressToApi(data: Omit<Address, "id">): Omit<AddressAPI, "id"> {
  return {
    address_type: data.type,
    address_line_1: data.addressLine1,
    address_line_2: data.addressLine2 || null,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    country: data.country,
    is_default: data.isDefault,
  };
}

function apiToKyc(data: KYCDetailsAPI | null): KYCDetails {
  if (!data) {
    return {
      panNumber: "",
      panFile: null,
      gstinNumber: "",
      gstinFile: null,
    };
  }
  return {
    panNumber: data.pan_number || "",
    panFile: data.pan_file,
    gstinNumber: data.gstin_number || "",
    gstinFile: data.gstin_file,
  };
}

function kycToApi(data: KYCDetails): KYCDetailsAPI {
  return {
    pan_number: data.panNumber,
    pan_file: data.panFile,
    gstin_number: data.gstinNumber || null,
    gstin_file: data.gstinFile,
  };
}

export function useProfileData() {
  const [personalProfile, setPersonalProfile] = useState<PersonalProfile>({
    firstName: "",
    lastName: "",
    displayName: "",
    dateOfBirth: "",
    gender: "",
    profilePicture: null,
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [kycDetails, setKycDetails] = useState<KYCDetails>({
    panNumber: "",
    panFile: null,
    gstinNumber: "",
    gstinFile: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load data from API on mount
  const loadProfileData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchFullProfile();
      
      setPersonalProfile(apiToPersonal(data.personal));
      setBusinessProfile(apiToBusiness(data.business));
      setAddresses(data.addresses?.map(apiToAddress) || []);
      setKycDetails(apiToKyc(data.kyc));
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
      const result = await updateBusinessProfile(businessToApi(profile));
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

  const updateAddress = async (id: string, updates: Partial<Address>): Promise<boolean> => {
    setSaving(true);
    try {
      // Convert updates to API format
      const apiUpdates: Partial<AddressAPI> = {};
      if (updates.type !== undefined) apiUpdates.address_type = updates.type;
      if (updates.addressLine1 !== undefined) apiUpdates.address_line_1 = updates.addressLine1;
      if (updates.addressLine2 !== undefined) apiUpdates.address_line_2 = updates.addressLine2 || null;
      if (updates.city !== undefined) apiUpdates.city = updates.city;
      if (updates.state !== undefined) apiUpdates.state = updates.state;
      if (updates.pincode !== undefined) apiUpdates.pincode = updates.pincode;
      if (updates.country !== undefined) apiUpdates.country = updates.country;
      if (updates.isDefault !== undefined) apiUpdates.is_default = updates.isDefault;

      const result = await updateAddressAPI(Number(id), apiUpdates);
      const updatedAddress = apiToAddress(result);
      
      // If setting as default, update other addresses
      if (updates.isDefault) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id,
        })));
      } else {
        setAddresses(prev => prev.map(addr =>
          addr.id === id ? updatedAddress : addr
        ));
      }
      
      return true;
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update address");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    setSaving(true);
    try {
      await deleteAddressAPI(Number(id));
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete address");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveKycDetails = async (kyc: KYCDetails): Promise<boolean> => {
    setSaving(true);
    try {
      const result = await updateKYCDetails(kycToApi(kyc));
      setKycDetails(apiToKyc(result));
      return true;
    } catch (error) {
      console.error("Error saving KYC details:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save KYC details");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    personalProfile,
    businessProfile,
    addresses,
    kycDetails,
    loading,
    saving,
    savePersonalProfile,
    saveBusinessProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    saveKycDetails,
    refetch: loadProfileData,
  };
}
