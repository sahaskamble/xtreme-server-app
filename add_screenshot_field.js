// Script to add take_screenshot field to devices collection
// Run this script with Node.js

const PocketBase = require('pocketbase');

// Replace with your PocketBase URL
const pb = new PocketBase('http://127.0.0.1:8090');

async function addScreenshotField() {
  try {
    // Admin login - replace with your admin credentials
    await pb.admins.authWithPassword('admin@example.com', 'your-password');
    
    // Get the current schema for devices collection
    const collection = await pb.collections.getOne('devices');
    
    // Check if the field already exists
    const fieldExists = collection.schema.some(field => field.name === 'take_screenshot');
    
    if (fieldExists) {
      console.log('take_screenshot field already exists in devices collection');
      return;
    }
    
    // Add the new field to the schema
    const updatedSchema = [
      ...collection.schema,
      {
        "name": "take_screenshot",
        "type": "bool",
        "required": false,
        "presentable": false,
        "system": false
      }
    ];
    
    // Update the collection schema
    await pb.collections.update('devices', {
      schema: updatedSchema
    });
    
    console.log('Successfully added take_screenshot field to devices collection');
  } catch (error) {
    console.error('Error adding take_screenshot field:', error);
  }
}

addScreenshotField();
