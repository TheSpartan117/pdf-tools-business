"""
Professional PDF Tools API
Provides high-quality conversion and processing for PDF files
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pdf2docx import Converter
import tempfile
import os
import io
import logging
from pathlib import Path
import subprocess
import fitz  # PyMuPDF
from pdf2image import convert_from_path
import pytesseract
from PIL import Image
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import glob

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

# Scheduled cleanup job for orphaned temp files
def cleanup_orphaned_temp_files():
    """
    Clean up orphaned temporary files older than 1 hour
    Runs every hour to prevent disk space issues
    """
    try:
        temp_dir = tempfile.gettempdir()
        cutoff_time = datetime.now() - timedelta(hours=1)

        # Find all temp files created by our app
        patterns = [
            os.path.join(temp_dir, 'tmp*.pdf'),
            os.path.join(temp_dir, 'tmp*.docx'),
            os.path.join(temp_dir, 'tmp*.png'),
            os.path.join(temp_dir, '*_ocr.pdf'),
            os.path.join(temp_dir, '*_compressed.pdf')
        ]

        cleaned_count = 0
        for pattern in patterns:
            for file_path in glob.glob(pattern):
                try:
                    # Check file age
                    file_modified = datetime.fromtimestamp(os.path.getmtime(file_path))

                    if file_modified < cutoff_time:
                        os.unlink(file_path)
                        cleaned_count += 1
                        logger.debug(f"Cleaned orphaned file: {file_path}")
                except Exception as e:
                    logger.warning(f"Failed to clean {file_path}: {e}")

        if cleaned_count > 0:
            logger.info(f"Scheduled cleanup: Removed {cleaned_count} orphaned temp files")

    except Exception as e:
        logger.error(f"Scheduled cleanup failed: {e}")

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    cleanup_orphaned_temp_files,
    'interval',
    hours=1,
    id='cleanup_temp_files',
    replace_existing=True
)
scheduler.start()

# Shutdown scheduler on app exit
@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
    logger.info("Scheduler shut down")

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
        # resize_factor: percentage of original dimensions to keep
        quality_settings = {
            "low": {"garbage": 4, "image_quality": 50, "resize_factor": 0.5},      # 50% size, 50% quality
            "medium": {"garbage": 3, "image_quality": 75, "resize_factor": 0.7},   # 70% size, 75% quality
            "high": {"garbage": 2, "image_quality": 90, "resize_factor": 0.85}     # 85% size, 90% quality
        }

        settings = quality_settings.get(quality, quality_settings["medium"])
        image_quality = settings["image_quality"]
        resize_factor = settings["resize_factor"]

        logger.info(f"Applying compression with settings: {settings}")

        # Compress images in each page
        images_compressed = 0
        images_skipped = 0

        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            image_list = page.get_images(full=True)

            for img_index, img in enumerate(image_list):
                xref = img[0]
                try:
                    # Extract image
                    base_image = pdf_document.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    original_image_size = len(image_bytes)

                    # Skip if not a compressible format
                    if image_ext not in ["png", "jpg", "jpeg", "bmp", "tiff"]:
                        images_skipped += 1
                        continue

                    # Skip very small images (< 10KB) - not worth compressing
                    if original_image_size < 10240:
                        images_skipped += 1
                        continue

                    # Open with PIL
                    img_pil = Image.open(io.BytesIO(image_bytes))
                    original_width, original_height = img_pil.size

                    # Skip very small dimensions (< 100px on either side)
                    if original_width < 100 or original_height < 100:
                        images_skipped += 1
                        continue

                    # Convert RGBA to RGB if necessary
                    if img_pil.mode == 'RGBA':
                        rgb_img = Image.new('RGB', img_pil.size, (255, 255, 255))
                        rgb_img.paste(img_pil, mask=img_pil.split()[3])
                        img_pil = rgb_img
                    elif img_pil.mode not in ['RGB', 'L']:
                        img_pil = img_pil.convert('RGB')

                    # Resize image based on quality setting
                    new_width = int(original_width * resize_factor)
                    new_height = int(original_height * resize_factor)

                    # Only resize if the new size is smaller
                    if new_width < original_width and new_height < original_height:
                        img_pil = img_pil.resize((new_width, new_height), Image.Resampling.LANCZOS)

                    # Recompress image with quality setting
                    img_output = io.BytesIO()
                    img_pil.save(img_output, format='JPEG', quality=image_quality, optimize=True)
                    img_data = img_output.getvalue()
                    compressed_image_size = len(img_data)

                    # Only replace if compressed version is actually smaller
                    if compressed_image_size < original_image_size:
                        page.replace_image(xref, stream=img_data)
                        images_compressed += 1
                        savings = original_image_size - compressed_image_size
                        logger.info(f"Compressed image {img_index} on page {page_num}: {original_width}x{original_height} -> {new_width}x{new_height}, saved {savings} bytes")
                    else:
                        images_skipped += 1
                        logger.info(f"Skipped image {img_index} on page {page_num}: compressed version would be larger")

                except Exception as e:
                    # Skip problematic images
                    logger.warning(f"Could not compress image {img_index} on page {page_num}: {e}")
                    images_skipped += 1
                    continue

        logger.info(f"Compression complete: {images_compressed} images compressed, {images_skipped} images skipped")

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

@app.get("/privacy", response_class=HTMLResponse)
async def privacy_policy():
    """Privacy policy endpoint - documents data handling practices"""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privacy Policy - PDF Tools API</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }
            h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #1e40af; margin-top: 30px; }
            .highlight { background-color: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
            .guarantee { background-color: #dcfce7; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0; }
            ul { padding-left: 25px; }
            li { margin: 8px 0; }
            .timestamp { color: #666; font-size: 0.9em; }
            .security-badge { display: inline-block; background: #16a34a; color: white; padding: 5px 10px; border-radius: 4px; font-size: 0.85em; margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>Privacy Policy</h1>
        <p class="timestamp">Last Updated: February 2026</p>

        <div class="guarantee">
            <h3>🔒 Our Privacy Guarantee</h3>
            <p><strong>Your files are processed securely and deleted immediately.</strong></p>
            <p>We do not store, access, or share your documents. Period.</p>
        </div>

        <h2>How We Handle Your Files</h2>

        <h3>1. Temporary Processing Only</h3>
        <p>When you upload a file for conversion or processing:</p>
        <ul>
            <li><strong>Storage Duration:</strong> Files exist on our servers for <strong>5-30 seconds only</strong> (during processing)</li>
            <li><strong>Storage Location:</strong> Temporary system directory with unique random names</li>
            <li><strong>Automatic Deletion:</strong> Files are deleted immediately after processing completes</li>
            <li><strong>Error Handling:</strong> Files are deleted even if processing fails</li>
        </ul>

        <div class="highlight">
            <strong>Example Timeline:</strong>
            <ol>
                <li>You upload a PDF (0 seconds)</li>
                <li>File temporarily stored for processing (0-30 seconds)</li>
                <li>Converted file sent to your browser</li>
                <li>Both files permanently deleted (&lt;1 second after sending)</li>
            </ol>
            <p><strong>Total time on server: ~5-30 seconds</strong></p>
        </div>

        <h3>2. No Permanent Storage</h3>
        <ul>
            <li>❌ No database storage</li>
            <li>❌ No file archives</li>
            <li>❌ No backup copies</li>
            <li>❌ No file content logging</li>
            <li>✅ Complete deletion after processing</li>
        </ul>

        <h3>3. Automated Safety Measures</h3>
        <p>We have implemented multiple layers of protection:</p>
        <ul>
            <li><span class="security-badge">ACTIVE</span> <strong>Scheduled Cleanup:</strong> Every hour, our system automatically deletes any orphaned files older than 1 hour</li>
            <li><span class="security-badge">ACTIVE</span> <strong>Immediate Cleanup:</strong> Files deleted within 1 second of processing completion</li>
            <li><span class="security-badge">ACTIVE</span> <strong>Error Cleanup:</strong> Files deleted immediately if processing fails</li>
            <li><span class="security-badge">ACTIVE</span> <strong>Server Restart:</strong> All temporary files cleared on server restart</li>
        </ul>

        <h2>What We Process</h2>

        <h3>Supported Operations</h3>
        <ul>
            <li><strong>PDF to Word:</strong> Convert PDF to editable Word documents</li>
            <li><strong>Word to PDF:</strong> Convert Word documents to PDF format</li>
            <li><strong>OCR (Text Recognition):</strong> Extract text from scanned PDFs</li>
            <li><strong>PDF Compression:</strong> Reduce PDF file size</li>
        </ul>

        <h3>File Size Limits</h3>
        <ul>
            <li>PDF to Word: 50 MB maximum</li>
            <li>Word to PDF: 50 MB maximum</li>
            <li>OCR: 50 MB maximum</li>
            <li>Compression: 100 MB maximum</li>
        </ul>

        <h2>What We Do NOT Collect</h2>
        <ul>
            <li>❌ File contents</li>
            <li>❌ Document metadata</li>
            <li>❌ Personal information from files</li>
            <li>❌ IP addresses (beyond standard server logs)</li>
            <li>❌ User accounts or tracking cookies</li>
        </ul>

        <h2>Technical Logs</h2>
        <p>We only log:</p>
        <ul>
            <li>✅ Generic processing events (e.g., "PDF conversion started")</li>
            <li>✅ Error messages (without file content)</li>
            <li>✅ Server performance metrics</li>
        </ul>
        <p><strong>We do NOT log:</strong> Filenames, file contents, or any identifiable information</p>

        <h2>Security Measures</h2>
        <ul>
            <li>🔒 <strong>HTTPS Encryption:</strong> All file uploads/downloads encrypted in transit</li>
            <li>🔒 <strong>Isolated Processing:</strong> Each file processed in isolation</li>
            <li>🔒 <strong>No Network Access:</strong> Processing servers cannot access external networks</li>
            <li>🔒 <strong>Secure Hosting:</strong> Hosted on Render.com's secure infrastructure</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p><strong>Hosting:</strong> Our API is hosted on Render.com</p>
        <ul>
            <li>Render complies with SOC 2 Type II, GDPR, and CCPA</li>
            <li>Files remain on our server only (not shared with Render)</li>
            <li>Render's privacy policy: <a href="https://render.com/privacy">https://render.com/privacy</a></li>
        </ul>

        <h2>Data Retention</h2>
        <div class="highlight">
            <p><strong>Retention Period: 5-30 seconds (processing time only)</strong></p>
            <p>After processing completes, files are immediately and permanently deleted. We cannot recover deleted files.</p>
        </div>

        <h2>Your Rights</h2>
        <ul>
            <li><strong>Right to Privacy:</strong> Your files are never stored permanently</li>
            <li><strong>Right to Deletion:</strong> Files are automatically deleted - no action needed</li>
            <li><strong>Right to Know:</strong> This privacy policy documents all data handling</li>
            <li><strong>No Account Required:</strong> No personal information collected</li>
        </ul>

        <h2>GDPR & CCPA Compliance</h2>
        <ul>
            <li>✅ <strong>Data Minimization:</strong> We only process files during conversion</li>
            <li>✅ <strong>Purpose Limitation:</strong> Files used only for requested processing</li>
            <li>✅ <strong>Storage Limitation:</strong> Automatic deletion after processing</li>
            <li>✅ <strong>No Profiling:</strong> We do not track or profile users</li>
            <li>✅ <strong>No Data Sales:</strong> We never sell or share your data</li>
        </ul>

        <h2>Recommendations for Extra Privacy</h2>
        <p>For maximum privacy, we recommend:</p>
        <ul>
            <li>Remove sensitive information before uploading</li>
            <li>Use document encryption for highly sensitive files</li>
            <li>Consider processing documents locally if they contain classified information</li>
        </ul>

        <h2>Changes to This Policy</h2>
        <p>We may update this privacy policy to reflect changes in our practices. Last updated date is shown at the top of this page.</p>

        <h2>Contact</h2>
        <p>If you have questions about how we handle your files:</p>
        <ul>
            <li>Review our open-source code: <a href="https://github.com/JoHn11117/pdf-tools-business">GitHub Repository</a></li>
            <li>Technical documentation: See README.md in the backend folder</li>
        </ul>

        <div class="guarantee">
            <h3>✓ Privacy Guarantee Summary</h3>
            <ul>
                <li>✓ Files deleted within 5-30 seconds</li>
                <li>✓ No permanent storage</li>
                <li>✓ No file content logging</li>
                <li>✓ Automatic cleanup every hour</li>
                <li>✓ HTTPS encryption</li>
                <li>✓ GDPR & CCPA compliant</li>
            </ul>
            <p><strong>Your privacy is our priority.</strong></p>
        </div>

        <hr style="margin: 40px 0;">
        <p style="text-align: center; color: #666; font-size: 0.9em;">
            Professional PDF Tools API v2.0.0<br>
            <a href="/">← Back to API</a>
        </p>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/privacy/json")
async def privacy_policy_json():
    """Privacy policy in JSON format for programmatic access"""
    return {
        "service": "Professional PDF Tools API",
        "version": "2.0.0",
        "last_updated": "2026-02",
        "data_handling": {
            "storage_duration": "5-30 seconds (during processing only)",
            "permanent_storage": False,
            "automatic_deletion": True,
            "backup_copies": False,
            "file_content_logging": False
        },
        "security": {
            "https_encryption": True,
            "isolated_processing": True,
            "scheduled_cleanup": "Every 1 hour",
            "immediate_cleanup": "Within 1 second after processing"
        },
        "compliance": {
            "gdpr_compliant": True,
            "ccpa_compliant": True,
            "soc2_hosting": True
        },
        "file_limits": {
            "pdf_to_word_mb": 50,
            "word_to_pdf_mb": 50,
            "ocr_mb": 50,
            "compression_mb": 100
        },
        "data_collected": {
            "file_contents": False,
            "filenames": False,
            "metadata": False,
            "personal_info": False,
            "user_tracking": False
        },
        "retention": {
            "processing_time": "5-30 seconds",
            "after_processing": "Immediately deleted",
            "recovery_possible": False
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
