import { storage } from "../storage";

async function addCvTemplates() {
  console.log("Adding CV templates...");
  
  try {
    // Get existing templates
    const existingTemplates = await storage.getAllCvTemplates();
    console.log(`Found ${existingTemplates.length} existing CV templates`);
    
    // Define new templates to add
    const newTemplates = [
      {
        name: "Elegant Resume",
        description: "A clean and elegant CV layout with professional styling",
        thumbnailUrl: "/src/assets/cv-templates/elegant_cv_template_thumbnail.png",
        type: "professional",
        structure: {
          sections: [
            "header",
            "summary",
            "skills",
            "experience",
            "education",
            "languages",
            "achievements"
          ],
          layout: "standard"
        }
      },
      {
        name: "Scientific CV",
        description: "Perfect for academic and research positions",
        thumbnailUrl: "/src/assets/cv-templates/scientific-template.png",
        type: "academic",
        structure: {
          sections: [
            "header",
            "research_interests",
            "education",
            "publications",
            "research_experience",
            "teaching_experience",
            "skills",
            "references"
          ],
          layout: "academic"
        }
      },
      {
        name: "Skills-Based CV",
        description: "Highlights your competencies with a visual skill rating system",
        thumbnailUrl: "/src/assets/cv-templates/skill-based-cv-template.png",
        type: "modern",
        structure: {
          sections: [
            "header",
            "profile",
            "skills_visual",
            "experience",
            "education",
            "certifications",
            "references"
          ],
          layout: "skills-focused"
        }
      },
      {
        name: "Creative Portfolio",
        description: "Perfect for creative professionals with a unique layout",
        thumbnailUrl: "/src/assets/cv-templates/creative-cv-template.jpeg",
        type: "creative",
        structure: {
          sections: [
            "header",
            "profile",
            "portfolio",
            "skills",
            "experience",
            "education",
            "awards"
          ],
          layout: "portfolio"
        }
      },
      {
        name: "Professional Executive",
        description: "Ideal for senior management and executive positions",
        thumbnailUrl: "/src/assets/cv-templates/professional-cv-template.jpeg",
        type: "professional",
        structure: {
          sections: [
            "header",
            "executive_summary",
            "core_competencies",
            "professional_experience",
            "education",
            "certifications",
            "board_memberships"
          ],
          layout: "executive"
        }
      },
      {
        name: "Modern Clean",
        description: "A contemporary design with clean lines and visual organization",
        thumbnailUrl: "/src/assets/cv-templates/modern-cv-template.jpeg",
        type: "modern",
        structure: {
          sections: [
            "header",
            "profile",
            "experience",
            "education",
            "skills",
            "projects",
            "interests"
          ],
          layout: "clean"
        }
      },
      {
        name: "Minimalist Resume",
        description: "A simplified, elegant design focusing on essential information",
        thumbnailUrl: "/src/assets/cv-templates/minimalist-cv-template.jpeg",
        type: "minimalist",
        structure: {
          sections: [
            "header",
            "summary",
            "experience",
            "education",
            "skills",
            "references"
          ],
          layout: "minimal"
        }
      },
      {
        name: "Corporate Professional",
        description: "Designed for corporate roles with a traditional structure",
        thumbnailUrl: "/src/assets/cv-templates/corporate-cv-template.jpeg",
        type: "professional",
        structure: {
          sections: [
            "header",
            "professional_summary",
            "key_skills",
            "work_experience",
            "education",
            "certifications",
            "professional_affiliations"
          ],
          layout: "corporate"
        }
      },
      {
        name: "Technical Specialist",
        description: "Focused on technical skills and project experience",
        thumbnailUrl: "/src/assets/cv-templates/technical-cv-template.jpeg",
        type: "professional",
        structure: {
          sections: [
            "header",
            "technical_profile",
            "technical_skills",
            "projects",
            "work_experience",
            "education",
            "certifications"
          ],
          layout: "technical"
        }
      },
      {
        name: "Executive Leadership",
        description: "Emphasizes leadership experience and achievements",
        thumbnailUrl: "/src/assets/cv-templates/executive-cv-template.jpeg",
        type: "professional",
        structure: {
          sections: [
            "header",
            "leadership_profile",
            "core_competencies",
            "executive_experience",
            "achievements",
            "education",
            "board_positions"
          ],
          layout: "leadership"
        }
      }
    ];
    
    // Add each template
    for (const template of newTemplates) {
      // Check if a template with the same name already exists
      const exists = existingTemplates.some(t => t.name === template.name);
      
      if (!exists) {
        const result = await storage.createCvTemplate(template);
        console.log(`Added template: ${result.name} (ID: ${result.id})`);
      } else {
        console.log(`Template "${template.name}" already exists. Skipping.`);
      }
    }
    
    console.log("CV template addition completed.");
  } catch (error) {
    console.error("Error adding CV templates:", error);
  }
}

// Run the script
addCvTemplates();