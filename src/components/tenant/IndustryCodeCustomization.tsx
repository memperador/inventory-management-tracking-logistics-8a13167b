
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useIndustryCodeForm } from '@/hooks/useIndustryCodeForm';
import { IndustryCodeFormFields } from './IndustryCodeFormFields';
import { IndustryCodeList } from './IndustryCodeList';

interface IndustryCodeCustomizationProps {
  tenantId: string;
  onNextStep?: () => void;
}

export function IndustryCodeCustomization({ tenantId, onNextStep }: IndustryCodeCustomizationProps) {
  const {
    form,
    codes,
    selectedCodeType,
    handleCompanyTypeChange,
    handleCodeTypeChange,
    addNewCode,
    updateCode,
    onDragEnd,
    onSubmit
  } = useIndustryCodeForm(tenantId, onNextStep);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <IndustryCodeFormFields
          form={form}
          handleCompanyTypeChange={handleCompanyTypeChange}
          handleCodeTypeChange={handleCodeTypeChange}
        />

        <IndustryCodeList
          codes={codes}
          selectedCodeType={selectedCodeType}
          updateCode={updateCode}
          onDragEnd={onDragEnd}
          addNewCode={addNewCode}
        />

        <Button type="submit" className="w-full">
          Save and Continue
        </Button>
      </form>
    </Form>
  );
}
