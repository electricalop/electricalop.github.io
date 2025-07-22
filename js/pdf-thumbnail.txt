// PDF.js for thumbnail generation
async function generatePDFThumbnail(pdfUrl) {
  try {
    console.log('Generating thumbnail for:', pdfUrl);
    
    // First try to fetch the PDF to handle CORS
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const pdfData = await response.arrayBuffer();
    
    // Load the PDF data
    const loadingTask = pdfjsLib.getDocument({data: pdfData});
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set dimensions for thumbnail
    const viewport = page.getViewport({ scale: 1 });
    const scale = 80 / viewport.width; // Target width of 80px
    const scaledViewport = page.getViewport({ scale });
    
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    
    // Render the PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise;
    
    console.log('Successfully generated thumbnail for:', pdfUrl);
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error generating PDF thumbnail for', pdfUrl, ':', error);
    return null;
  }
}
