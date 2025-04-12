import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CvTemplate } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Palette, 
  Minimize 
} from 'lucide-react';

// Import CV template thumbnail images
import elegantCvThumbnail from '@/assets/cv-templates/elegant_cv_template_thumbnail.png';
import skillBasedCvThumbnail from '@/assets/cv-templates/skill-based-cv-template.png';
import scientificTemplateThumbnail from '@/assets/cv-templates/scientific-template.png';
import creativeCvThumbnail from '@/assets/cv-templates/creative-cv-template.jpeg';
import professionalCvThumbnail from '@/assets/cv-templates/professional-cv-template.jpeg';
import modernCvThumbnail from '@/assets/cv-templates/modern-cv-template.jpeg';
import minimalistCvThumbnail from '@/assets/cv-templates/minimalist-cv-template.jpeg';
import corporateCvThumbnail from '@/assets/cv-templates/corporate-cv-template.jpeg';
import technicalCvThumbnail from '@/assets/cv-templates/technical-cv-template.jpeg';
import executiveCvThumbnail from '@/assets/cv-templates/executive-cv-template.jpeg';

interface TemplateSelectorProps {
  selectedTemplateId: number | null;
  onSelectTemplate: (template: CvTemplate) => void;
}

const templateTypeIcons = {
  classic: <FileText className="h-5 w-5" />,
  modern: <Briefcase className="h-5 w-5" />,
  creative: <Palette className="h-5 w-5" />,
  professional: <BookOpen className="h-5 w-5" />,
  academic: <GraduationCap className="h-5 w-5" />,
  minimalist: <Minimize className="h-5 w-5" />
};

export default function TemplateSelector({ selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Map for template image URLs
  const templateImageMap: Record<string, string> = {
    'Elegant Resume': elegantCvThumbnail,
    'Skills-Based CV': skillBasedCvThumbnail,
    'Scientific CV': scientificTemplateThumbnail,
    'Creative Portfolio': creativeCvThumbnail,
    'Professional Executive': professionalCvThumbnail,
    'Modern Clean': modernCvThumbnail,
    'Minimalist Resume': minimalistCvThumbnail,
    'Corporate Professional': corporateCvThumbnail,
    'Technical Specialist': technicalCvThumbnail,
    'Executive Leadership': executiveCvThumbnail
  };

  // Fetch all CV templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['/api/cv/templates'],
    queryFn: async () => {
      const response = await fetch('/api/cv/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch CV templates');
      }
      return response.json();
    }
  });
  
  // Add type safety to templates
  const typedTemplates = templates as CvTemplate[] || [];

  // Filter templates by type based on active tab
  const filteredTemplates = activeTab === "all" 
    ? typedTemplates 
    : typedTemplates.filter((template) => template.type === activeTab);
  
  // Get unique template types
  const templateTypes = Array.from(
    new Set(typedTemplates.map((template) => template.type || "classic").filter(Boolean))
  );
  
  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-500">Error loading templates: {error.toString()}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap mb-4">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {templateTypes.map((type) => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="flex items-center gap-2"
            >
              {templateTypeIcons[type as keyof typeof templateTypeIcons]}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredTemplates.map((template: CvTemplate) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden ${
                  selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <div className="relative h-40 bg-muted">
                  {templateImageMap[template.name] ? (
                    <img 
                      src={templateImageMap[template.name]} 
                      alt={template.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : template.thumbnailUrl ? (
                    <img 
                      src={template.thumbnailUrl} 
                      alt={template.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {templateTypeIcons[template.type as keyof typeof templateTypeIcons]}
                      <span className="ml-2">{template.name}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {template.type}
                      </p>
                    </div>
                    <Button 
                      variant={selectedTemplateId === template.id ? "default" : "outline"} 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template);
                      }}
                    >
                      {selectedTemplateId === template.id ? 'Selected' : 'Use'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {filteredTemplates.length === 0 && !isLoading && (
        <div className="text-center p-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No templates found for this category.</p>
        </div>
      )}
    </div>
  );
}