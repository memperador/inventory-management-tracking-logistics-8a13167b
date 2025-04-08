
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Equipment } from '@/components/equipment/types';
import { QrCode, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Mock QR code component (would use a real QR code library in production)
const QRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 200 }) => {
  // This is a placeholder for a real QR code component
  return (
    <div 
      className="bg-white p-4 rounded-md border" 
      style={{ width: size, height: size }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-xs text-center text-gray-500">
          QR Code for: {value}
        </div>
      </div>
    </div>
  );
};

export interface QRCodeGeneratorProps {
  equipmentData: Equipment[];
  hasBulkAccess?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  equipmentData,
  hasBulkAccess = false
}) => {
  const [open, setOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    equipmentData.length > 0 ? equipmentData[0] : null
  );
  const { toast } = useToast();

  const qrValue = selectedEquipment ? `equipment:${selectedEquipment.id}` : '';
  const equipmentUrl = selectedEquipment ? 
    `${window.location.origin}/inventory?equipment=${selectedEquipment.id}` : '';

  const handlePrint = () => {
    toast({
      title: "Print requested",
      description: "Print dialog would open with QR code",
    });
    // In a real implementation, this would open a print dialog with the QR code
  };

  const handleDownload = () => {
    toast({
      title: "QR Code Downloaded",
      description: "QR code image would be downloaded",
    });
    // In a real implementation, this would download the QR code as an image
  };

  // If no equipment is available, show a message
  if (equipmentData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold tracking-tight">No Equipment Available</h3>
        <p className="text-muted-foreground mt-2">
          Add equipment to your inventory to generate QR codes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Equipment QR Code Generator</h3>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList>
          <TabsTrigger value="single">Single QR Code</TabsTrigger>
          {hasBulkAccess && <TabsTrigger value="batch">Batch Generation</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="single" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 space-y-4">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Select Equipment</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {equipmentData.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedEquipment(item)}
                      className={`p-2 border rounded-md cursor-pointer hover:bg-muted ${selectedEquipment?.id === item.id ? 'bg-muted border-primary' : ''}`}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {item.id}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center">
              {selectedEquipment && (
                <>
                  <QRCode value={qrValue} />
                  
                  <div className="mt-4 text-sm w-full">
                    <div className="border rounded-md p-4 space-y-2">
                      <p><span className="font-medium">Equipment:</span> {selectedEquipment.name}</p>
                      <p><span className="font-medium">ID:</span> {selectedEquipment.id}</p>
                      <p><span className="font-medium">Category:</span> {selectedEquipment.category || 'N/A'}</p>
                      <p><span className="font-medium">Location:</span> {selectedEquipment.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">Scan to view equipment details</p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handlePrint} variant="outline" className="w-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print QR Code
                      </Button>
                      <Button onClick={handleDownload} variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        {hasBulkAccess && (
          <TabsContent value="batch" className="space-y-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-4">Batch QR Code Generation</h4>
              <p className="text-muted-foreground mb-4">Generate QR codes for multiple equipment items at once.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentData.slice(0, 6).map(item => (
                  <div key={item.id} className="border rounded-md p-3 flex flex-col items-center">
                    <QRCode value={`equipment:${item.id}`} size={120} />
                    <div className="mt-2 text-center">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {equipmentData.length > 6 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing 6 of {equipmentData.length} items. Use the print button below to generate all QR codes.
                </p>
              )}
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="w-full">
                  <Printer className="mr-2 h-4 w-4" />
                  Print All QR Codes ({equipmentData.length})
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download All as PDF
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
