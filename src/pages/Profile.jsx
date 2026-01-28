import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Phone, CreditCard, CheckCircle2, AlertCircle, Upload, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [profileData, setProfileData] = useState({
    profilePicture: null,
    firstName: 'John',
    lastName: 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+234 812 345 6789',
    bvn: '12345678901',
    nin: '98765432109',
    phoneVerified: true,
    bvnVerified: true,
    ninVerified: false,
  });

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid image file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileData(prev => ({
        ...prev,
        profilePicture: e.target.result
      }));

      setTimeout(() => {
        setIsUploadingPhoto(false);
        toast({
          title: "Photo Updated",
          description: "Your profile picture has been updated successfully."
        });
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const InfoCard = ({ icon: Icon, label, value, verified, showVerification = false }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium text-foreground break-all">{value}</p>
        {showVerification && (
          <div className="flex items-center gap-1 mt-2">
            {verified ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-500 font-medium">Verified</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-500 font-medium">Pending Verification</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account details and verification status</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-border/50 overflow-hidden">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-16 w-16 text-muted-foreground" />
                )}
              </div>

              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-colors border-4 border-background"
              >
                {isUploadingPhoto ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 border-2 border-transparent border-t-white rounded-full"
                  />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
              />
            </motion.div>

            <div className="text-center mt-4">
              <h2 className="text-xl font-bold text-foreground">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{profileData.email}</p>
            </div>

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => document.getElementById('photo-upload').click()}
              disabled={isUploadingPhoto}
            >
              <Upload className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">Personal Information</h3>
              <p className="text-xs text-muted-foreground">Your personal details and account information</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">First Name</p>
                  <p className="text-sm font-medium text-foreground">{profileData.firstName}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Last Name</p>
                  <p className="text-sm font-medium text-foreground">{profileData.lastName}</p>
                </div>
              </div>

              <InfoCard
                icon={Mail}
                label="Email Address"
                value={profileData.email}
                verified={true}
                showVerification={true}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">Contact Information</h3>
          <p className="text-xs text-muted-foreground">Your verified contact details</p>
        </div>

        <div className="space-y-4">
          <InfoCard
            icon={Phone}
            label="Phone Number"
            value={profileData.phone}
            verified={profileData.phoneVerified}
            showVerification={true}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">Identity Verification</h3>
          <p className="text-xs text-muted-foreground">Your identity verification status and details</p>
        </div>

        <div className="space-y-4">
          <InfoCard
            icon={CreditCard}
            label="Bank Verification Number (BVN)"
            value={profileData.bvn}
            verified={profileData.bvnVerified}
            showVerification={true}
          />

          <InfoCard
            icon={CreditCard}
            label="National Identification Number (NIN)"
            value={profileData.nin}
            verified={profileData.ninVerified}
            showVerification={true}
          />
        </div>

        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Verification Notice</p>
              <p className="text-xs text-muted-foreground">
                Some of your information is pending verification. This process typically takes 24-48 hours.
                You'll receive a notification once the verification is complete.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">Account Actions</h3>
          <p className="text-xs text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
          >
            <div className="text-left">
              <p className="font-medium text-sm">Edit Profile Information</p>
              <p className="text-xs text-muted-foreground">Update your personal details</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
          >
            <div className="text-left">
              <p className="font-medium text-sm">Update Phone Number</p>
              <p className="text-xs text-muted-foreground">Change your registered phone number</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
          >
            <div className="text-left">
              <p className="font-medium text-sm">Verify Identity Documents</p>
              <p className="text-xs text-muted-foreground">Complete or update your identity verification</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
