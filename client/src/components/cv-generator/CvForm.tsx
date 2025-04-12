import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Plus, Trash2, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CvTemplate } from '@shared/schema';
import { generateCvContent, improveCvText } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  profession: z.string().min(2, { message: 'Profession is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(5, { message: 'Phone number is required' }),
  location: z.string().optional(),
  includeProfilePicture: z.boolean().default(false),
  profilePicture: z.string().optional(),
  summary: z.string().min(10, { message: 'Summary is required' }),
  skills: z.array(z.string()).min(1, { message: 'At least one skill is required' }),
  experience: z.array(z.object({
    title: z.string().min(2, { message: 'Job title is required' }),
    company: z.string().min(2, { message: 'Company name is required' }),
    location: z.string().optional(),
    startDate: z.string().min(2, { message: 'Start date is required' }),
    endDate: z.string().optional(),
    description: z.string().optional(),
    bulletPoints: z.array(z.string()).optional()
  })).min(1, { message: 'At least one work experience is required' }),
  education: z.array(z.object({
    degree: z.string().min(2, { message: 'Degree is required' }),
    institution: z.string().min(2, { message: 'Institution name is required' }),
    location: z.string().optional(),
    graduationDate: z.string().min(2, { message: 'Graduation date is required' }),
    description: z.string().optional(),
    highlights: z.array(z.string()).optional()
  })).min(1, { message: 'At least one education entry is required' }),
  certifications: z.array(z.object({
    name: z.string().min(2, { message: 'Certification name is required' }),
    issuer: z.string().min(2, { message: 'Issuer is required' }),
    date: z.string().min(2, { message: 'Date is required' })
  })).optional(),
  languages: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof formSchema>;

interface CvFormProps {
  onSubmit: (values: FormValues) => void;
  selectedTemplate: CvTemplate | null;
  isSubmitting: boolean;
}

export default function CvForm({ onSubmit, selectedTemplate, isSubmitting }: CvFormProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      profession: '',
      email: '',
      phone: '',
      location: '',
      includeProfilePicture: false,
      profilePicture: '',
      summary: '',
      skills: [''],
      experience: [
        {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          bulletPoints: ['']
        }
      ],
      education: [
        {
          degree: '',
          institution: '',
          location: '',
          graduationDate: '',
          description: '',
          highlights: ['']
        }
      ],
      certifications: [
        {
          name: '',
          issuer: '',
          date: ''
        }
      ],
      languages: ['']
    }
  });

  // Field arrays for repeatable sections
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: 'skills'
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: 'experience'
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education'
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: 'certifications'
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control: form.control,
    name: 'languages'
  });

  // Nested field arrays for bullet points and highlights
  const experienceBulletPoints = experienceFields.map((_, index) => {
    return useFieldArray({
      control: form.control,
      name: `experience.${index}.bulletPoints`
    });
  });

  const educationHighlights = educationFields.map((_, index) => {
    return useFieldArray({
      control: form.control,
      name: `education.${index}.highlights`
    });
  });

  // Handle form submission
  const handleFormSubmit = (values: FormValues) => {
    // Clean up any empty arrays
    const cleanedValues = {
      ...values,
      skills: values.skills.filter(skill => skill.trim()),
      experience: values.experience.map(exp => ({
        ...exp,
        bulletPoints: exp.bulletPoints?.filter(bullet => bullet.trim()) || []
      })),
      education: values.education.map(edu => ({
        ...edu,
        highlights: edu.highlights?.filter(highlight => highlight.trim()) || []
      })),
      certifications: values.certifications?.filter(cert => cert.name.trim()),
      languages: values.languages?.filter(lang => lang.trim())
    };
    onSubmit(cleanedValues);
  };

  // AI-powered content generation
  const generateContent = async () => {
    if (!form.getValues().name || !form.getValues().profession) {
      toast({
        title: "Missing information",
        description: "Please fill in at least your name, profession, some skills, and experiences before generating content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const currentValues = form.getValues();
      const userData = {
        firstName: currentValues.name.split(' ')[0] || '',
        lastName: currentValues.name.split(' ').slice(1).join(' ') || '',
        email: currentValues.email,
        phone: currentValues.phone,
        profession: currentValues.profession,
        summary: currentValues.summary,
        skills: currentValues.skills.filter(skill => skill.trim()),
        experience: currentValues.experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description
        })),
        education: currentValues.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location,
          graduationDate: edu.graduationDate,
          description: edu.description
        })),
        certifications: currentValues.certifications?.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date
        })),
        languages: currentValues.languages?.filter(lang => lang.trim())
      };

      const generatedContent = await generateCvContent(userData);

      // Update form with generated content
      form.setValue('summary', generatedContent.professionalSummary);

      // Update experience bullet points
      generatedContent.experienceDetails.forEach((exp, index) => {
        if (index < currentValues.experience.length) {
          form.setValue(`experience.${index}.bulletPoints`, exp.bulletPoints);
        }
      });

      // Update education highlights
      generatedContent.educationDetails.forEach((edu, index) => {
        if (index < currentValues.education.length) {
          form.setValue(`education.${index}.highlights`, edu.highlights);
        }
      });

      // Update skills with grouped categories
      const allSkills = [
        ...(generatedContent.skillsGrouped.technical || []),
        ...(generatedContent.skillsGrouped.soft || []),
        ...(generatedContent.skillsGrouped.domain || [])
      ];
      
      if (allSkills.length > 0) {
        form.setValue('skills', allSkills);
      }

      toast({
        title: "Content generated",
        description: "Your CV content has been enhanced with AI. Feel free to make any additional edits.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      let errorMessage = "Unable to generate content. Please check your API key and try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "AI Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // AI improvement for a specific text field
  const improveText = async (fieldName: string, currentText: string, context: string) => {
    if (!currentText || currentText.trim().length < 10) {
      toast({
        title: "Text too short",
        description: "Please provide more text to improve.",
        variant: "destructive"
      });
      return;
    }

    setIsImproving({ ...isImproving, [fieldName]: true });
    try {
      const improvedText = await improveCvText(currentText, context);
      
      // Update the form field with improved text
      form.setValue(fieldName as any, improvedText, { shouldValidate: true });
      
      toast({
        title: "Text improved",
        description: "Your text has been enhanced with AI.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error improving text:', error);
      let errorMessage = "Unable to improve text. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "AI Enhancement Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsImproving({ ...isImproving, [fieldName]: false });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              CV Information
              {selectedTemplate && (
                <Badge variant="outline" className="ml-2">
                  Template: {selectedTemplate.name}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Fill in your information to create a professional CV.
              {selectedTemplate && (
                <span className="block mt-1 text-xs">
                  Using the <span className="font-medium capitalize">{selectedTemplate.type}</span> template style.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession / Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+234 567 890 1234" {...field} />
                        </FormControl>
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
                          <Input placeholder="Lagos, Nigeria" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Profile Picture Option */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="includeProfilePicture"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Profile Picture</FormLabel>
                          <FormDescription>
                            Include a professional photo in your CV
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("includeProfilePicture") && (
                    <FormField
                      control={form.control}
                      name="profilePicture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Profile Picture</FormLabel>
                          <FormControl>
                            <Input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    field.onChange(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Please upload a professional portrait photo in JPEG, PNG, or GIF format.
                          </FormDescription>
                          <FormMessage />
                          
                          {field.value && (
                            <div className="mt-2">
                              <div className="rounded-md overflow-hidden w-24 h-24 border">
                                <img 
                                  src={field.value} 
                                  alt="Profile preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="relative">
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Professional Summary</FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => improveText('summary', field.value, 'professional summary')}
                                  disabled={isImproving['summary']}
                                >
                                  {isImproving['summary'] ? (
                                    <div className="flex items-center">
                                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-dashed mr-1"></span>
                                      Enhancing...
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <Sparkles className="h-4 w-4 mr-1" />
                                      Enhance with AI
                                    </div>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Improve this text with AI</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Experienced software engineer with 5+ years in web development..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Skills</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendSkill('')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Skill
                    </Button>
                  </div>
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormField
                        control={form.control}
                        name={`skills.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="e.g. React, Python, Project Management" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 px-2"
                        onClick={() => removeSkill(index)}
                        disabled={skillFields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Work Experience Tab */}
              <TabsContent value="experience" className="space-y-6">
                {experienceFields.map((field, index) => (
                  <Card key={field.id} className="border border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Work Experience {index + 1}</span>
                        {experienceFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeExperience(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`experience.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Software Engineer" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Afrimerge Technologies" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`experience.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Lagos, Nigeria" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input placeholder="Jan 2020" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input placeholder="Present" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Achievements / Responsibilities</FormLabel>
                          <div className="flex items-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 mr-2"
                                    onClick={() => {
                                      const currentExperience = form.getValues(`experience.${index}`);
                                      if (currentExperience.description) {
                                        improveText(
                                          `experience.${index}.description`,
                                          currentExperience.description,
                                          `${currentExperience.title} job description`
                                        );
                                      }
                                    }}
                                    disabled={isImproving[`experience.${index}.description`] || !form.getValues(`experience.${index}.description`)}
                                  >
                                    {isImproving[`experience.${index}.description`] ? (
                                      <div className="flex items-center">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-dashed mr-1"></span>
                                        Enhancing...
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <Sparkles className="h-4 w-4 mr-1" />
                                        Enhance
                                      </div>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Improve this text with AI</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                experienceBulletPoints[index]?.append('');
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Bullet Point
                            </Button>
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`experience.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormControl>
                                <Textarea
                                  placeholder="Overall job description..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {experienceBulletPoints[index]?.fields.map((bulletField, bulletIndex) => (
                          <div key={bulletField.id} className="flex items-center gap-2 mb-2">
                            <FormField
                              control={form.control}
                              name={`experience.${index}.bulletPoints.${bulletIndex}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <div className="flex items-start">
                                      <span className="mr-2 mt-2.5">•</span>
                                      <Textarea
                                        placeholder="Led a team of 5 developers to deliver a new feature..."
                                        className="min-h-[60px]"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-10 px-2 mt-2"
                              onClick={() => experienceBulletPoints[index]?.remove(bulletIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={() => appendExperience({
                      title: '',
                      company: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                      bulletPoints: ['']
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Work Experience
                  </Button>
                </div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="space-y-6">
                {educationFields.map((field, index) => (
                  <Card key={field.id} className="border border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Education {index + 1}</span>
                        {educationFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeEducation(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Degree / Certificate</FormLabel>
                              <FormControl>
                                <Input placeholder="Bachelor of Science in Computer Science" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution</FormLabel>
                              <FormControl>
                                <Input placeholder="University of Lagos" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Lagos, Nigeria" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`education.${index}.graduationDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Graduation Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="May 2018" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`education.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of your studies..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel>Key Highlights</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              educationHighlights[index]?.append('');
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Highlight
                          </Button>
                        </div>
                        
                        {educationHighlights[index]?.fields.map((highlightField, highlightIndex) => (
                          <div key={highlightField.id} className="flex items-center gap-2 mb-2">
                            <FormField
                              control={form.control}
                              name={`education.${index}.highlights.${highlightIndex}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <div className="flex items-start">
                                      <span className="mr-2 mt-2.5">•</span>
                                      <Input
                                        placeholder="Graduated with First Class Honours"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-10 px-2"
                              onClick={() => educationHighlights[index]?.remove(highlightIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={() => appendEducation({
                      degree: '',
                      institution: '',
                      location: '',
                      graduationDate: '',
                      description: '',
                      highlights: ['']
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Education
                  </Button>
                </div>
              </TabsContent>

              {/* Additional Information Tab */}
              <TabsContent value="additional" className="space-y-6">
                <Accordion type="single" collapsible defaultValue="certifications">
                  <AccordionItem value="certifications">
                    <AccordionTrigger>Certifications</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      {certificationFields.map((field, index) => (
                        <div key={field.id} className="mb-4 p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Certification {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => removeCertification(index)}
                              disabled={certificationFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`certifications.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Certificate Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="AWS Certified Solutions Architect" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`certifications.${index}.issuer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Issuing Organization</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Amazon Web Services" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`certifications.${index}.date`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <FormControl>
                                    <Input placeholder="June 2022" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendCertification({
                          name: '',
                          issuer: '',
                          date: ''
                        })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Certification
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="languages">
                    <AccordionTrigger>Languages</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="mb-4">
                        {languageFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2 mb-2">
                            <FormField
                              control={form.control}
                              name={`languages.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="English (Native)" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-10 px-2"
                              onClick={() => removeLanguage(index)}
                              disabled={languageFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendLanguage('')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Language
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t p-4 bg-muted/20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={generateContent}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-dashed border-current"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enhance your CV with AI-generated content based on your information</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  // Navigate through tabs
                  const tabs = ["personal", "experience", "education", "additional"];
                  const currentIndex = tabs.indexOf(activeTab);
                  
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={activeTab === "personal"}
              >
                Previous
              </Button>
              
              {activeTab !== "additional" ? (
                <Button 
                  type="button" 
                  variant="default"
                  onClick={() => {
                    // Navigate through tabs
                    const tabs = ["personal", "experience", "education", "additional"];
                    const currentIndex = tabs.indexOf(activeTab);
                    
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedTemplate}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-dashed border-current"></div>
                      <span>Generating CV...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Generate CV</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}