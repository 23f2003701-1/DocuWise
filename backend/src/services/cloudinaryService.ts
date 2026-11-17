import { cloudinary } from '../config/cloudinary';
import axios from 'axios';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  bytes: number;
}

/**
 * Upload a file to Cloudinary
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string
): Promise<CloudinaryUploadResult> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
  };
};

/**
 * Delete a file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
  } catch (error) {
    console.error(`Failed to delete file from Cloudinary: ${publicId}`, error);
    // Don't throw - allow the rest of the operation to continue
  }
};

/**
 * Download a file from a URL and return the buffer
 */
export const getFileBuffer = async (fileUrl: string): Promise<Buffer> => {
  const response = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
};
