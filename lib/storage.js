import path from "path";
import fs from "fs/promises";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Client() {
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT; // needed for R2 or custom S3
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey || !process.env.S3_BUCKET) return null;

  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: { accessKeyId, secretAccessKey }
  });
}

export async function uploadResume({ buffer, originalName }) {
  const safeName = `${Date.now()}_${originalName}`.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Try S3/R2 if configured
  const s3 = getS3Client();
  if (s3) {
    const bucket = process.env.S3_BUCKET;
    const key = `resumes/${safeName}`;
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "application/octet-stream"
    }));

    const publicBase = process.env.S3_PUBLIC_BASE_URL; 
    // If public base URL not provided, return s3:// style reference (still stored in DB)
    const url = publicBase ? `${publicBase.replace(/\/$/,"")}/${key}` : `s3://${bucket}/${key}`;
    return { provider: "s3", fileName: originalName, url };
  }

  // Fallback local/dev upload (works locally)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, safeName), buffer);
  return { provider: "local", fileName: originalName, url: `/uploads/${safeName}` };
}
