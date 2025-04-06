
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  equipmentId: string;
  onFileUploaded?: () => void;
}

export function FileUpload({ equipmentId, onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Get the tenant ID to create the proper folder structure
      const { data: tenantData, error: tenantError } = await supabase
        .from('equipment')
        .select('tenant_id')
        .eq('id', equipmentId)
        .single();

      if (tenantError) {
        throw new Error('Could not retrieve tenant information');
      }

      // Format the file path: /{tenant_id}/{equipment_id}/{filename}
      const filePath = `${tenantData.tenant_id}/${equipmentId}/${file.name}`;

      // Upload the file
      const { error } = await supabase.storage
        .from('equipment_docs')
        .upload(filePath, file);

      if (error) throw error;

      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully.`
      });

      // Clear the file input
      e.target.value = '';

      // Notify parent component if callback exists
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={`file-upload-${equipmentId}`} className="cursor-pointer">
        <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-md hover:bg-gray-50 transition-colors">
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {isUploading ? 'Uploading...' : 'Click to upload documentation'}
          </span>
        </div>
        <input
          id={`file-upload-${equipmentId}`}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
