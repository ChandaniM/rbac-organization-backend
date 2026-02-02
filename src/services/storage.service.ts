import { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  CreateBucketCommand, 
  HeadBucketCommand, 
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: "http://localhost:4566", // LocalStack default
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
});

/**
 * Ensures a bucket exists, creates it if it doesn't.
 * In production, you'd usually provision this during tenant onboarding, 
 * not during the upload request.
 */
const ensureBucketExists = async (bucketName: string) => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    } else {
      throw error;
    }
  }
};

export const uploadToTenantStorage = async (file: Express.Multer.File, tenantId: string, role: string) => {
  // S3 buckets must be lowercase and follow specific naming rules
  const bucketName = `tenant-${tenantId.toLowerCase()}`;
  const key = `${role}/${Date.now()}-${file.originalname}`;
  
  await ensureBucketExists(bucketName);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  return { bucket: bucketName, key, fileName: file.originalname };
};

export const getTenantFiles = async (tenantId: string, role: string) => {
  const bucketName = `tenant-${tenantId.toLowerCase()}`;
  const prefix = `${role}/`;

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error: any) {
    if (error.name === "NoSuchBucket") return [];
    throw error;
  }
};

export const getFileStream = async (tenantId: string, role: string, key: string) => {
  const bucketName = `tenant-${tenantId.toLowerCase()}`;
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  const response = await s3Client.send(command);
  return {
    body: response.Body,
    contentType: response.ContentType,
  };
};

// --- NEW: Delete File ---
export const deleteTenantFile = async (
  tenantId: string,
  role: string,
  key: string
) => {
  if (!tenantId || !key) {
    throw new Error("tenantId and key are required");
  }

  // ✅ SECURITY: Ensure role-based isolation
  if (!key.startsWith(`${role}/`)) {
    throw new Error("Unauthorized file delete attempt");
  }

  const bucketName = `tenant-${tenantId.toLowerCase()}`;

  try {
    console.log("S3 DELETE", { bucketName, key });

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    return { success: true };
  } catch (error) {
    console.error("S3 delete failed:", error);
    throw error;
  }
};
