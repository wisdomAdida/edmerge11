import { storage } from "../storage";

async function removeDuplicateTemplates() {
  console.log("Checking for duplicate CV templates...");
  
  try {
    // Get existing templates
    const allTemplates = await storage.getAllCvTemplates();
    console.log(`Found ${allTemplates.length} CV templates in total`);
    
    // Create a map to identify duplicates by name
    const uniqueTemplateNames = new Set<string>();
    const templatesToKeep: number[] = [];
    const templatesToRemove: number[] = [];
    
    // Find duplicates based on name
    for (const template of allTemplates) {
      if (uniqueTemplateNames.has(template.name)) {
        // This is a duplicate, mark for removal
        templatesToRemove.push(template.id);
        console.log(`Duplicate found: "${template.name}" (ID: ${template.id})`);
      } else {
        // This is unique, keep it
        uniqueTemplateNames.add(template.name);
        templatesToKeep.push(template.id);
      }
    }
    
    // Remove the duplicates
    if (templatesToRemove.length > 0) {
      console.log(`Removing ${templatesToRemove.length} duplicate templates...`);
      
      for (const id of templatesToRemove) {
        await storage.deleteCvTemplate(id);
        console.log(`Removed template with ID: ${id}`);
      }
      
      console.log("Duplicate removal completed.");
    } else {
      console.log("No duplicates found. No templates were removed.");
    }
    
    console.log(`Remaining templates: ${templatesToKeep.length}`);
    
  } catch (error) {
    console.error("Error removing duplicate templates:", error);
  }
}

// Run the script
removeDuplicateTemplates();