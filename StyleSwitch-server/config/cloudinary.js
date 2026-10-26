import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured =
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== "your_cloudinary_cloud_name" &&
  apiKey !== "your_cloudinary_api_key";

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log("Cloudinary configured with cloud:", cloudName);
} else {
  console.log("Cloudinary credentials are mock or not set. Running with fallback image hosting mode.");
}

/**
 * Uploads an image (base64 data URI or remote URL) to Cloudinary.
 * If Cloudinary is not configured or fails, returns original string as fallback.
 */
export const uploadToCloudinary = async (imageString, folder = "styleswitch_clothes") => {
  if (!imageString) return "";

  // If already a hosted URL (http/https) and not a data URI, keep it as is
  if (typeof imageString === "string" && imageString.startsWith("http") && !imageString.startsWith("data:")) {
    return imageString;
  }

  if (!isConfigured) {
    // If not configured, return the data URI or image string
    return imageString;
  }

  try {
    const uploadRes = await cloudinary.uploader.upload(imageString, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
    return uploadRes.secure_url;
  } catch (error) {
    console.warn("Cloudinary upload failed, falling back to original image string:", error.message);
    return imageString;
  }
};

export default cloudinary;
