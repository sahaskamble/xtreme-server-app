#!/bin/bash

# Find all JSX files with @renderer imports
FILES=$(grep -l "@renderer" src/pages/\(app\)/users/components/*.jsx)

# Loop through each file and update the imports
for file in $FILES; do
  echo "Updating $file..."
  
  # Update UI component imports
  sed -i 's|@renderer/components/ui/|@/components/ui/|g' "$file"
  
  # Update hook imports
  sed -i 's|@renderer/hooks/pbCollection|@/hooks/useRealTime|g' "$file"
  
  # Update other imports
  sed -i 's|@renderer/|@/|g' "$file"
  
  echo "Updated $file"
done

echo "All files updated!"
