import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export async function uploadImageBuffer(buffer: Buffer): Promise<string> {
  if (!env.cloudinary.enabled) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'shopverse/products', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else if (!result?.secure_url) reject(new Error('Upload failed'));
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
