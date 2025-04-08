
import React, { useState } from 'react';
import { useFileUploadWithPreview } from '@/hooks/useFileUploadWithPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Check, X } from 'lucide-react';
import Papa from 'papaparse';
import { BulkOrderItem } from '../types';

interface BulkOrderUploadProps {
  onBulkOrderSubmit: (items: BulkOrderItem[]) => void;
}

export const BulkOrderUpload: React.FC<BulkOrderUploadProps> = ({ onBulkOrderSubmit }) => {
  const [parsedItems, setParsedItems] = useState<BulkOrderItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();
  
  const { 
    files, 
    handleFileChange, 
    removeFile, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop,
    resetFiles,
  } = useFileUploadWithPreview({
    maxFiles: 1,
    maxSizeInMB: 5,
    allowedTypes: ['text/csv', 'application/vnd.ms-excel'],
    onSuccess: () => {}
  });

  const handleParseFile = () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    const file = files[0];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`Error parsing CSV: ${results.errors[0].message}`);
          toast({
            title: "CSV parsing error",
            description: `Error parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          });
          return;
        }
        
        try {
          const validItems: BulkOrderItem[] = [];
          const errors: string[] = [];
          
          results.data.forEach((row: any, index) => {
            if (!row.equipmentName || !row.quantity || !row.vendor) {
              errors.push(`Row ${index + 1}: Missing required fields`);
              return;
            }
            
            const quantity = parseInt(row.quantity);
            if (isNaN(quantity) || quantity <= 0) {
              errors.push(`Row ${index + 1}: Invalid quantity`);
              return;
            }
            
            const cost = row.estimatedCost ? parseFloat(row.estimatedCost) : 0;
            if (row.estimatedCost && (isNaN(cost) || cost < 0)) {
              errors.push(`Row ${index + 1}: Invalid cost`);
              return;
            }
            
            validItems.push({
              equipmentName: row.equipmentName,
              quantity: quantity,
              vendor: row.vendor,
              estimatedCost: row.estimatedCost ? row.estimatedCost.toString() : ''
            });
          });
          
          if (errors.length > 0) {
            setParseError(`Found ${errors.length} errors in the CSV file. Please fix and try again.`);
            toast({
              title: "Validation errors",
              description: `Found ${errors.length} errors in the CSV file`,
              variant: "destructive",
            });
            return;
          }
          
          if (validItems.length === 0) {
            setParseError("No valid items found in the CSV file");
            toast({
              title: "No valid items",
              description: "No valid items found in the CSV file",
              variant: "destructive",
            });
            return;
          }
          
          setParsedItems(validItems);
          setIsReviewing(true);
          setParseError(null);
          
          toast({
            title: "CSV parsed successfully",
            description: `Found ${validItems.length} valid items to order`,
          });
        } catch (error) {
          console.error("Error processing CSV data:", error);
          setParseError("Error processing CSV data");
          toast({
            title: "Processing error",
            description: "Error processing CSV data",
            variant: "destructive",
          });
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setParseError(`CSV parsing error: ${error.message}`);
        toast({
          title: "CSV parsing error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleSubmitBulkOrder = () => {
    onBulkOrderSubmit(parsedItems);
    resetFiles();
    setParsedItems([]);
    setIsReviewing(false);
    
    toast({
      title: "Bulk order submitted",
      description: `${parsedItems.length} items added to purchase orders`,
    });
  };
  
  const handleCancelReview = () => {
    setIsReviewing(false);
    setParsedItems([]);
  };

  return (
    <div className="space-y-4">
      {!isReviewing ? (
        <>
          <div 
            className={`border-2 border-dashed rounded-md p-6 text-center ${files.length > 0 ? 'border-primary/50 bg-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {files.length === 0 ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <p className="text-sm font-medium">
                    Drag & drop your CSV file here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    CSV file should have columns: equipmentName, quantity, vendor, estimatedCost
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                  id="csv-upload"
                />
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Browse
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-background p-3 rounded-md">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(0)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {parseError && (
                  <div className="text-sm text-destructive mt-2">{parseError}</div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    className="w-full"
                    onClick={handleParseFile}
                  >
                    Parse CSV
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">CSV Format Instructions:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>File must be CSV format</li>
              <li>Required columns: equipmentName, quantity, vendor</li>
              <li>Optional columns: estimatedCost</li>
              <li>First row should be column headers</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-md">
            <h3 className="font-medium">Review Items ({parsedItems.length})</h3>
            <p className="text-xs text-muted-foreground mt-1">Please review the items before submitting the bulk order</p>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 text-xs font-medium">Equipment</th>
                  <th className="text-center p-2 text-xs font-medium">Qty</th>
                  <th className="text-left p-2 text-xs font-medium">Vendor</th>
                  <th className="text-right p-2 text-xs font-medium">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsedItems.slice(0, 5).map((item, index) => (
                  <tr key={index} className="hover:bg-muted/30">
                    <td className="p-2 text-xs">{item.equipmentName}</td>
                    <td className="p-2 text-xs text-center">{item.quantity}</td>
                    <td className="p-2 text-xs">{item.vendor}</td>
                    <td className="p-2 text-xs text-right">
                      {item.estimatedCost ? `$${item.estimatedCost}` : '-'}
                    </td>
                  </tr>
                ))}
                {parsedItems.length > 5 && (
                  <tr className="bg-muted/10">
                    <td colSpan={4} className="p-2 text-xs text-center text-muted-foreground">
                      + {parsedItems.length - 5} more items...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancelReview}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="w-full"
              onClick={handleSubmitBulkOrder}
            >
              <Check className="mr-2 h-4 w-4" />
              Submit Bulk Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
