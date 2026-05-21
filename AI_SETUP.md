# AI Features Setup Guide

This document explains how to set up the AI features in Resumify, including the AI chatbox and AI-powered ATS recommendations.

## Features Added

1. **AI Chatbox** - A floating chat assistant that provides resume and career advice
2. **AI Recommendations in ATS Checker** - Personalized recommendations based on your resume and job description

## Prerequisites

You need a Google Gemini API key to use the AI features. Get one from: https://makersuite.google.com/app/apikey

## Setup Steps

### 1. Configure Environment Variables

In the `server` directory, create a `.env` file (or update your existing one):

```bash
cd server
```

Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### 2. Add Your Gemini API Key

Edit the `.env` file and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Make sure to also configure the other required variables:
```env
MONGODB_URI=mongodb://localhost:27017/resumify
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### 3. Restart the Server

After adding the API key, restart your server:

```bash
cd server
npm run dev
```

### 4. Start the Client

In a separate terminal:

```bash
cd client
npm start
```

## Using the AI Features

### AI Chatbox

- Look for the purple chat button in the bottom-right corner of any page
- Click to open the AI assistant
- Ask questions about resume writing, ATS optimization, career advice, etc.
- The AI maintains conversation context for follow-up questions

### AI Recommendations in ATS Checker

1. Go to the ATS Checker page
2. Select a resume and paste a job description
3. Click "Check ATS Score" to run the analysis
4. After results appear, click "Get AI Tips" in the AI Recommendations section
5. The AI will analyze your resume against the job description and provide personalized recommendations

## Cost Considerations

The AI features use Google's Gemini 1.5 Flash model:
- Gemini 1.5 Flash is free for development use
- For production use, check Google AI pricing at https://ai.google.dev/pricing
- Typical usage: Minimal cost for production workloads

Monitor your Google AI dashboard for usage and costs.

## Troubleshooting

### AI features not working

1. Verify your GEMINI_API_KEY is correctly set in the `.env` file
2. Check that the API key is valid at https://makersuite.google.com/app/apikey
3. Ensure the server is restarted after adding the API key
4. Check server logs for error messages

### Fallback behavior

If the AI service fails (e.g., API key missing, network issues), the system will:
- Chatbox: Display an error message and suggest trying again later
- ATS Recommendations: Fall back to generic recommendations based on ATS results

## Security Notes

- Never commit your `.env` file to version control
- Keep your Gemini API key secure
- Rotate your API key if it's accidentally exposed
- The `.env.example` file shows the required variables without actual values
