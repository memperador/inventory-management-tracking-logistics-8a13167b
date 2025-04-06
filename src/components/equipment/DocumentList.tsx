
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { FileObject as SupabaseFileObject } from '@supabase/storage-js';

interface DocumentListProps {
  equipmentId: string;
  tenantId: string;
}

// Extend the Supabase FileObject type with our required properties
interface FileObject extends SupabaseFileObject {
  size: number;
  updated_at: string;
}

export function DocumentList({ equipmentId, tenantId }: DocumentListProps) {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      
      // Get files from the specific equipment folder
      const folderPath = `${tenantId}/${equipmentId}`;
      const { data, error } = await supabase.storage
        .from('equipment_docs')
        .list(folderPath);

      if (error) {
        throw error;
      }

      // Filter out folders, only show files and map to our FileObject type
      const fileObjects = data
        ?.filter(item => !item.id.endsWith('/'))
        .map(item => ({
          ...item,
          size: item.metadata?.size || 0,
          updated_at: item.updated_at || new Date().toISOString()
        })) || [];
        
      setFiles(fileObjects);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error',
        description: 'Could not load documentation files.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (equipmentId && tenantId) {
      loadFiles();
    }
  }, [equipmentId, tenantId]);

  const handleDownload = async (fileName: string) => {
    try {
      const filePath = `${tenantId}/${equipmentId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('equipment_docs')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds

      if (error) throw error;

      // Open the download URL in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download failed',
        description: 'Could not download the file.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const filePath = `${tenantId}/${equipmentId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('equipment_docs')
        .remove([filePath]);

      if (error) throw error;

      // Refresh the file list
      loadFiles();
      
      toast({
        title: 'File deleted',
        description: `${fileName} has been deleted.`
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Deletion failed',
        description: 'Could not delete the file.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading files...</div>;
  }

  if (files.length === 0) {
    return <div className="text-sm text-gray-500">No documentation files available.</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Documentation Files</h4>
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm truncate max-w-[200px]" title={file.name}>
                {file.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDownload(file.name)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(file.name)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
