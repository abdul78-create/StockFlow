import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ImportWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName: string; // e.g., 'products'
  onSuccess?: () => void;
}

export function ImportWizardDialog({ open, onOpenChange, moduleName, onSuccess }: ImportWizardDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [previewResult, setPreviewResult] = React.useState<any>(null);

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setPreviewResult(null);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post(`/import/${moduleName}/preview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreviewResult(res.data.data);
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to preview file');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post(`/import/${moduleName}/commit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      if (onSuccess) onSuccess();
      onOpenChange(false);
      setTimeout(handleReset, 300);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setTimeout(handleReset, 300);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Import {moduleName}</DialogTitle>
          <DialogDescription>
            {step === 1 && "Upload your CSV file to import data."}
            {step === 2 && "Review your data before committing."}
            {step === 3 && "Import complete."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
              <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
              <input 
                type="file" 
                accept=".csv"
                id="file-upload" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                  Browse Files
                </Button>
              </label>
              {file && (
                <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                  <FileText className="w-4 h-4" /> {file.name}
                </div>
              )}
            </div>
          )}

          {step === 2 && previewResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
                    <CheckCircle className="w-5 h-5" /> Valid Rows
                  </div>
                  <div className="text-2xl font-bold text-emerald-800">{previewResult.validRows.length}</div>
                </div>
                <div className="p-4 border rounded-lg bg-rose-50 border-rose-200">
                  <div className="flex items-center gap-2 text-rose-700 font-semibold mb-1">
                    <AlertCircle className="w-5 h-5" /> Invalid Rows
                  </div>
                  <div className="text-2xl font-bold text-rose-800">{previewResult.invalidRows.length}</div>
                </div>
              </div>
              
              {previewResult.invalidRows.length > 0 && (
                <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto">
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Errors:</h4>
                  <ul className="text-sm space-y-2">
                    {previewResult.invalidRows.map((err: any, i: number) => (
                      <li key={i} className="text-rose-600">
                        <strong>Row {err.row}:</strong> {err.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step === 1 && (
            <Button onClick={handlePreview} disabled={!file || loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Preview
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleCommit} disabled={loading || previewResult?.validRows.length === 0}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import {previewResult?.validRows.length} Records
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
