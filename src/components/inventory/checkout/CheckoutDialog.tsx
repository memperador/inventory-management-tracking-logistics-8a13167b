
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Equipment, Document } from '@/components/equipment/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CheckoutDialogProps {
  equipment: Equipment;
  onCheckout: (equipment: Equipment, name: string, returnDate: Date) => void;
  onCheckin: (equipment: Equipment) => void;
  onAddDocument?: (equipment: Equipment, document: Document) => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ 
  equipment, 
  onCheckout,
  onCheckin,
  onAddDocument
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 1 week from now
  );
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Missing information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Missing information",
        description: "Please select a return date",
        variant: "destructive",
      });
      return;
    }

    onCheckout(equipment, name, date);
    setOpen(false);
    toast({
      title: "Equipment Checked Out",
      description: `${equipment.name} has been checked out to ${name}`,
    });
  };

  const handleCheckin = () => {
    onCheckin(equipment);
    setOpen(false);
    toast({
      title: "Equipment Checked In",
      description: `${equipment.name} has been returned`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {equipment.isCheckedOut ? 'Check In' : 'Check Out'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {equipment.isCheckedOut 
              ? `Check In: ${equipment.name}` 
              : `Check Out: ${equipment.name}`}
          </DialogTitle>
        </DialogHeader>

        {equipment.isCheckedOut ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Currently checked out to: </span>
                <span>{equipment.checkedOutTo}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the button below to check in this equipment.
              </p>
            </div>
            <DialogFooter>
              <Button variant="default" onClick={handleCheckin}>
                <LogOut className="mr-2 h-4 w-4" />
                Check In Equipment
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Expected Return Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <DialogFooter>
              <Button type="submit">Check Out Equipment</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
