import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, clearAuthToken } from "@/lib/api";
import { NavigationMenu } from "@/components/NavigationMenu";
import { AuthWidget } from "@/components/AuthWidget";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Building2, MapPin, LogOut, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useProfileData } from "@/hooks/useProfileData";
import { PersonalProfileSection } from "@/components/profile/PersonalProfileSection";
import { BusinessProfileSection } from "@/components/profile/BusinessProfileSection";
import { AddressManagementSection } from "@/components/profile/AddressManagementSection";

type ProfileTab = "personal" | "business" | "addresses";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [loading, setLoading] = useState(true);

  const {
    personalProfile,
    businessProfile,
    addresses,
    loading: dataLoading,
    savePersonalProfile,
    uploadPicture,
    saveBusinessProfile,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useProfileData();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/");
      return;
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    clearAuthToken();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Calculate completion status
  const isPersonalComplete = Boolean(personalProfile.firstName && personalProfile.lastName);
  const isBusinessComplete = Boolean(businessProfile);
  const hasAddresses = addresses.length > 0;

  const completionSteps = [
    { id: "personal", label: "Personal", complete: isPersonalComplete },
    { id: "business", label: "Business", complete: isBusinessComplete },
    { id: "addresses", label: "Addresses", complete: hasAddresses },
  ];

  const completedCount = completionSteps.filter(s => s.complete).length;

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavigationMenu />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <AuthWidget />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Progress Indicator */}
        <Card className="rounded-2xl border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Profile Completion</p>
              <span className="text-xs text-muted-foreground">
                {completedCount} of {completionSteps.length} sections
              </span>
            </div>
            <div className="flex gap-2">
              {completionSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id as ProfileTab)}
                  className="flex-1 relative"
                >
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      step.complete
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                  <div className="flex items-center justify-center mt-2">
                    {step.complete ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {step.label}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProfileTab)}>
          <TabsList className="w-full h-auto p-1 grid grid-cols-3 gap-1 bg-secondary rounded-xl">
            <TabsTrigger
              value="personal"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              <Building2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              <MapPin className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <PersonalProfileSection
              profile={personalProfile}
              onSave={savePersonalProfile}
              onUploadPicture={uploadPicture}
            />
          </TabsContent>

          <TabsContent value="business" className="mt-4">
            <BusinessProfileSection
              profile={businessProfile}
              onSave={saveBusinessProfile}
            />
          </TabsContent>

          <TabsContent value="addresses" className="mt-4">
            <AddressManagementSection
              addresses={addresses}
              onAdd={addAddress}
              onUpdate={updateAddress}
              onDelete={deleteAddress}
            />
          </TabsContent>
        </Tabs>

        {/* Logout Section */}
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full rounded-xl h-11"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}