
import React from 'react';
import { useTheme } from '@/hooks/useThemeContext';
import { useTenant } from '@/hooks/useTenantContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const ThemeSettings = () => {
  const { currentTheme, setTheme } = useTheme();
  const { currentTenant, updateTenantSettings } = useTenant();
  const { toast } = useToast();

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    
    if (currentTenant) {
      updateTenantSettings({
        theme
      });
      
      toast({
        title: "Theme updated",
        description: `Your theme has been changed to ${theme}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Theme Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of your dashboard
        </p>
      </div>

      <div className="grid gap-6">
        <div>
          <RadioGroup 
            defaultValue={currentTheme || "light"}
            onValueChange={handleThemeChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <Card className={`relative cursor-pointer transition-all ${currentTheme === 'light' ? 'ring-2 ring-primary' : ''}`}>
                <div 
                  className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary"
                  style={{display: currentTheme === 'light' ? 'block' : 'none'}}
                ></div>
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4 h-24 w-full bg-white border border-gray-200 rounded-md shadow-sm"></div>
                  <RadioGroupItem value="light" id="light" className="sr-only" />
                  <Label htmlFor="light" className="font-medium">Light Theme</Label>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className={`relative cursor-pointer transition-all ${currentTheme === 'dark' ? 'ring-2 ring-primary' : ''}`}>
                <div 
                  className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary"
                  style={{display: currentTheme === 'dark' ? 'block' : 'none'}}
                ></div>
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4 h-24 w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm"></div>
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <Label htmlFor="dark" className="font-medium">Dark Theme</Label>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className={`relative cursor-pointer transition-all ${currentTheme === 'inventory' ? 'ring-2 ring-primary' : ''}`}>
                <div 
                  className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary"
                  style={{display: currentTheme === 'inventory' ? 'block' : 'none'}}
                ></div>
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4 h-24 w-full bg-blue-50 border border-blue-200 rounded-md shadow-sm"></div>
                  <RadioGroupItem value="inventory" id="inventory" className="sr-only" />
                  <Label htmlFor="inventory" className="font-medium">Inventory Theme</Label>
                </CardContent>
              </Card>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
