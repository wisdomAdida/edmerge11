import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CvTemplate, UserCv } from '@shared/schema';

/**
 * Generates a PDF from CV data
 * @param cv The CV data
 * @param template The template to use
 * @returns PDF data URL that can be used for download or preview
 */
export const generateCvPdf = async (
  cv: UserCv, 
  template: CvTemplate
): Promise<string> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Extract content from CV
  const content = cv.content as any;
  
  // Different rendering based on template type
  switch(template.type) {
    case 'classic':
      await renderClassicTemplate(doc, content, template);
      break;
    case 'modern':
      await renderModernTemplate(doc, content, template);
      break;
    case 'creative':
      await renderCreativeTemplate(doc, content, template);
      break;
    case 'professional':
      await renderProfessionalTemplate(doc, content, template);
      break;
    case 'academic':
      await renderAcademicTemplate(doc, content, template);
      break;
    case 'minimalist':
    default:
      await renderMinimalistTemplate(doc, content, template);
      break;
  }
  
  // Return the PDF as a data URL
  return doc.output('dataurlstring');
};

/**
 * Renders CV content using the Classic template
 */
const renderClassicTemplate = async (
  doc: jsPDF, 
  content: any, 
  template: CvTemplate
) => {
  const { name, profession, contact, summary, experience, education, skills, certifications, languages } = content;
  
  // Colors
  const primaryColor = '#2c3e50';
  const secondaryColor = '#3498db';
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text(name, 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(profession, 105, 25, { align: 'center' });
  
  // Contact information
  doc.setFontSize(10);
  if (contact.email) {
    doc.text(`Email: ${contact.email}`, 105, 33, { align: 'center' });
  }
  if (contact.phone) {
    doc.text(`Phone: ${contact.phone}`, 40, 33, { align: 'left' });
  }
  if (contact.location) {
    doc.text(`Location: ${contact.location}`, 170, 33, { align: 'right' });
  }
  
  // Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFESSIONAL SUMMARY', 15, 50);
  
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(summary, 180);
  doc.text(splitSummary, 15, 58);
  
  let currentY = 58 + (splitSummary.length * 5);
  
  // Experience
  doc.setDrawColor(secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('WORK EXPERIENCE', 15, currentY);
  currentY += 8;
  
  experience.forEach((exp: any) => {
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title, 15, currentY);
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}, ${exp.location}`, 15, currentY + 5);
    doc.setFontSize(10);
    doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 15, currentY + 10);
    doc.setFontSize(12);
    
    // Bullet points
    doc.setFont('helvetica', 'normal');
    currentY += 15;
    
    exp.bulletPoints.forEach((bullet: string) => {
      doc.text('•', 15, currentY);
      const splitBullet = doc.splitTextToSize(bullet, 170);
      doc.text(splitBullet, 20, currentY);
      currentY += splitBullet.length * 5 + 1;
    });
    
    currentY += 5;
  });
  
  // Education
  doc.setDrawColor(secondaryColor);
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION', 15, currentY);
  currentY += 8;
  
  education.forEach((edu: any) => {
    doc.setFont('helvetica', 'bold');
    doc.text(edu.degree, 15, currentY);
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.institution}, ${edu.location}`, 15, currentY + 5);
    doc.setFontSize(10);
    doc.text(`Graduated: ${edu.graduationDate}`, 15, currentY + 10);
    doc.setFontSize(12);
    
    // Highlights
    doc.setFont('helvetica', 'normal');
    currentY += 15;
    
    if (edu.highlights) {
      edu.highlights.forEach((highlight: string) => {
        doc.text('•', 15, currentY);
        const splitHighlight = doc.splitTextToSize(highlight, 170);
        doc.text(splitHighlight, 20, currentY);
        currentY += splitHighlight.length * 5 + 1;
      });
    }
    
    currentY += 5;
  });
  
  // Add a new page if needed
  if (currentY > 270) {
    doc.addPage();
    currentY = 20;
  }
  
  // Skills
  doc.setDrawColor(secondaryColor);
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('SKILLS', 15, currentY);
  currentY += 8;
  
  if (skills.technical) {
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Skills:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    const technicalSkills = skills.technical.join(', ');
    const splitTechnical = doc.splitTextToSize(technicalSkills, 170);
    doc.text(splitTechnical, 25, currentY + 5);
    currentY += splitTechnical.length * 5 + 10;
  }
  
  if (skills.soft) {
    doc.setFont('helvetica', 'bold');
    doc.text('Soft Skills:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    const softSkills = skills.soft.join(', ');
    const splitSoft = doc.splitTextToSize(softSkills, 170);
    doc.text(splitSoft, 25, currentY + 5);
    currentY += splitSoft.length * 5 + 10;
  }
  
  if (skills.domain) {
    doc.setFont('helvetica', 'bold');
    doc.text('Domain Knowledge:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    const domainSkills = skills.domain.join(', ');
    const splitDomain = doc.splitTextToSize(domainSkills, 170);
    doc.text(splitDomain, 25, currentY + 5);
    currentY += splitDomain.length * 5 + 10;
  }
  
  // Certifications
  if (certifications && certifications.length > 0) {
    doc.setDrawColor(secondaryColor);
    doc.line(15, currentY + 2, 195, currentY + 2);
    
    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS', 15, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    certifications.forEach((cert: any) => {
      doc.text(`• ${cert.name} - ${cert.issuer} (${cert.date})`, 15, currentY);
      currentY += 5;
    });
    
    currentY += 5;
  }
  
  // Languages
  if (languages && languages.length > 0) {
    doc.setDrawColor(secondaryColor);
    doc.line(15, currentY + 2, 195, currentY + 2);
    
    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('LANGUAGES', 15, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(languages.join(', '), 15, currentY);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated with EdMerge CV Generator', 105, 290, { align: 'center' });
};

/**
 * Renders CV content using the Modern template
 */
const renderModernTemplate = async (
  doc: jsPDF, 
  content: any, 
  template: CvTemplate
) => {
  const { name, profession, contact, summary, experience, education, skills, certifications, languages } = content;
  
  // Colors
  const primaryColor = '#16a085';
  const accentColor = '#1abc9c';
  
  // Left sidebar
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 60, 297, 'F');
  
  // Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), 30, 25, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(profession, 30, 33, { align: 'center' });
  
  // Contact info in sidebar
  doc.setFontSize(10);
  doc.text('CONTACT', 30, 50, { align: 'center' });
  doc.setFontSize(8);
  doc.setLineWidth(0.5);
  doc.setDrawColor(255, 255, 255);
  doc.line(15, 55, 45, 55);
  
  let sidebarY = 65;
  
  if (contact.email) {
    doc.text('Email', 15, sidebarY);
    doc.text(contact.email, 15, sidebarY + 5, { maxWidth: 40 });
    sidebarY += 15;
  }
  
  if (contact.phone) {
    doc.text('Phone', 15, sidebarY);
    doc.text(contact.phone, 15, sidebarY + 5);
    sidebarY += 15;
  }
  
  if (contact.location) {
    doc.text('Location', 15, sidebarY);
    doc.text(contact.location, 15, sidebarY + 5, { maxWidth: 40 });
    sidebarY += 15;
  }
  
  // Skills in sidebar
  sidebarY += 10;
  doc.setFontSize(10);
  doc.text('SKILLS', 30, sidebarY, { align: 'center' });
  doc.setFontSize(8);
  doc.line(15, sidebarY + 5, 45, sidebarY + 5);
  sidebarY += 15;
  
  if (skills.technical) {
    doc.text('Technical', 15, sidebarY);
    sidebarY += 5;
    skills.technical.forEach((skill: string) => {
      doc.text('• ' + skill, 15, sidebarY, { maxWidth: 40 });
      sidebarY += 5;
    });
    sidebarY += 5;
  }
  
  if (skills.soft) {
    doc.text('Soft Skills', 15, sidebarY);
    sidebarY += 5;
    skills.soft.forEach((skill: string) => {
      doc.text('• ' + skill, 15, sidebarY, { maxWidth: 40 });
      sidebarY += 5;
    });
    sidebarY += 5;
  }
  
  // Languages in sidebar
  if (languages && languages.length > 0) {
    sidebarY += 5;
    doc.text('LANGUAGES', 30, sidebarY, { align: 'center' });
    doc.line(15, sidebarY + 5, 45, sidebarY + 5);
    sidebarY += 15;
    
    languages.forEach((language: string) => {
      doc.text('• ' + language, 15, sidebarY);
      sidebarY += 5;
    });
  }
  
  // Main content area
  doc.setTextColor(0, 0, 0);
  let mainY = 25;
  
  // Professional Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFESSIONAL SUMMARY', 70, mainY);
  mainY += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(summary, 130);
  doc.text(splitSummary, 70, mainY);
  mainY += splitSummary.length * 5 + 10;
  
  // Experience
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('WORK EXPERIENCE', 70, mainY);
  mainY += 8;
  
  experience.forEach((exp: any) => {
    doc.setFillColor(accentColor);
    doc.rect(70, mainY, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title, 78, mainY + 3);
    mainY += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}, ${exp.location}`, 78, mainY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 170, mainY, { align: 'right' });
    mainY += 6;
    
    // Bullet points
    exp.bulletPoints.forEach((bullet: string) => {
      doc.text('•', 78, mainY);
      const splitBullet = doc.splitTextToSize(bullet, 110);
      doc.text(splitBullet, 82, mainY);
      mainY += splitBullet.length * 5 + 1;
    });
    
    mainY += 5;
  });
  
  // Education
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION', 70, mainY);
  mainY += 8;
  
  education.forEach((edu: any) => {
    doc.setFillColor(accentColor);
    doc.rect(70, mainY, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.degree, 78, mainY + 3);
    mainY += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.institution}, ${edu.location}`, 78, mainY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Graduated: ${edu.graduationDate}`, 170, mainY, { align: 'right' });
    mainY += 6;
    
    // Highlights
    if (edu.highlights) {
      edu.highlights.forEach((highlight: string) => {
        doc.text('•', 78, mainY);
        const splitHighlight = doc.splitTextToSize(highlight, 110);
        doc.text(splitHighlight, 82, mainY);
        mainY += splitHighlight.length * 5 + 1;
      });
    }
    
    mainY += 5;
  });
  
  // Certifications
  if (certifications && certifications.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS', 70, mainY);
    mainY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    certifications.forEach((cert: any) => {
      doc.setFillColor(accentColor);
      doc.rect(70, mainY, 3, 3, 'F');
      doc.text(`${cert.name} - ${cert.issuer} (${cert.date})`, 78, mainY + 3);
      mainY += 8;
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated with EdMerge CV Generator', 135, 290, { align: 'center' });
};

/**
 * Renders CV content using the Creative template
 */
const renderCreativeTemplate = async (
  doc: jsPDF, 
  content: any, 
  template: CvTemplate
) => {
  const { name, profession, contact, summary, experience, education, skills, certifications, languages } = content;
  
  // Colors
  const primaryColor = '#9b59b6';
  const accentColor = '#8e44ad';
  
  // Header with graphic element
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add creative design element
  doc.setFillColor(accentColor);
  doc.rect(0, 30, 70, 20, 'F');
  doc.rect(140, 30, 70, 20, 'F');
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), 105, 22, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(profession, 105, 32, { align: 'center' });
  
  // Contact information
  let contactY = 60;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  
  // Layout contact info in a creative horizontal format
  if (contact.email) {
    doc.text('Email: ' + contact.email, 20, contactY);
  }
  
  if (contact.phone) {
    doc.text('Phone: ' + contact.phone, 105, contactY);
  }
  
  if (contact.location) {
    doc.text('Location: ' + contact.location, 170, contactY, { align: 'right' });
  }
  
  contactY += 10;
  
  // Creative divider
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(1);
  for (let i = 0; i < 6; i++) {
    doc.line(15 + (i * 30), contactY, 35 + (i * 30), contactY);
  }
  
  let currentY = contactY + 10;
  
  // Professional summary with creative border
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, currentY, 180, 25, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFESSIONAL SUMMARY', 105, currentY + 8, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(summary, 170);
  doc.text(splitSummary, 105, currentY + 16, { align: 'center' });
  
  currentY += 35;
  
  // Main content with multi-column layout
  
  // Left column - Experience
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPERIENCE', 55, currentY, { align: 'center' });
  
  currentY += 8;
  let leftColY = currentY;
  
  experience.forEach((exp: any, index: number) => {
    // Prevent overflow to next page
    if (leftColY > 250 && index < experience.length - 1) {
      doc.addPage();
      leftColY = 20;
    }
    
    // Creative timeline element
    doc.setFillColor(primaryColor);
    doc.circle(15, leftColY, 3, 'F');
    doc.setLineWidth(0.5);
    doc.line(15, leftColY + 3, 15, leftColY + 20);
    
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title, 25, leftColY);
    
    doc.setFontSize(10);
    doc.setTextColor(accentColor);
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}, ${exp.location}`, 25, leftColY + 5);
    
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 25, leftColY + 10);
    
    // Bullet points
    doc.setTextColor(0, 0, 0);
    let bulletY = leftColY + 15;
    
    exp.bulletPoints.forEach((bullet: string) => {
      doc.text('•', 20, bulletY);
      const splitBullet = doc.splitTextToSize(bullet, 80);
      doc.text(splitBullet, 25, bulletY);
      bulletY += splitBullet.length * 5;
    });
    
    leftColY = bulletY + 10;
  });
  
  // Right column - Education & Skills
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION', 150, currentY, { align: 'center' });
  
  currentY += 8;
  let rightColY = currentY;
  
  education.forEach((edu: any) => {
    // Creative timeline element
    doc.setFillColor(primaryColor);
    doc.circle(110, rightColY, 3, 'F');
    doc.setLineWidth(0.5);
    doc.line(110, rightColY + 3, 110, rightColY + 20);
    
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.degree, 120, rightColY);
    
    doc.setFontSize(10);
    doc.setTextColor(accentColor);
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.institution}, ${edu.location}`, 120, rightColY + 5);
    
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Graduated: ${edu.graduationDate}`, 120, rightColY + 10);
    
    // Highlights
    doc.setTextColor(0, 0, 0);
    let highY = rightColY + 15;
    
    if (edu.highlights) {
      edu.highlights.forEach((highlight: string) => {
        doc.text('•', 115, highY);
        const splitHighlight = doc.splitTextToSize(highlight, 80);
        doc.text(splitHighlight, 120, highY);
        highY += splitHighlight.length * 5;
      });
    }
    
    rightColY = highY + 10;
  });
  
  // Skills section
  rightColY += 5;
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('SKILLS', 150, rightColY, { align: 'center' });
  rightColY += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  if (skills.technical) {
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Skills:', 120, rightColY);
    rightColY += 5;
    
    doc.setFont('helvetica', 'normal');
    skills.technical.forEach((skill: string, index: number) => {
      // Create a pill-shaped design for each skill
      const textWidth = doc.getTextWidth(skill) + 6;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(120 + ((index % 2) * 45), rightColY, textWidth, 6, 3, 3, 'F');
      doc.text(skill, 123 + ((index % 2) * 45), rightColY + 4);
      
      if (index % 2 === 1) rightColY += 8;
    });
    if (skills.technical.length % 2 === 1) rightColY += 8;
    rightColY += 5;
  }
  
  if (skills.soft) {
    doc.setFont('helvetica', 'bold');
    doc.text('Soft Skills:', 120, rightColY);
    rightColY += 5;
    
    doc.setFont('helvetica', 'normal');
    const softSkills = skills.soft.join(', ');
    const splitSoft = doc.splitTextToSize(softSkills, 80);
    doc.text(splitSoft, 120, rightColY);
    rightColY += splitSoft.length * 5 + 8;
  }
  
  // Add certifications and languages at the bottom
  let maxY = Math.max(leftColY, rightColY) + 10;
  
  // Check if we need a new page
  if (maxY > 250) {
    doc.addPage();
    maxY = 20;
  }
  
  // Creative divider
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(1);
  for (let i = 0; i < 6; i++) {
    doc.line(15 + (i * 30), maxY - 5, 35 + (i * 30), maxY - 5);
  }
  
  // Bottom sections in creative layout
  if (certifications && certifications.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS', 55, maxY + 5, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    let certY = maxY + 15;
    certifications.forEach((cert: any) => {
      doc.text(`• ${cert.name} - ${cert.issuer} (${cert.date})`, 25, certY);
      certY += 6;
    });
  }
  
  if (languages && languages.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('LANGUAGES', 150, maxY + 5, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(languages.join(' • '), 150, maxY + 15, { align: 'center' });
  }
  
  // Footer with creative design
  doc.setFillColor(primaryColor);
  doc.rect(0, 285, 210, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Generated with EdMerge CV Generator', 105, 292, { align: 'center' });
};

/**
 * Renders CV content using the Professional template
 */
const renderProfessionalTemplate = async (
  doc: jsPDF, 
  content: any,
  template: CvTemplate
) => {
  const { name, profession, contact, summary, experience, education, skills, certifications, languages } = content;
  
  // Colors
  const primaryColor = '#34495e';
  const accentColor = '#3498db';
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(profession, 105, 25, { align: 'center' });
  
  // Contact information
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 35, 210, 15, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const contactLeft = contact.email ? `Email: ${contact.email}` : '';
  const contactMiddle = contact.phone ? `Phone: ${contact.phone}` : '';
  const contactRight = contact.location ? `Location: ${contact.location}` : '';
  
  doc.text(contactLeft, 20, 43);
  doc.text(contactMiddle, 105, 43, { align: 'center' });
  doc.text(contactRight, 190, 43, { align: 'right' });
  
  let currentY = 60;
  
  // Professional Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('PROFESSIONAL SUMMARY', 15, currentY);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(accentColor);
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const splitSummary = doc.splitTextToSize(summary, 180);
  doc.text(splitSummary, 15, currentY);
  
  currentY += splitSummary.length * 5 + 10;
  
  // Professional Experience
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('PROFESSIONAL EXPERIENCE', 15, currentY);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(accentColor);
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 10;
  
  experience.forEach((exp: any) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(exp.title, 15, currentY);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}, ${exp.location}`, 15, currentY + 5);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 190, currentY, { align: 'right' });
    
    currentY += 10;
    
    // Bullet points
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    exp.bulletPoints.forEach((bullet: string) => {
      doc.text('•', 20, currentY);
      const splitBullet = doc.splitTextToSize(bullet, 170);
      doc.text(splitBullet, 25, currentY);
      currentY += splitBullet.length * 5;
    });
    
    currentY += 5;
  });
  
  // Education
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('EDUCATION', 15, currentY);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(accentColor);
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 10;
  
  education.forEach((edu: any) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(edu.degree, 15, currentY);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.institution}, ${edu.location}`, 15, currentY + 5);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Graduated: ${edu.graduationDate}`, 190, currentY, { align: 'right' });
    
    currentY += 10;
    
    // Highlights
    if (edu.highlights) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      edu.highlights.forEach((highlight: string) => {
        doc.text('•', 20, currentY);
        const splitHighlight = doc.splitTextToSize(highlight, 170);
        doc.text(splitHighlight, 25, currentY);
        currentY += splitHighlight.length * 5;
      });
    }
    
    currentY += 5;
  });
  
  // Skills Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('SKILLS', 15, currentY);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(accentColor);
  doc.line(15, currentY + 2, 195, currentY + 2);
  
  currentY += 10;
  doc.setTextColor(0, 0, 0);
  
  // Professional skills layout in two columns
  let skillsY = currentY;
  
  if (skills.technical) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Skills', 15, skillsY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    skillsY += 5;
    
    // Create a two-column layout for skills
    const mid = Math.ceil(skills.technical.length / 2);
    const leftSkills = skills.technical.slice(0, mid);
    const rightSkills = skills.technical.slice(mid);
    
    let colY = skillsY;
    leftSkills.forEach((skill: string) => {
      doc.text(`• ${skill}`, 20, colY);
      colY += 5;
    });
    
    colY = skillsY;
    rightSkills.forEach((skill: string) => {
      doc.text(`• ${skill}`, 105, colY);
      colY += 5;
    });
    
    skillsY = Math.max(skillsY + leftSkills.length * 5, skillsY + rightSkills.length * 5);
    skillsY += 5;
  }
  
  if (skills.soft) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Soft Skills', 15, skillsY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const softSkills = skills.soft.join(', ');
    const splitSoft = doc.splitTextToSize(softSkills, 180);
    doc.text(splitSoft, 20, skillsY + 5);
    
    skillsY += splitSoft.length * 5 + 10;
  }
  
  if (skills.domain) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Domain Knowledge', 15, skillsY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const domainSkills = skills.domain.join(', ');
    const splitDomain = doc.splitTextToSize(domainSkills, 180);
    doc.text(splitDomain, 20, skillsY + 5);
    
    skillsY += splitDomain.length * 5 + 10;
  }
  
  currentY = skillsY;
  
  // Additional sections if needed and space allows
  if ((certifications && certifications.length > 0) || (languages && languages.length > 0)) {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Create a two-column layout for the last sections
    let leftColY = currentY;
    
    if (certifications && certifications.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text('CERTIFICATIONS', 15, leftColY);
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(accentColor);
      doc.line(15, leftColY + 2, 95, leftColY + 2);
      
      leftColY += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      certifications.forEach((cert: any) => {
        const certText = `${cert.name} - ${cert.issuer} (${cert.date})`;
        const splitCert = doc.splitTextToSize(certText, 90);
        doc.text('•', 15, leftColY);
        doc.text(splitCert, 20, leftColY);
        leftColY += splitCert.length * 5 + 2;
      });
    }
    
    if (languages && languages.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text('LANGUAGES', 115, currentY);
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(accentColor);
      doc.line(115, currentY + 2, 195, currentY + 2);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const langText = languages.join('\n');
      const splitLang = doc.splitTextToSize(langText, 80);
      doc.text(splitLang, 115, currentY + 10);
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated with EdMerge CV Generator - Professional', 105, 290, { align: 'center' });
};

/**
 * Renders CV content using the Academic template
 */
const renderAcademicTemplate = async (
  doc: jsPDF, 
  content: any,
  template: CvTemplate
) => {
  const { name, profession, contact, summary, experience, education, skills, certifications, languages } = content;
  
  // Colors
  const primaryColor = '#800000'; // Dark burgundy
  const borderColor = '#000080'; // Navy blue
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 15, 15);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(profession, 15, 23);
  
  // Contact information
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  
  let contactText = '';
  if (contact.email) contactText += contact.email;
  if (contact.phone) contactText += (contactText ? ' | ' : '') + contact.phone;
  if (contact.location) contactText += (contactText ? ' | ' : '') + contact.location;
  
  doc.text(contactText, 190, 15, { align: 'right' });
  
  // Main content
  let currentY = 40;
  
  // Summary/Objective
  doc.setDrawColor(borderColor);
  doc.setLineWidth(1);
  doc.line(15, currentY, 195, currentY);
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESEARCH OBJECTIVE', 15, currentY + 10);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(summary, 180);
  doc.text(splitSummary, 15, currentY + 20);
  
  currentY += splitSummary.length * 5 + 25;
  
  // Education - In academic CV, education comes first
  doc.setDrawColor(borderColor);
  doc.setLineWidth(1);
  doc.line(15, currentY, 195, currentY);
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION', 15, currentY + 10);
  
  currentY += 20;
  
  education.forEach((edu: any) => {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.degree, 15, currentY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(edu.institution, 15, currentY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${edu.location} | ${edu.graduationDate}`, 15, currentY + 10);
    
    currentY += 15;
    
    // Highlights
    if (edu.highlights) {
      edu.highlights.forEach((highlight: string) => {
        const splitHighlight = doc.splitTextToSize(highlight, 180);
        doc.text('•', 15, currentY);
        doc.text(splitHighlight, 20, currentY);
        currentY += splitHighlight.length * 5 + 2;
      });
    }
    
    currentY += 5;
  });
  
  // Research/Professional Experience
  doc.setDrawColor(borderColor);
  doc.setLineWidth(1);
  doc.line(15, currentY, 195, currentY);
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESEARCH EXPERIENCE', 15, currentY + 10);
  
  currentY += 20;
  
  experience.forEach((exp: any) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title, 15, currentY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(exp.company, 15, currentY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${exp.location} | ${exp.startDate} - ${exp.endDate || 'Present'}`, 15, currentY + 10);
    
    currentY += 15;
    
    // Bullet points
    exp.bulletPoints.forEach((bullet: string) => {
      const splitBullet = doc.splitTextToSize(bullet, 180);
      doc.text('•', 15, currentY);
      doc.text(splitBullet, 20, currentY);
      currentY += splitBullet.length * 5 + 2;
    });
    
    currentY += 5;
  });
  
  // Skills and Competencies
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setDrawColor(borderColor);
  doc.setLineWidth(1);
  doc.line(15, currentY, 195, currentY);
  
  doc.setTextColor(primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SKILLS & COMPETENCIES', 15, currentY + 10);
  
  currentY += 20;
  
  if (skills.technical) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Research & Technical Skills:', 15, currentY);
    
    currentY += 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const techSkills = skills.technical.join(', ');
    const splitTech = doc.splitTextToSize(techSkills, 180);
    doc.text(splitTech, 15, currentY);
    
    currentY += splitTech.length * 5 + 5;
  }
  
  if (skills.domain) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject Expertise:', 15, currentY);
    
    currentY += 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const domainSkills = skills.domain.join(', ');
    const splitDomain = doc.splitTextToSize(domainSkills, 180);
    doc.text(splitDomain, 15, currentY);
    
    currentY += splitDomain.length * 5 + 5;
  }
  
  if (skills.soft) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Transferable Skills:', 15, currentY);
    
    currentY += 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const softSkills = skills.soft.join(', ');
    const splitSoft = doc.splitTextToSize(softSkills, 180);
    doc.text(splitSoft, 15, currentY);
    
    currentY += splitSoft.length * 5 + 5;
  }
  
  // Certifications & Languages - Academic Format
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  // Certifications
  if (certifications && certifications.length > 0) {
    doc.setDrawColor(borderColor);
    doc.setLineWidth(1);
    doc.line(15, currentY, 195, currentY);
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS & PROFESSIONAL DEVELOPMENT', 15, currentY + 10);
    
    currentY += 20;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    certifications.forEach((cert: any) => {
      doc.text(`• ${cert.name} | ${cert.issuer} | ${cert.date}`, 15, currentY);
      currentY += 6;
    });
    
    currentY += 5;
  }
  
  // Languages
  if (languages && languages.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setDrawColor(borderColor);
    doc.setLineWidth(1);
    doc.line(15, currentY, 195, currentY);
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LANGUAGES', 15, currentY + 10);
    
    currentY += 20;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const languagesText = languages.join(', ');
    doc.text(languagesText, 15, currentY);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated with EdMerge CV Generator - Academic', 105, 290, { align: 'center' });
};

/**
 * Renders CV content using the Minimalist template
 */
const renderMinimalistTemplate = async (
  doc: jsPDF, 
  content: any,
  template: CvTemplate
) => {
  const { name, profession, contact, summary, experience, education, skills, certifications, languages } = content;
  
  // Colors
  const primaryColor = '#333333';
  const accentColor = '#999999';
  
  // Header - Minimalist style
  doc.setTextColor(primaryColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), 15, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(profession, 15, 30);
  
  // Contact information
  doc.setFontSize(10);
  doc.setTextColor(accentColor);
  
  let contactText = '';
  if (contact.email) contactText += contact.email;
  if (contact.phone) contactText += (contactText ? ' • ' : '') + contact.phone;
  if (contact.location) contactText += (contactText ? ' • ' : '') + contact.location;
  
  doc.text(contactText, 15, 40);
  
  // Simple divider
  doc.setDrawColor(accentColor);
  doc.setLineWidth(0.5);
  doc.line(15, 45, 195, 45);
  
  let currentY = 55;
  
  // Professional Summary
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFESSIONAL SUMMARY', 15, currentY);
  
  currentY += 8;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitSummary = doc.splitTextToSize(summary, 180);
  doc.text(splitSummary, 15, currentY);
  
  currentY += splitSummary.length * 5 + 5;
  
  // Simple divider
  doc.setDrawColor(accentColor);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, 195, currentY);
  
  currentY += 10;
  
  // Experience
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPERIENCE', 15, currentY);
  
  currentY += 8;
  
  experience.forEach((exp: any) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(exp.title, 15, currentY);
    
    doc.setTextColor(accentColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`${exp.company}, ${exp.location} | ${exp.startDate} - ${exp.endDate || 'Present'}`, 15, currentY + 5);
    
    currentY += 10;
    
    // Bullet points
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    exp.bulletPoints.forEach((bullet: string) => {
      const splitBullet = doc.splitTextToSize(bullet, 180);
      doc.text('•', 15, currentY);
      doc.text(splitBullet, 20, currentY);
      currentY += splitBullet.length * 5;
    });
    
    currentY += 5;
  });
  
  // Simple divider
  doc.setDrawColor(accentColor);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, 195, currentY);
  
  currentY += 10;
  
  // Education
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION', 15, currentY);
  
  currentY += 8;
  
  education.forEach((edu: any) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.degree, 15, currentY);
    
    doc.setTextColor(accentColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`${edu.institution}, ${edu.location} | ${edu.graduationDate}`, 15, currentY + 5);
    
    currentY += 10;
    
    // Highlights
    if (edu.highlights) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      edu.highlights.forEach((highlight: string) => {
        const splitHighlight = doc.splitTextToSize(highlight, 180);
        doc.text('•', 15, currentY);
        doc.text(splitHighlight, 20, currentY);
        currentY += splitHighlight.length * 5;
      });
    }
    
    currentY += 5;
  });
  
  // Simple divider
  doc.setDrawColor(accentColor);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, 195, currentY);
  
  currentY += 10;
  
  // Skills - Minimalist 3-column layout
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SKILLS', 15, currentY);
  
  currentY += 8;
  
  // Create clean 3-column layout
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const allSkills = [
    ...(skills.technical || []),
    ...(skills.soft || []),
    ...(skills.domain || [])
  ];
  
  if (allSkills.length > 0) {
    // Sort alphabetically for clean presentation
    allSkills.sort();
    
    const columnSize = Math.ceil(allSkills.length / 3);
    
    for (let i = 0; i < allSkills.length; i++) {
      const col = Math.floor(i / columnSize);
      const x = 15 + (col * 65);
      const y = currentY + ((i % columnSize) * 5);
      
      doc.text(`• ${allSkills[i]}`, x, y);
    }
    
    const skillRows = Math.ceil(allSkills.length / 3);
    currentY += (skillRows * 5) + 5;
  }
  
  // Final sections - Optional based on content
  const hasMore = (certifications && certifications.length > 0) || (languages && languages.length > 0);
  
  if (hasMore) {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Simple divider
    doc.setDrawColor(accentColor);
    doc.setLineWidth(0.5);
    doc.line(15, currentY, 195, currentY);
    
    currentY += 10;
    
    // Additional info in two-column layout
    let leftColY = currentY;
    let rightColY = currentY;
    
    // Certifications
    if (certifications && certifications.length > 0) {
      doc.setTextColor(primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATIONS', 15, leftColY);
      
      leftColY += 8;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      certifications.forEach((cert: any) => {
        doc.text(`• ${cert.name}`, 15, leftColY);
        doc.setTextColor(accentColor);
        doc.text(`${cert.issuer}, ${cert.date}`, 15, leftColY + 5);
        doc.setTextColor(0, 0, 0);
        leftColY += 10;
      });
    }
    
    // Languages
    if (languages && languages.length > 0) {
      doc.setTextColor(primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('LANGUAGES', 110, rightColY);
      
      rightColY += 8;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      languages.forEach((language: string, index: number) => {
        doc.text(`• ${language}`, 110, rightColY);
        rightColY += 5;
      });
    }
  }
  
  // Minimalist footer - just a simple line
  doc.setDrawColor(accentColor);
  doc.setLineWidth(0.5);
  doc.line(15, 280, 195, 280);
  
  doc.setTextColor(accentColor);
  doc.setFontSize(8);
  doc.text('Generated with EdMerge CV Generator', 105, 288, { align: 'center' });
};