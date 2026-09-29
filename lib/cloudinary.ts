import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "mock_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "mock_secret",
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder = "blog_builder"
): Promise<{ url: string; publicId: string }> {
  if (
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_KEY !== "your_cloudinary_api_key"
  ) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" },
            { width: 1600, crop: "limit" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  const base64Data = fileBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Data}`;
  return {
    url: dataUrl,
    publicId: `mock_${Date.now()}`,
  };
}

export { cloudinary };
