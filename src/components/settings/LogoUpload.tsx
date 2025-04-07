
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTenant } from '@/hooks/useTenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const LogoUpload = () => {
  const { currentTenant, updateTenantSettings } = useTenant();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize logo from tenant settings
  useEffect(() => {
    if (currentTenant?.settings?.logoUrl) {
      setLogoUrl(currentTenant.settings.logoUrl);
    }
  }, [currentTenant]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTenant) return;

    try {
      setIsUploading(true);

      // Format file path for storage: /tenant_logos/{tenant_id}/{filename}
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${currentTenant.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tenant_logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('tenant_logos')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Update tenant settings with the logo URL
      await updateTenantSettings({
        logoUrl: fileUrl
      });

      setLogoUrl(fileUrl);

      toast({
        title: "Logo uploaded",
        description: "Your organization logo has been updated successfully."
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentTenant) return;

    try {
      // Extract file path from URL
      if (logoUrl) {
        const urlParts = logoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const tenantId = currentTenant.id;
        const filePath = `${tenantId}/${fileName}`;

        // Delete file from storage
        const { error: deleteError } = await supabase.storage
          .from('tenant_logos')
          .remove([filePath]);

        if (deleteError) throw deleteError;
      }

      // Update tenant settings to remove logo URL
      await updateTenantSettings({
        logoUrl: null
      });

      setLogoUrl(null);

      toast({
        title: "Logo removed",
        description: "Your organization logo has been removed."
      });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: "There was an error removing your logo. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-medium">Organization Logo</h4>
        <p className="text-sm text-muted-foreground">
          Upload your organization logo to personalize your experience
        </p>
      </div>

      <div className="flex items-center gap-4">
        {logoUrl ? (
          <div className="relative">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={logoUrl} alt="Organization logo" />
              <AvatarFallback>
                <Image className="h-8 w-8 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon" 
                  variant="ghost" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Remove logo?</p>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm" 
                      variant="destructive" 
                      onClick={handleRemoveLogo}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-muted">
            <Image className="h-8 w-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="flex flex-col">
              <Button 
                variant="outline" 
                className="mb-2"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : logoUrl ? "Change logo" : "Upload logo"}
              </Button>
              <span className="text-xs text-muted-foreground">
                Recommended: 512x512px or larger, PNG or JPG
              </span>
            </div>
            <input 
              id="logo-upload" 
              type="file" 
              className="hidden" 
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
