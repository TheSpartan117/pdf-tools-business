"""
PDF to Word Conversion API
Uses pdf2docx library for high-quality conversion
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pdf2docx import Converter
import tempfile
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PDF to Word Converter API",
    description="High-quality PDF to Word conversion using pdf2docx",
    version="1.0.0"
)

# CORS configuration - allow your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://*.netlify.app",
        # Add your production domain here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "PDF to Word Converter",
        "version": "1.0.0"
    }

@app.post("/api/convert")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    """
    Convert PDF to Word document

    Args:
        file: PDF file to convert

    Returns:
        DOCX file
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    # Validate file size (max 50MB)
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

    logger.info(f"Converting PDF: {file.filename}")

    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as pdf_temp:
        # Read and save PDF
        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")

        pdf_temp.write(content)
        pdf_path = pdf_temp.name

    with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as docx_temp:
        docx_path = docx_temp.name

    try:
        # Convert PDF to DOCX using pdf2docx
        logger.info(f"Starting conversion: {pdf_path} -> {docx_path}")

        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()

        logger.info(f"Conversion successful: {file.filename}")

        # Generate output filename
        output_filename = file.filename.rsplit('.', 1)[0] + '.docx'

        # Return the converted file
        return FileResponse(
            path=docx_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=output_filename,
            background=lambda: cleanup_temp_files(pdf_path, docx_path)
        )

    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}")
        # Clean up on error
        cleanup_temp_files(pdf_path, docx_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

def cleanup_temp_files(*file_paths):
    """Clean up temporary files"""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"Cleaned up: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up {file_path}: {e}")

@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
