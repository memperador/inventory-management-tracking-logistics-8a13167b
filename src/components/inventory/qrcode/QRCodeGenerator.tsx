
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Equipment } from '@/components/equipment/types';
import { QrCode, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface QRCodeGeneratorProps {
  equipment: Equipment;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ equipment }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const qrValue = `equipment:${equipment.id}`;
  const equipmentUrl = `${window.location.origin}/inventory?equipment=${equipment.id}`;

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Equipment QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <QRCode value={qrValue} />
          
          <div className="mt-4 text-sm">
            <p>Equipment: {equipment.name}</p>
            <p>ID: {equipment.id}</p>
            <p className="text-xs text-muted-foreground mt-1">Scan to view equipment details</p>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex flex-col w-full space-y-2">
            <Button onClick={handlePrint} variant="outline" className="w-full">
              <Printer className="mr-2 h-4 w-4" />
              Print QR Code
            </Button>
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
