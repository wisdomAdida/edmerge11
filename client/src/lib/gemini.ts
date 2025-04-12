import { studentLevelEnum } from "@shared/schema";
type StudentLevel = typeof studentLevelEnum.enumValues[number];

/**
 * Advanced AI Tutor powered by Google's Gemini API
 * This implementation makes actual API calls to Google's Gemini AI model
 * with educational context for intelligent tutoring
 */

// Learning context for the AI to understand different educational concepts by level
const educationalContext = {
  primary: {
    prefix: "I am an AI tutor for primary school students (ages 6-11). I need to explain the following concept in simple, engaging terms with basic vocabulary and relatable examples: ",
    suffix: "\n\nPlease make your explanation friendly, use short sentences, include colorful examples, and avoid complex terminology. Respond as if speaking directly to a child who is curious and learning.",
    format: "- Start with a simple definition\n- Use very simple analogies\n- Include 2-3 everyday examples they can relate to\n- Add a fun fact if relevant\n- Suggest a simple hands-on activity to understand the concept"
  },
  secondary: {
    prefix: "I am an AI tutor for secondary school students (ages 12-18). I need to explain the following concept with appropriate academic depth while keeping it accessible: ",
    suffix: "\n\nPlease provide an explanation that introduces subject-specific terminology with definitions, includes relevant examples, and connects to the curriculum.",
    format: "- Give a clear definition with key terminology\n- Explain underlying principles\n- Provide 2-3 relevant examples of increasing complexity\n- Include a brief historical context if relevant\n- Connect to related concepts they might be studying\n- Suggest a practical application or project"
  },
  tertiary: {
    prefix: "I am an AI tutor for university students. I need to explain the following concept with academic rigor and depth: ",
    suffix: "\n\nPlease provide a comprehensive explanation that incorporates relevant theories, methodologies, critical analysis, and current research.",
    format: "- Begin with a precise academic definition\n- Explain theoretical frameworks\n- Discuss methodological approaches\n- Address any scholarly debates or alternative perspectives\n- Cite relevant research or key figures in the field\n- Connect to broader academic discourse\n- Suggest resources for further exploration"
  },
  individual: {
    prefix: "I am an AI tutor for adult independent learners. I need to explain the following concept with practical relevance and broad context: ",
    suffix: "\n\nPlease provide a balanced explanation that combines theoretical understanding with practical applications, connecting to real-world contexts.",
    format: "- Start with a clear conceptual overview\n- Explain key principles in accessible language\n- Provide real-world applications and examples\n- Connect to current trends or developments\n- Include interdisciplinary perspectives where relevant\n- Suggest practical ways to apply this knowledge\n- Recommend resources for deeper learning"
  }
};

// Subject-specific prompting to enhance educational value
const subjectContexts = {
  mathematics: {
    prompt: "This is a mathematics question. Include step-by-step working, formulas where appropriate, and visual representations when helpful.",
    keywords: ["math", "algebra", "geometry", "calculus", "equation", "formula", "number", "theorem", "proof", "function"]
  },
  science: {
    prompt: "This is a science question. Include scientific principles, experimental evidence, and real-world applications.",
    keywords: ["physics", "chemistry", "biology", "scientific", "experiment", "hypothesis", "theory", "molecule", "cell", "energy", "force"]
  },
  literature: {
    prompt: "This is a literature/language question. Include textual analysis, historical context, and appropriate literary terminology.",
    keywords: ["book", "novel", "poem", "author", "character", "plot", "theme", "essay", "writing", "language", "grammar"]
  },
  history: {
    prompt: "This is a history question. Include chronology, historical context, multiple perspectives, and evaluation of historical significance.",
    keywords: ["history", "war", "revolution", "century", "ancient", "medieval", "modern", "civilization", "empire", "historical"]
  },
  computerScience: {
    prompt: "This is a computer science question. Include technical details, code examples if relevant, and practical implementations.",
    keywords: ["programming", "code", "algorithm", "computer", "software", "hardware", "database", "network", "internet", "web"]
  }
};

/**
 * Detects which subject domain the question belongs to
 * @param question The user's question
 * @returns The identified subject context or undefined
 */
function detectSubject(question: string): string | undefined {
  const normalizedQuestion = question.toLowerCase();
  
  for (const [subject, context] of Object.entries(subjectContexts)) {
    if (context.keywords.some(keyword => normalizedQuestion.includes(keyword))) {
      return subject;
    }
  }
  
  return undefined;
}

/**
 * Creates an optimized prompt for the Gemini AI to generate educationally appropriate responses
 */
function createEducationalPrompt(question: string, studentLevel: StudentLevel | string): string {
  // Get the appropriate educational context
  const context = educationalContext[studentLevel as StudentLevel] || educationalContext.secondary;
  
  // Detect subject area
  const subject = detectSubject(question);
  const subjectPrompt = subject ? subjectContexts[subject as keyof typeof subjectContexts].prompt : "";
  
  // Construct the complete educational prompt
  return `${context.prefix}${question}

${subjectPrompt}

When answering, please follow this format:
${context.format}

${context.suffix}`;
}

/**
 * Asks the Gemini AI model a question with educational context
 * @param question The user's question
 * @param studentLevel The education level of the student
 * @returns A promise that resolves to the AI's response
 */
export async function askGemini(question: string, studentLevel: StudentLevel | string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Check if the API key exists
  if (!apiKey || apiKey.length === 0) {
    throw new Error("Gemini API key is not configured");
  }
  
  console.log(`[Gemini API] Asked: ${question}, Student Level: ${studentLevel}`);
  
  // Create the educational prompt
  const prompt = createEducationalPrompt(question, studentLevel);
  
  try {
    // Make the API call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });
    
    const data = await response.json();
    
    // Extract the text from the Gemini API response
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      // If there's an API error
      console.error("Gemini API error:", data.error);
      throw new Error(data.error.message || "Error from Gemini API");
    } else {
      // If the response structure is not as expected
      console.error("Unexpected Gemini API response format:", data);
      throw new Error("Unexpected API response format");
    }
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    throw error;
  }
}

/**
 * Generate personalized learning recommendations based on student level and interests
 * @param studentLevel The education level of the student
 * @param interests Array of student interests
 * @returns A promise that resolves to personalized recommendations
 */
export async function getPersonalizedRecommendations(
  studentLevel: StudentLevel | string,
  interests: string[]
): Promise<any> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length === 0) {
    throw new Error("Gemini API key is not configured");
  }
  
  const interestsText = interests.join(", ");
  const prompt = `I need personalized learning recommendations for a ${studentLevel} level student interested in ${interestsText}.
  
Please generate:
1. Three recommended topics to explore based on these interests
2. A custom learning path with 5 steps to master one of these topics
3. Three specific resources they might find helpful (books, websites, or tools)
4. Two potential project ideas that align with their interests

Format the response as structured JSON without any additional explanation text. Use this exact format:
{
  "recommendedTopics": ["topic1", "topic2", "topic3"],
  "learningPath": {
    "topic": "main topic name",
    "steps": [
      {"title": "Step 1", "description": "brief description"},
      {"title": "Step 2", "description": "brief description"},
      {"title": "Step 3", "description": "brief description"},
      {"title": "Step 4", "description": "brief description"},
      {"title": "Step 5", "description": "brief description"}
    ]
  },
  "resources": [
    {"name": "resource1", "type": "book/website/tool", "description": "brief description"},
    {"name": "resource2", "type": "book/website/tool", "description": "brief description"},
    {"name": "resource3", "type": "book/website/tool", "description": "brief description"}
  ],
  "projectIdeas": [
    {"title": "project1", "description": "brief description", "difficulty": "beginner/intermediate/advanced"},
    {"title": "project2", "description": "brief description", "difficulty": "beginner/intermediate/advanced"}
  ]
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      const jsonText = data.candidates[0].content.parts[0].text;
      // Find JSON content (remove markdown formatting if present)
      const jsonMatch = jsonText.match(/```json\n([\s\S]*)\n```/) || jsonText.match(/```\n([\s\S]*)\n```/) || [null, jsonText];
      const cleanJson = jsonMatch[1] || jsonText;
      
      return JSON.parse(cleanJson);
    } else {
      throw new Error("Failed to generate recommendations");
    }
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
}

/**
 * Generates professional CV content using AI
 * @param userData User profile and work experience data
 * @returns A promise that resolves to the generated CV content
 */
export async function generateCvContent(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    graduationDate: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  languages?: string[];
}): Promise<{
  professionalSummary: string;
  experienceDetails: Array<{
    bulletPoints: string[];
  }>;
  skillsGrouped: {
    technical?: string[];
    soft?: string[];
    domain?: string[];
  };
  educationDetails: Array<{
    highlights: string[];
  }>;
}> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length === 0) {
    throw new Error("Gemini API key is not configured");
  }
  
  // Create a prompt for CV generation
  const prompt = `I need help creating professional CV content based on the following information:

Full Name: ${userData.firstName} ${userData.lastName}
Email: ${userData.email}
Phone: ${userData.phone}
Profession: ${userData.profession}
${userData.summary ? `Current Summary: ${userData.summary}` : ''}

Skills: ${userData.skills.join(', ')}

Professional Experience:
${userData.experience.map(exp => `
- ${exp.title} at ${exp.company}${exp.location ? `, ${exp.location}` : ''}
  ${exp.startDate} - ${exp.endDate || 'Present'}
  ${exp.description || ''}
`).join('')}

Education:
${userData.education.map(edu => `
- ${edu.degree} from ${edu.institution}${edu.location ? `, ${edu.location}` : ''}
  Graduated: ${edu.graduationDate}
  ${edu.description || ''}
`).join('')}

${userData.certifications && userData.certifications.length > 0 ? `
Certifications:
${userData.certifications.map(cert => `- ${cert.name} from ${cert.issuer}, ${cert.date}`).join('\n')}
` : ''}

${userData.languages && userData.languages.length > 0 ? `Languages: ${userData.languages.join(', ')}` : ''}

Based on this information, please generate:

1. A compelling professional summary paragraph (3-4 sentences) that highlights key strengths and experience.

2. For each work experience, provide 3-5 achievement-oriented bullet points that demonstrate impact and skills.

3. Group the skills into relevant categories (technical, soft skills, domain knowledge).

4. For each education entry, provide 1-2 relevant highlights.

Format the response as structured JSON without any additional explanation text. Use this exact format:
{
  "professionalSummary": "string with professional summary paragraph",
  "experienceDetails": [
    {
      "bulletPoints": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4", "bullet point 5"]
    },
    {
      "bulletPoints": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4", "bullet point 5"]
    }
  ],
  "skillsGrouped": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2"],
    "domain": ["skill1", "skill2"]
  },
  "educationDetails": [
    {
      "highlights": ["highlight 1", "highlight 2"]
    },
    {
      "highlights": ["highlight 1", "highlight 2"]
    }
  ]
}

Make sure all content is professional, achievement-focused, and uses power verbs. Focus on quantifiable achievements where possible.`;

  try {
    // Check if API key is valid (not just if it exists)
    if (apiKey.trim() === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === 'VITE_GEMINI_API_KEY') {
      throw new Error("Please provide a valid Gemini API key. Current key appears to be a placeholder.");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `API returned error status: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const jsonText = data.candidates[0].content.parts[0].text;
        // Find JSON content (remove markdown formatting if present)
        const jsonMatch = jsonText.match(/```json\n([\s\S]*)\n```/) || jsonText.match(/```\n([\s\S]*)\n```/) || [null, jsonText];
        const cleanJson = jsonMatch[1] || jsonText;
        
        try {
          return JSON.parse(cleanJson);
        } catch (parseError) {
          console.error("Failed to parse JSON from API response:", cleanJson);
          throw new Error("The AI generated invalid JSON. Please try again or enter content manually.");
        }
      } else if (data.error) {
        console.error("Gemini API error:", data.error);
        throw new Error(data.error.message || "Error from Gemini API");
      } else {
        console.error("Unexpected Gemini API response format:", data);
        throw new Error("Unexpected API response format. Check console for details.");
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error("API request timed out. Please try again or check your internet connection.");
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error generating CV content:", error);
    throw error;
  }
}

/**
 * Improves a professional summary or experience description with AI
 * @param text The original text to improve
 * @param context Additional context (e.g., job title, industry, etc.)
 * @returns A promise that resolves to the improved text
 */
export async function improveCvText(text: string, context: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length === 0) {
    throw new Error("Gemini API key is not configured");
  }
  
  // Create a prompt for text improvement
  const prompt = `Please improve the following ${context} for a professional CV:

TEXT: ${text}

Please enhance this text to make it:
1. More professional and impactful
2. Achievement-oriented with quantifiable results when possible
3. Clear and concise with strong action verbs
4. Tailored to highlight transferable skills

Return only the improved text without any explanations or formatting.`;

  try {
    // Check if API key is valid (not just if it exists)
    if (apiKey.trim() === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === 'VITE_GEMINI_API_KEY') {
      throw new Error("Please provide a valid Gemini API key. Current key appears to be a placeholder.");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `API returned error status: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        return data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        console.error("Gemini API error:", data.error);
        throw new Error(data.error.message || "Error from Gemini API");
      } else {
        console.error("Unexpected Gemini API response format:", data);
        throw new Error("Unexpected API response format. Check console for details.");
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error("API request timed out. Please try again or check your internet connection.");
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error improving CV text:", error);
    throw error;
  }
}

/**
 * Suggests improvements for a CV based on a job posting
 * @param cvData Current CV data
 * @param jobDescription The job description text
 * @returns A promise that resolves to tailored suggestions
 */
export async function tailorCvForJob(
  cvData: {
    summary: string;
    skills: string[];
    experienceDescriptions: string[];
  }, 
  jobDescription: string
): Promise<{
  suggestions: string[];
  keywordsToAdd: string[];
  skillsGaps: string[];
  tailoredSummary: string;
}> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length === 0) {
    throw new Error("Gemini API key is not configured");
  }
  
  // Create a prompt for CV tailoring
  const prompt = `I need to tailor my CV for a specific job. Please analyze my CV content and the job description to provide tailoring suggestions.

MY CURRENT CV:
Summary: ${cvData.summary}

Skills: ${cvData.skills.join(', ')}

Experience descriptions:
${cvData.experienceDescriptions.map((desc, index) => `${index + 1}. ${desc}`).join('\n')}

JOB DESCRIPTION:
${jobDescription}

Please analyze both and provide:
1. 3-5 specific suggestions to better align my CV with this job
2. Key keywords from the job description that I should add to my CV
3. Any skill gaps I should address
4. A rewritten summary tailored specifically for this position

Format the response as structured JSON without any additional explanation text. Use this exact format:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"],
  "keywordsToAdd": ["keyword 1", "keyword 2", "keyword 3", "keyword 4"],
  "skillsGaps": ["skill 1", "skill 2", "skill 3"],
  "tailoredSummary": "Rewritten summary tailored for this specific job"
}`;

  try {
    // Check if API key is valid (not just if it exists)
    if (apiKey.trim() === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === 'VITE_GEMINI_API_KEY') {
      throw new Error("Please provide a valid Gemini API key. Current key appears to be a placeholder.");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `API returned error status: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        
        const jsonText = data.candidates[0].content.parts[0].text;
        // Find JSON content (remove markdown formatting if present)
        const jsonMatch = jsonText.match(/```json\n([\s\S]*)\n```/) || jsonText.match(/```\n([\s\S]*)\n```/) || [null, jsonText];
        const cleanJson = jsonMatch[1] || jsonText;
        
        try {
          return JSON.parse(cleanJson);
        } catch (parseError) {
          console.error("Failed to parse JSON from API response:", cleanJson);
          throw new Error("The AI generated invalid JSON. Please try again or enter content manually.");
        }
      } else if (data.error) {
        console.error("Gemini API error:", data.error);
        throw new Error(data.error.message || "Error from Gemini API");
      } else {
        console.error("Unexpected Gemini API response format:", data);
        throw new Error("Unexpected API response format. Check console for details.");
      }
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error("API request timed out. Please try again or check your internet connection.");
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error tailoring CV:", error);
    throw error;
  }
}

/**
 * Checks if the Gemini API key is configured and tests if it's valid
 * @returns A promise that resolves to a boolean indicating if the API key is configured and valid
 */
export async function isGeminiConfigured(): Promise<boolean> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Return false if the API key is not defined or empty
  if (!apiKey || apiKey.length === 0) {
    return false;
  }
  
  try {
    // Make a simple API call to test the key
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "hello"
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 10,
        }
      })
    });
    
    const data = await response.json();
    
    // Check if the response contains expected fields indicating a valid API key
    return !data.error;
  } catch (error) {
    console.error("Error testing Gemini API key:", error);
    return false;
  }
}