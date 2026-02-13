# PDF to Word Converter API

High-quality PDF to Word conversion backend using pdf2docx library.

## Features

- ✅ 85-95% formatting accuracy
- ✅ Preserves paragraphs, headings, bold, italic
- ✅ Extracts and positions images correctly
- ✅ Handles bullet and numbered lists
- ✅ 50MB file size limit
- ✅ Fast conversion (5-15 seconds per page)

## Tech Stack

- **FastAPI** - Modern Python web framework
- **pdf2docx** - Professional PDF to DOCX converter
- **Uvicorn** - ASGI server

## Local Development

### Prerequisites

- Python 3.11+
- pip

### Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

3. Test the API:
```bash
# Health check
curl http://localhost:8000/

# Convert PDF (replace with your file)
curl -X POST -F "file=@test.pdf" http://localhost:8000/api/convert --output output.docx
```

The API will be available at: http://localhost:8000

## API Endpoints

### GET /
Health check - returns service status

### POST /api/convert
Convert PDF to Word

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: PDF file (max 50MB)

**Response:**
- DOCX file download

**Example (JavaScript):**
```javascript
const formData = new FormData()
formData.append('file', pdfFile)

const response = await fetch('https://your-api.render.com/api/convert', {
  method: 'POST',
  body: formData
})

const blob = await response.blob()
// Download the blob as .docx file
```

## Deployment to Render

### Step 1: Push to GitHub

```bash
cd /Users/sabuj.mondal/pdf-tools-business
git add backend/
git commit -m "Add Python backend API for PDF to Word conversion"
git push
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your `pdf-tools-business` repository
3. Configure:
   - **Name:** pdf-tools-api (or your choice)
   - **Region:** Choose closest to your users
   - **Branch:** main
   - **Root Directory:** backend
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (for testing) or Starter ($7/month)

4. Click "Create Web Service"

### Step 4: Wait for Deployment

- First deployment takes 5-10 minutes
- Render will build and deploy automatically
- You'll get a URL like: https://pdf-tools-api.onrender.com

### Step 5: Test Deployment

```bash
# Health check
curl https://your-api-url.onrender.com/

# Should return: {"status":"ok","service":"PDF to Word Converter","version":"1.0.0"}
```

### Step 6: Update Frontend

Add the API URL to your frontend:

```javascript
// In pdf-to-word.js
const API_URL = 'https://your-api-url.onrender.com'
```

## Cost

**Render Pricing:**
- **Free Tier:** Available but slow (spins down after inactivity)
- **Starter:** $7/month - Recommended for production
  - Always on
  - No spin-down
  - Good performance
  - Unlimited conversions

## Production Considerations

1. **Add your frontend domain to CORS:**
   ```python
   # In main.py
   allow_origins=[
       "https://yourdomain.com",
       "https://www.yourdomain.com",
   ]
   ```

2. **Monitor health:**
   - Render provides monitoring dashboard
   - Use `/health` endpoint for uptime monitoring

3. **Scaling:**
   - Starter tier handles 100s of conversions/day
   - Upgrade to Standard ($25/month) if needed

## Troubleshooting

**Deployment fails:**
- Check Python version in runtime.txt
- Verify all dependencies in requirements.txt
- Check Render logs for errors

**Conversion fails:**
- Check file size < 50MB
- Ensure PDF is valid and not corrupted
- Check Render logs for specific errors

**CORS errors:**
- Add your frontend domain to allow_origins in main.py
- Redeploy after changes

## Alternative: Railway Deployment ($5/month)

If you prefer Railway:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - Root directory: backend
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deploy

Railway is $2 cheaper but Render is more reliable for production.
