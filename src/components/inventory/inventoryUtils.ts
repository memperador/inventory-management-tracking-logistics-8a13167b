
import { useToast } from "@/components/ui/use-toast";

export function useInventoryImportExport() {
  const { toast } = useToast();

  const handleImport = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        console.log("Imported data:", importedData);
        toast({
          title: "Import Successful",
          description: `Imported ${importedData.length || 0} items`,
        });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: "The file format is not valid",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
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

  return { handleImport, handleFileUpload, handleExport };
}
