import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../../shared/schema';

// Create postgres connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Define tables to create
(async () => {
  try {
    // Check if course_content_type enum exists
    const enumExists = await client`
      SELECT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'course_content_type'
      );
    `;
    
    // Create enum if it doesn't exist
    if (!enumExists[0].exists) {
      console.log('Creating course_content_type enum...');
      await client`
        CREATE TYPE course_content_type AS ENUM (
          'video', 'document', 'pdf', 'quiz', 'assignment', 'link'
        );
      `;
    }
    
    console.log('Creating course_sections table...');
    await client`
      CREATE TABLE IF NOT EXISTS course_sections (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id),
        title TEXT NOT NULL,
        description TEXT,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log('Creating course_materials table...');
    await client`
      CREATE TABLE IF NOT EXISTS course_materials (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id),
        section_id INTEGER REFERENCES course_sections(id),
        title TEXT NOT NULL,
        description TEXT,
        type course_content_type NOT NULL,
        url TEXT NOT NULL,
        file_size INTEGER,
        duration INTEGER,
        "order" INTEGER NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        thumbnail_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await client.end();
  }
})();