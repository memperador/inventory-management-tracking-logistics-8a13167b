
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { INVENTORY_CATEGORIES } from '@/components/equipment/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIndustryCodeForm } from '@/hooks/useIndustryCodeForm';
import { industryCodeFormUtils } from '@/hooks/industry/industryCodeFormUtils';

export const InventoryItemFormFields = ({ form }) => {
  const { csiOptions, necOptions, necPlaceholder, csiPlaceholder } = useIndustryCodeForm();
  const { showTypeSpecificFields } = industryCodeFormUtils();

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="tracking">Tracking & Codes</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter item name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <FormControl>
                  <Input placeholder="Equipment type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INVENTORY_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Out of Service">Out of Service</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Certification Pending">Certification Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Current location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                  <Input placeholder="Manufacturer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="Model number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="Serial number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Cost in USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
      
      <TabsContent value="tracking" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assetTag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Tag</FormLabel>
                <FormControl>
                  <Input placeholder="Asset tag ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rfidType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFID Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select RFID type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="active">Active RFID</SelectItem>
                    <SelectItem value="passive">Passive RFID</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {form.watch('rfidType') !== 'none' && (
          <FormField
            control={form.control}
            name="rfidTag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFID Tag Number</FormLabel>
                <FormControl>
                  <Input placeholder="RFID tag number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nec_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NEC Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={necPlaceholder} 
                    list="nec-codes" 
                    {...field} 
                  />
                </FormControl>
                <datalist id="nec-codes">
                  {necOptions.map((option, index) => (
                    <option key={index} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </datalist>
                <FormDescription>
                  National Electrical Code reference
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="csi_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CSI Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={csiPlaceholder} 
                    list="csi-codes" 
                    {...field} 
                  />
                </FormControl>
                <datalist id="csi-codes">
                  {csiOptions.map((option, index) => (
                    <option key={index} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </datalist>
                <FormDescription>
                  Construction Specifications Institute code
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="compliance" className="space-y-4">
        <FormField
          control={form.control}
          name="certificationRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Certification Required
                </FormLabel>
                <FormDescription>
                  Check if this equipment requires certification
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {form.watch('certificationRequired') && (
          <FormField
            control={form.control}
            name="certificationExpiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lastInspection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Inspection Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nextInspection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Inspection Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="complianceStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compliance Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compliance status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Compliant">Compliant</SelectItem>
                  <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  <SelectItem value="Review Required">Review Required</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="complianceNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compliance Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add notes about compliance requirements or issues" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
    </Tabs>
  );
};
