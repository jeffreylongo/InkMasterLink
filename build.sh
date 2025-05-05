#!/bin/bash

# Enhanced build script for Netlify
echo "==============================================="
echo "  Building Ink Master Link..."
echo "==============================================="

# Display current directory structure
echo "Current directory structure:"
ls -la

# Make sure the images directory exists
echo "Ensuring images directory exists..."
mkdir -p ./public/images
mkdir -p ./public/scripts
mkdir -p ./public/css

# Check if images exist and copy them if needed
echo "Checking image assets..."
if [ -f "./attached_assets/shop.jpeg" ]; then
  echo "Found shop.jpeg in attached_assets, copying to public/images..."
  cp ./attached_assets/shop.jpeg ./public/images/
elif [ ! -f "./public/images/shop.jpeg" ]; then
  echo "WARNING: shop.jpeg not found, using placeholder..."
  echo "Shop image missing" > ./public/images/shop.jpeg
fi

if [ -f "./attached_assets/artist.webp" ]; then
  echo "Found artist.webp in attached_assets, copying to public/images..."
  cp ./attached_assets/artist.webp ./public/images/
elif [ ! -f "./public/images/artist.webp" ]; then
  echo "WARNING: artist.webp not found, using placeholder..."
  echo "Artist image missing" > ./public/images/artist.webp
fi

# Install dependencies for functions if needed
echo "Installing dependencies for Netlify functions..."
cd functions
npm install
cd ..

# Display final directory structure
echo "Final directory structure:"
ls -la ./public
ls -la ./public/images

echo "==============================================="
echo "  Build completed successfully!"
echo "==============================================="