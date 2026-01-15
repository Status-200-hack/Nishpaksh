# Voter ID Checker - Next.js Application

A modern web application to check voter details from the Election Commission of India.

## Features

- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🔒 CAPTCHA verification
- 📱 Mobile-friendly design
- ⚡ Fast Next.js API routes
- 🎯 Real-time voter data from ECI

## Setup

1. Install dependencies:
```bash
cd voter-checker
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Enter your EPIC number (Voter ID)
2. Select your state
3. Enter the CAPTCHA text
4. Click "Search Voter Details"
5. View your voter information

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: ECI Gateway API

## API Endpoints

- `GET /api/generate-captcha` - Generate CAPTCHA image
- `POST /api/search-voter` - Search voter by EPIC number

## Deployment

Deploy to Vercel:

```bash
npm run build
vercel
```

## License

MIT

