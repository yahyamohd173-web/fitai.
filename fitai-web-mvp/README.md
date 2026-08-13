# FITAI — AI Gen-Z Outfit Stylist

A polished, responsive MVP for an AI fashion-styling startup.

## Run locally

No build step is required for this MVP.

1. Open `index.html` in a browser, or serve the folder with any static server.
2. Upload a photo.
3. Choose occasion, budget and style.
4. Generate demo outfits.
5. Save outfits locally in the browser.

## Publish it

This static MVP can be deployed to Vercel, Netlify, Cloudflare Pages or GitHub Pages.

### Vercel

Create a new project, import this repository/folder and deploy with no build command.

### Important

This is an MVP UI, not a production backend. Before accepting real users, replace the demo pieces with:

- Supabase/Firebase/Auth.js for real authentication
- Private object storage for uploaded images
- A server-side AI/image-analysis API
- A server-side recommendation service
- Approved Amazon/Flipkart/Myntra affiliate APIs, product feeds or licensed product-search APIs
- Server-side secrets stored as environment variables
- Rate limiting, logging and monitoring
- A real database for profiles, outfits, products and saved looks
- Privacy policy, terms and user photo deletion controls

Do not scrape or bypass retailer anti-bot protections.

## SEO

The included title and meta description are the starting point. For a production Next.js version, add:

- sitemap.xml
- robots.txt
- Open Graph metadata
- structured data
- canonical URLs
- Search Console verification
- fast image delivery

## Suggested production architecture

Frontend: Next.js + TypeScript + Tailwind
Auth/DB/Storage: Supabase
AI: provider-agnostic server API
Products: approved affiliate/product feeds
Hosting: Vercel
Analytics: privacy-conscious analytics

## Product flow

Landing → Login → Profile → Upload → Style/Occasion/Budget → AI analysis → Outfit results → Product matching → Save → Shop
