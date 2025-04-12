import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Check,
  RotateCcw,
  ExternalLink,
  EyeOff
} from 'lucide-react';
import { CvTemplate, UserCv } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface CvPreviewProps {
  cvData: any;
  template: CvTemplate;
  pdfUrl: string | null;
  isGenerating: boolean;
  onSave: () => void;
}

export default function CvPreview({ cvData, template, pdfUrl, isGenerating, onSave }: CvPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [showPreview, setShowPreview] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Reset zoom when PDF changes
  useEffect(() => {
    setZoom(1);
  }, [pdfUrl]);
  
  // Zoom in/out functions
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);
  
  // Handle download
  const handleDownload = () => {
    if (pdfUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${cvData.name.split(' ').join('_')}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download successful",
        description: "Your CV has been downloaded successfully.",
        variant: "default",
      });
    }
  };
  
  // Save CV mutation
  const saveToLibraryMutation = useMutation({
    mutationFn: async () => {
      // First take a screenshot for the preview
      if (!previewRef.current) return null;
      
      try {
        const canvas = await html2canvas(previewRef.current);
        const previewUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Create payload for saving
        const payload = {
          name: `${cvData.name} - ${template.name} CV`,
          templateId: template.id,
          content: cvData,
          pdfUrl: pdfUrl
        };
        
        const response = await apiRequest('POST', '/api/user/cvs', payload);
        return response.json();
      } catch (error) {
        console.error("Error saving CV:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/cvs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/cv-generation-count'] });
      
      toast({
        title: "CV saved successfully",
        description: "Your CV has been saved to your library.",
        variant: "default",
      });
      
      // Call the parent's onSave callback
      onSave();
    },
    onError: (error) => {
      console.error("Error saving CV:", error);
      toast({
        title: "Error saving CV",
        description: error.message || "An error occurred while saving your CV.",
        variant: "destructive",
      });
    }
  });
  
  // Open PDF in new tab/window
  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };
  
  // Handle CV template selection
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };
  
  if (isGenerating) {
    return (
      <Card className="relative h-full">
        <CardContent className="p-0 h-[800px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center">
              <RefreshCw className="h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-lg font-medium">Generating your CV</p>
            <p className="text-sm text-muted-foreground">Please wait while we create your professional CV...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!pdfUrl) {
    return (
      <Card className="relative h-full">
        <CardContent className="p-0 h-[800px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-40 w-32 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
            <Skeleton className="h-4 w-60 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="relative h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={zoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2"
          onClick={resetZoom}
        >
          {Math.round(zoom * 100)}%
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={zoomIn}
          disabled={zoom >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={togglePreview}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-between z-10">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={openInNewTab}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Open</span>
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            className="gap-2"
            onClick={() => saveToLibraryMutation.mutate()}
            disabled={saveToLibraryMutation.isPending}
          >
            {saveToLibraryMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save to Library</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-0 h-[800px] overflow-auto flex items-center justify-center bg-gray-100">
        {showPreview ? (
          <div 
            ref={previewRef}
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'center top',
              transition: 'transform 0.2s ease'
            }}
            className="my-4"
          >
            <iframe 
              src={pdfUrl}
              className="w-[595px] h-[842px] border-none shadow-lg"
              title="CV Preview"
            />
          </div>
        ) : (
          <div className="text-center p-8 max-w-md">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4"
              onClick={togglePreview}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Show Preview
            </Button>
            <h3 className="text-lg font-medium mb-2">Preview Hidden</h3>
            <p className="text-sm text-muted-foreground">
              You've hidden the CV preview. Click the button above to show it again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}