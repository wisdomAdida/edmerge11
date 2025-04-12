import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, FileText, Library, HelpCircle, AlertCircle, CreditCard } from 'lucide-react';
import { isGeminiConfigured } from '@/lib/gemini';
import { CvTemplate } from '@shared/schema';
import TemplateSelector from '@/components/cv-generator/TemplateSelector';
import CvForm from '@/components/cv-generator/CvForm';
import CvPreview from '@/components/cv-generator/CvPreview';
import CvLibrary from '@/components/cv-generator/CvLibrary';
import { generateCvPdf } from '@/lib/pdfGenerator';
import { useAuth } from '@/hooks/use-auth';
import { useGeoLocation } from '@/hooks/use-location';
import { formatCurrency, convertUSDtoNGN } from '@/lib/utils';
import { useCvPayment } from '@/hooks/use-cv-payment';
import CvPaymentModal from '@/components/cv-generator/CvPaymentModal';

export default function CvGeneratorPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState<CvTemplate | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if Gemini API is configured
  useEffect(() => {
    const checkGeminiConfig = async () => {
      const configured = await isGeminiConfigured();
      setIsAiConfigured(configured);
    };
    
    checkGeminiConfig();
  }, []);

  // Fetch user's CV generation count
  const { data: countData } = useQuery({
    queryKey: ['/api/user/cv-generation-count'],
    queryFn: async () => {
      const response = await fetch('/api/user/cv-generation-count');
      if (!response.ok) {
        throw new Error('Failed to fetch CV generation count');
      }
      return response.json();
    }
  });

  // State for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // One-time payment fee configuration
  const feeUSD = 1;  // $1 USD
  const feeNGN = convertUSDtoNGN(feeUSD);  // Nigerian Naira equivalent

  // Get CV payment info from our custom hook
  const { hasValidCvPayment } = useCvPayment();
  
  // Check if user has valid payment for CV Generator
  const hasValidPayment = () => {
    if (!user) return false;
    
    // Consider subscription users as having valid payment
    const isSubscribed = user.subscriptionStatus === 'active' && 
                        (user.subscriptionType === 'basic' || user.subscriptionType === 'premium');
                        
    // Check if user has made a successful CV payment
    return isSubscribed || hasValidCvPayment();
  };
  
  // This platform always requires payment for CV generation
  const requiresPayment = () => {
    return !hasValidPayment();
  };

  // Handle form submission to generate CV
  const handleFormSubmit = async (values: any) => {
    // Check if payment is required
    if (requiresPayment()) {
      // Show payment modal instead of toast
      setShowPaymentModal(true);
      // Store form data for later use after payment
      setFormData(values);
      return;
    }
    
    // Check if template is selected
    if (!selectedTemplate) {
      toast({
        title: "Template required",
        description: "Please select a CV template first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setFormData(values);
    
    try {
      // Format the data for PDF generation
      const formattedData = {
        name: values.name,
        profession: values.profession,
        contact: {
          email: values.email,
          phone: values.phone,
          location: values.location
        },
        includeProfilePicture: values.includeProfilePicture || false,
        profilePicture: values.includeProfilePicture ? values.profilePicture : null,
        summary: values.summary,
        skills: {
          technical: values.skills.filter((s: string) => s.trim()).slice(0, Math.ceil(values.skills.length * 0.6)),
          soft: values.skills.filter((s: string) => s.trim()).slice(Math.ceil(values.skills.length * 0.6))
        },
        experience: values.experience.map((exp: any) => ({
          ...exp,
          bulletPoints: exp.bulletPoints?.filter((b: string) => b.trim()) || []
        })),
        education: values.education.map((edu: any) => ({
          ...edu,
          highlights: edu.highlights?.filter((h: string) => h.trim()) || []
        })),
        certifications: values.certifications?.filter((c: any) => c.name.trim()),
        languages: values.languages?.filter((l: string) => l.trim())
      };
      
      // Generate PDF
      const pdfDataUrl = await generateCvPdf(
        { id: 0, name: values.name, userId: 0, templateId: selectedTemplate.id, content: formattedData } as any,
        selectedTemplate
      );
      
      setPdfUrl(pdfDataUrl);
      
      toast({
        title: "CV Generated",
        description: "Your CV has been generated successfully. You can now download it or save it to your library.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating CV:", error);
      toast({
        title: "Generation failed",
        description: "An error occurred while generating your CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle successful payment for CV generation
  const handlePaymentSuccess = async () => {
    // If the user has already filled out the form, generate the CV
    if (formData && selectedTemplate) {
      // Process the form submission again
      setIsGenerating(true);
      
      try {
        // Format the data for PDF generation (same as in handleFormSubmit)
        const formattedData = {
          name: formData.name,
          profession: formData.profession,
          contact: {
            email: formData.email,
            phone: formData.phone,
            location: formData.location
          },
          includeProfilePicture: formData.includeProfilePicture || false,
          profilePicture: formData.includeProfilePicture ? formData.profilePicture : null,
          summary: formData.summary,
          skills: {
            technical: formData.skills.filter((s: string) => s.trim()).slice(0, Math.ceil(formData.skills.length * 0.6)),
            soft: formData.skills.filter((s: string) => s.trim()).slice(Math.ceil(formData.skills.length * 0.6))
          },
          experience: formData.experience.map((exp: any) => ({
            ...exp,
            bulletPoints: exp.bulletPoints?.filter((b: string) => b.trim()) || []
          })),
          education: formData.education.map((edu: any) => ({
            ...edu,
            highlights: edu.highlights?.filter((h: string) => h.trim()) || []
          })),
          certifications: formData.certifications?.filter((c: any) => c.name.trim()),
          languages: formData.languages?.filter((l: string) => l.trim())
        };
        
        // Generate PDF
        const pdfDataUrl = await generateCvPdf(
          { id: 0, name: formData.name, userId: 0, templateId: selectedTemplate.id, content: formattedData } as any,
          selectedTemplate
        );
        
        setPdfUrl(pdfDataUrl);
        
        toast({
          title: "CV Generated",
          description: "Your CV has been generated successfully. You can now download it or save it to your library.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error generating CV after payment:", error);
        toast({
          title: "Generation failed",
          description: "An error occurred while generating your CV. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      toast({
        title: "Payment successful",
        description: "You can now generate CV documents. Please fill in your details and select a template.",
      });
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: CvTemplate) => {
    setSelectedTemplate(template);
    
    // If they already submitted the form, regenerate the CV with the new template
    if (formData) {
      handleFormSubmit(formData);
    }
  };

  // Handle save completion
  const handleSaveComplete = () => {
    // Reset the state and switch to the library tab
    setPdfUrl(null);
    setFormData(null);
    setSelectedTemplate(null);
    setActiveTab('library');
  };

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI CV Generator</h1>
          <p className="text-muted-foreground mt-1">
            Create professional, stunning CVs in minutes with AI assistance
          </p>
        </div>
        
        {!isAiConfigured && (
          <Card className="bg-amber-50 border-amber-200 shadow-sm">
            <CardContent className="p-3 flex items-center text-amber-700 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">AI features limited</p>
                <p className="text-xs text-amber-600">Contact administrator to enable enhanced AI features</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {requiresPayment() && (
          <Card className="bg-amber-50 border-amber-200 shadow-sm">
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="flex items-center text-amber-700 text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Payment Required</p>
                  <p className="text-xs text-amber-600">
                    CV generation requires a one-time payment or subscription
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  size="sm" 
                  className="h-8 text-xs flex items-center gap-1.5"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  One-time Payment
                </Button>
                <Button 
                  variant="outline"
                  size="sm" 
                  className="h-8 text-xs"
                  asChild
                >
                  <a href="/subscription">Subscribe</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="create" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Create CV
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center">
              <Library className="h-4 w-4 mr-2" />
              My CVs
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="#how-it-works">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">How it works</span>
            </a>
          </Button>
        </div>

        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6 order-1 lg:order-none">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Select a Template
                    {selectedTemplate && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TemplateSelector 
                    selectedTemplateId={selectedTemplate?.id || null}
                    onSelectTemplate={handleTemplateSelect}
                  />
                </CardContent>
              </Card>

              {/* CV Form */}
              <CvForm 
                onSubmit={handleFormSubmit}
                selectedTemplate={selectedTemplate}
                isSubmitting={isGenerating}
              />
            </div>

            {/* Preview */}
            <div className="order-none lg:order-1 sticky top-4">
              <CvPreview 
                cvData={formData}
                template={selectedTemplate as CvTemplate}
                pdfUrl={pdfUrl}
                isGenerating={isGenerating}
                onSave={handleSaveComplete}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <CvLibrary />
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <div id="how-it-works" className="mt-16 pt-8 border-t">
        <h2 className="text-2xl font-bold tracking-tight mb-6">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full w-10 h-10 bg-primary/10 text-primary flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose a Template</h3>
              <p className="text-muted-foreground">
                Browse through our collection of 35+ professionally designed CV templates.
                Select one that matches your style and professional needs.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full w-10 h-10 bg-primary/10 text-primary flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Your Details</h3>
              <p className="text-muted-foreground">
                Fill in your personal information, experience, education, and skills.
                Our AI can enhance your content to make it more professional and impactful.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full w-10 h-10 bg-primary/10 text-primary flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Download or Save</h3>
              <p className="text-muted-foreground">
                Preview your finished CV, make any final adjustments, then download it as a PDF
                or save it to your library for future use.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 bg-muted p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Pricing Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                One-Time Payment ($1/₦1000)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  Create up to 10 CVs within 24 hours
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  Access to all 35+ templates
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  Basic AI content enhancement
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  Download CVs as PDFs
                </li>
              </ul>
              
              <Button 
                className="mt-4 w-full"
                onClick={() => setShowPaymentModal(true)}
              >
                Pay Now
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Subscription
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  Unlimited CV creations
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  Priority access to new templates
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  Advanced AI-powered content optimization
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  CV generation included in platform subscription
                </li>
              </ul>
              
              <Button 
                className="mt-4 w-full"
                asChild
              >
                <a href="/subscription">Subscribe Now</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      <CvPaymentModal 
        isOpen={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}