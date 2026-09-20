const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const env = require("./env");

const s3 = new S3Client({
  region: env.awsRegion,
  credentials: { accessKeyId: env.awsAccessKeyId, secretAccessKey: env.awsSecretAccessKey },
});

// Bucket has a public-read policy already attached (confirmed: no object ACL needed/available —
// this IAM user only has Put/Get, not ACL or delete permissions).
async function uploadImage(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({ Bucket: env.awsS3Bucket, Key: key, Body: buffer, ContentType: contentType })
  );
  return `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`;
}

module.exports = { uploadImage };
