#!/bin/bash
echo "Pushing changes to GitHub for Netlify deployment..."

# Make the script executable
chmod +x build.sh

# Copy images to public/images for local testing
mkdir -p public/images
cp attached_assets/shop.jpeg public/images/ 2>/dev/null || echo "Warning: shop.jpeg not found"
cp attached_assets/artist.webp public/images/ 2>/dev/null || echo "Warning: artist.webp not found"

# Add all changes
git add .

# Commit changes
git commit -m "Update for Netlify deployment"

# Push to GitHub
git push

echo "✅ Changes pushed to GitHub. Check Netlify for deployment status."
echo "   If there are any errors, check the Netlify logs for details."