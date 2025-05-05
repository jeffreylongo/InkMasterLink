#!/bin/bash
echo "Building Ink Master Link..."

# Create images directory
mkdir -p ./public/images

# Copy standard images from attached_assets if they exist
if [ -f "attached_assets/shop.jpeg" ]; then
  cp attached_assets/shop.jpeg public/images/
  echo "✅ Copied shop.jpeg to public/images/"
else
  echo "⚠️ Warning: shop.jpeg not found in attached_assets"
fi

if [ -f "attached_assets/artist.webp" ]; then
  cp attached_assets/artist.webp public/images/
  echo "✅ Copied artist.webp to public/images/"
else
  echo "⚠️ Warning: artist.webp not found in attached_assets"
fi

# Ensure redirects file exists
if [ ! -f "public/_redirects" ]; then
  echo "/api/*  /.netlify/functions/parlors/:splat  200" > public/_redirects
  echo "/*      /index.html                      200" >> public/_redirects
  echo "✅ Created _redirects file"
fi

# Ensure headers file exists
if [ ! -f "public/_headers" ]; then
  cat > public/_headers << EOL
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: same-origin

/images/*
  Cache-Control: public, max-age=31536000
EOL
  echo "✅ Created _headers file"
fi

echo "✅ Build completed successfully"