
import { useToast } from "@/components/ui/use-toast";
import Papa from "papaparse";
import { Equipment } from "@/components/equipment/types";

export function useInventoryImportExport() {
  const { toast } = useToast();

  const handleImport = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'json') {
      // Handle JSON import
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          console.log("Imported JSON data:", importedData);
          toast({
            title: "Import Successful",
            description: `Imported ${importedData.length || 0} items from JSON`,
          });
        } catch (error) {
          console.error("JSON import error:", error);
          toast({
            title: "Import Failed",
            description: "The JSON format is not valid",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } 
    else if (fileExtension === 'csv') {
      // Handle CSV import
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data, errors } = results;
          
          if (errors.length > 0) {
            console.error("CSV parsing errors:", errors);
            toast({
              title: "CSV Import Errors",
              description: `${errors.length} errors found in CSV file`,
              variant: "destructive",
            });
            return;
          }
          
          console.log("Imported CSV data:", data);
          toast({
            title: "Import Successful",
            description: `Imported ${data.length || 0} items from CSV`,
          });
        },
        error: (error) => {
          console.error("CSV import error:", error);
          toast({
            title: "Import Failed",
            description: "Failed to parse CSV file",
            variant: "destructive",
          });
        }
      });
    } 
    else {
      toast({
        title: "Unsupported File Format",
        description: "Please upload a JSON or CSV file",
        variant: "destructive",
      });
    }
  };

  const handleExport = (data: any[]) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `inventory-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Successful",
      description: `${data.length} items exported to JSON`,
    });
  };

  const handleExportCSV = (data: any[]) => {
    const csv = Papa.unparse(data);
    const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    
    const exportFileDefaultName = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', csvURL);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Successful",
      description: `${data.length} items exported to CSV`,
    });
  };

  return { 
    handleImport, 
    handleFileUpload, 
    handleExport,
    handleExportCSV
  };
}
