import sharp from 'sharp';

export const POST = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get('image');
    
    if (!file || typeof file === 'string') {
        return new Response(JSON.stringify({ error: 'No valid image provided' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Convert to AVIF using sharp
    const avifBuffer = await sharp(Buffer.from(arrayBuffer))
      .avif({ quality: 80, effort: 4 })
      .toBuffer();

    // Original file name without extension
    const originalName = file.name ? file.name.replace(/\.[^/.]+$/, "") : 'image';

    return new Response(avifBuffer, {
      headers: {
        'Content-Type': 'image/avif',
        'Content-Disposition': `attachment; filename="${originalName}.avif"`
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
