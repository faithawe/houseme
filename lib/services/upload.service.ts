/**
 * Cloudinary signed uploads, delete, and transform URLs.
 */
export const uploadService = {
  async sign(_filename: string): Promise<never> {
    throw new Error("uploadService.sign is not implemented");
  },
  async delete(_publicId: string): Promise<never> {
    throw new Error("uploadService.delete is not implemented");
  },
};
