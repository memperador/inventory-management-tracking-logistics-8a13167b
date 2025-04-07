
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTenant } from '@/hooks/useTenantContext';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDUSTRY_CODE_TYPES, COMPANY_TYPE_TO_CODE_MAP } from '@/types/tenant';
import { Button } from '@/components/ui/button';

const CompanyTypeSettings = () => {
  const { currentTenant, updateCompanyType } = useTenant();
  
  const handleCompanyTypeChange = async (value: string) => {
    try {
      await updateCompanyType(value as any);
      
      toast({
        title: 'Company type updated',
        description: `Your company type is now set to ${value}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company type.',
        variant: 'destructive',
      });
      console.error('Failed to update company type:', error);
    }
  };
  
  const getIndustryCodeName = (companyType: string) => {
    const codeType = COMPANY_TYPE_TO_CODE_MAP[companyType as keyof typeof COMPANY_TYPE_TO_CODE_MAP];
    return INDUSTRY_CODE_TYPES[codeType as keyof typeof INDUSTRY_CODE_TYPES] || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Type</CardTitle>
        <CardDescription>
          Select your company type to optimize industry-specific features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company-type">Company Type</Label>
          <Select 
            value={currentTenant?.company_type || 'construction'}
            onValueChange={handleCompanyTypeChange}
          >
            <SelectTrigger id="company-type">
              <SelectValue placeholder="Select company type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="mechanical">Mechanical</SelectItem>
              <SelectItem value="general">General Contractor</SelectItem>
            </SelectContent>
          </Select>
          {currentTenant?.company_type && (
            <p className="text-sm text-gray-500 mt-2">
              Your current industry code system: {getIndustryCodeName(currentTenant.company_type)}
            </p>
          )}
        </div>
        
        <div className="pt-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/onboarding'}
          >
            Customize Industry Codes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyTypeSettings;
