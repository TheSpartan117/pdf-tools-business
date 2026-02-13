"""
Professional PDF Tools API
Provides high-quality conversion and processing for PDF files
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pdf2docx import Converter
import tempfile
import os
import logging
from pathlib import Path
import subprocess
import fitz  # PyMuPDF
from pdf2image import convert_from_path
import pytesseract
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Professional PDF Tools API",
    description="High-quality PDF conversion and processing (PDF↔Word, OCR, Compression)",
    version="2.0.0"
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
        "service": "Professional PDF Tools API",
        "version": "2.0.0",
        "endpoints": {
            "pdf_to_word": "/api/convert",
            "word_to_pdf": "/api/word-to-pdf",
            "ocr": "/api/ocr",
            "compress": "/api/compress"
        }
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

@app.post("/api/word-to-pdf")
async def convert_word_to_pdf(file: UploadFile = File(...)):
    """
    Convert Word document to PDF

    Args:
        file: DOCX file to convert

    Returns:
        PDF file
    """
    # Validate file type
    if not file.filename.lower().endswith(('.docx', '.doc')):
        raise HTTPException(status_code=400, detail="File must be a Word document (.docx or .doc)")

    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    logger.info(f"Converting Word to PDF: {file.filename}")

    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as docx_temp:
        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")

        docx_temp.write(content)
        docx_path = docx_temp.name

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as pdf_temp:
        pdf_path = pdf_temp.name

    try:
        # Convert DOCX to PDF using LibreOffice (best quality)
        logger.info(f"Converting: {docx_path} -> {pdf_path}")

        # Use LibreOffice headless mode for conversion
        result = subprocess.run([
            'libreoffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', os.path.dirname(pdf_path),
            docx_path
        ], capture_output=True, text=True, timeout=60)

        if result.returncode != 0:
            raise Exception(f"LibreOffice conversion failed: {result.stderr}")

        # LibreOffice creates file with original name, need to rename
        libreoffice_output = os.path.join(
            os.path.dirname(pdf_path),
            os.path.basename(docx_path).rsplit('.', 1)[0] + '.pdf'
        )

        if os.path.exists(libreoffice_output) and libreoffice_output != pdf_path:
            os.rename(libreoffice_output, pdf_path)

        logger.info(f"Conversion successful: {file.filename}")

        # Generate output filename
        output_filename = file.filename.rsplit('.', 1)[0] + '.pdf'

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=output_filename,
            background=lambda: cleanup_temp_files(docx_path, pdf_path)
        )

    except subprocess.TimeoutExpired:
        cleanup_temp_files(docx_path, pdf_path)
        raise HTTPException(status_code=500, detail="Conversion timeout (file too large or complex)")
    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}")
        cleanup_temp_files(docx_path, pdf_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

@app.post("/api/ocr")
async def ocr_pdf(file: UploadFile = File(...), language: str = Form("eng")):
    """
    Perform OCR on scanned PDF and create searchable PDF

    Args:
        file: PDF file to OCR
        language: OCR language code (eng, spa, fra, deu, etc.)

    Returns:
        Searchable PDF file with text layer
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    logger.info(f"OCR processing: {file.filename} (language: {language})")

    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as pdf_temp:
        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")

        pdf_temp.write(content)
        pdf_path = pdf_temp.name

    output_pdf_path = tempfile.mktemp(suffix='_ocr.pdf')

    try:
        logger.info(f"Converting PDF to images for OCR: {pdf_path}")

        # Convert PDF pages to images
        images = convert_from_path(pdf_path, dpi=300)

        # Create new PDF with OCR text layer
        pdf_document = fitz.open()

        for i, image in enumerate(images):
            logger.info(f"OCR processing page {i + 1}/{len(images)}")

            # Save image temporarily
            img_path = tempfile.mktemp(suffix='.png')
            image.save(img_path, 'PNG')

            # Perform OCR
            ocr_text = pytesseract.image_to_string(Image.open(img_path), lang=language)

            # Create new PDF page with image and text layer
            img_pdf = fitz.open(img_path)
            pdf_page = pdf_document.new_page(width=img_pdf[0].rect.width, height=img_pdf[0].rect.height)
            pdf_page.insert_image(pdf_page.rect, filename=img_path)

            # Add invisible text layer for searchability
            if ocr_text.strip():
                pdf_page.insert_text((10, 10), ocr_text, fontsize=1, color=(1, 1, 1))

            img_pdf.close()
            os.unlink(img_path)

        # Save the OCR'd PDF
        pdf_document.save(output_pdf_path)
        pdf_document.close()

        logger.info(f"OCR successful: {file.filename}")

        # Generate output filename
        output_filename = file.filename.rsplit('.', 1)[0] + '_ocr.pdf'

        return FileResponse(
            path=output_pdf_path,
            media_type="application/pdf",
            filename=output_filename,
            background=lambda: cleanup_temp_files(pdf_path, output_pdf_path)
        )

    except Exception as e:
        logger.error(f"OCR failed: {str(e)}")
        cleanup_temp_files(pdf_path, output_pdf_path)
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@app.post("/api/compress")
async def compress_pdf(file: UploadFile = File(...), quality: str = Form("medium")):
    """
    Compress PDF file to reduce size

    Args:
        file: PDF file to compress
        quality: Compression quality (low, medium, high)

    Returns:
        Compressed PDF file
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB for compression
    logger.info(f"Compressing PDF: {file.filename} (quality: {quality})")

    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as pdf_temp:
        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 100MB limit")

        pdf_temp.write(content)
        pdf_path = pdf_temp.name

    compressed_pdf_path = tempfile.mktemp(suffix='_compressed.pdf')

    try:
        # Open PDF with PyMuPDF
        pdf_document = fitz.open(pdf_path)

        # Compression settings based on quality
        quality_settings = {
            "low": {"deflate": 9, "garbage": 4, "image_quality": 50},
            "medium": {"deflate": 5, "garbage": 3, "image_quality": 75},
            "high": {"deflate": 1, "garbage": 2, "image_quality": 90}
        }

        settings = quality_settings.get(quality, quality_settings["medium"])

        logger.info(f"Applying compression with settings: {settings}")

        # Save with compression
        pdf_document.save(
            compressed_pdf_path,
            garbage=settings["garbage"],
            deflate=True,
            deflate_images=True,
            deflate_fonts=True
        )
        pdf_document.close()

        # Get file sizes
        original_size = os.path.getsize(pdf_path)
        compressed_size = os.path.getsize(compressed_pdf_path)
        reduction = ((original_size - compressed_size) / original_size) * 100

        logger.info(f"Compression successful: {file.filename} - Reduced by {reduction:.1f}%")

        # Generate output filename
        output_filename = file.filename.rsplit('.', 1)[0] + '_compressed.pdf'

        return FileResponse(
            path=compressed_pdf_path,
            media_type="application/pdf",
            filename=output_filename,
            headers={
                "X-Original-Size": str(original_size),
                "X-Compressed-Size": str(compressed_size),
                "X-Reduction-Percent": f"{reduction:.1f}"
            },
            background=lambda: cleanup_temp_files(pdf_path, compressed_pdf_path)
        )

    except Exception as e:
        logger.error(f"Compression failed: {str(e)}")
        cleanup_temp_files(pdf_path, compressed_pdf_path)
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")

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
