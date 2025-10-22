import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { SiteFloorplanRepository } from '@/lib/repositories/siteFloorplanRepository';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse the multipart form data
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const floorplanRepository = new SiteFloorplanRepository();

  // Validate site ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }

  const siteId = parseInt(id);
  if (isNaN(siteId)) {
    return res.status(400).json({ error: 'Site ID must be a number' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all floorplans for the site
        const floorplans = await floorplanRepository.findBySiteId(siteId);

        // Add public URLs to the response
        const floorplansWithUrls = floorplans.map(floorplan => ({
          ...floorplan,
          public_url: floorplanRepository.getPublicUrl(floorplan.image_path)
        }));

        res.status(200).json(floorplansWithUrls);
        break;

      case 'POST':
        // Upload a new floorplan
        const { files } = await parseForm(req);

        // Get the uploaded file
        const fileArray = files.file;
        if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploadedFile = Array.isArray(fileArray) ? fileArray[0] : fileArray;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!uploadedFile.mimetype || !allowedTypes.includes(uploadedFile.mimetype)) {
          return res.status(400).json({
            error: 'Invalid file type. Only PNG, JPG, and JPEG are allowed.'
          });
        }

        // Read the file buffer
        const fileBuffer = fs.readFileSync(uploadedFile.filepath);
        const originalFilename = uploadedFile.originalFilename || 'floorplan.png';
        const mimeType = uploadedFile.mimetype || 'image/png';

        // Upload to Supabase storage
        const imagePath = await floorplanRepository.uploadImage(fileBuffer, originalFilename, mimeType, siteId);

        // Save the record to database
        const newFloorplan = await floorplanRepository.create(siteId, imagePath);

        // Clean up temporary file
        fs.unlinkSync(uploadedFile.filepath);

        res.status(201).json({
          ...newFloorplan,
          public_url: floorplanRepository.getPublicUrl(newFloorplan.image_path)
        });
        break;

      case 'DELETE':
        // Delete a floorplan
        const { floorplanId } = req.query;

        if (!floorplanId || Array.isArray(floorplanId)) {
          return res.status(400).json({ error: 'Invalid floorplan ID' });
        }

        const floorplanIdNum = parseInt(floorplanId);
        if (isNaN(floorplanIdNum)) {
          return res.status(400).json({ error: 'Floorplan ID must be a number' });
        }

        await floorplanRepository.delete(floorplanIdNum);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Floorplan API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withAuth(handler);
