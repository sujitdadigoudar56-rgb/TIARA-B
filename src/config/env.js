require('dotenv').config();

const env = {
  port: process.env.PORT || 4000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tiara',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  // Comma-separated list, e.g. "http://localhost:3000,https://tiara-f.vercel.app".
  clientOrigins: (
    process.env.CLIENT_ORIGIN ||
    'http://localhost:3000,http://localhost:3001,https://tiara-f.vercel.app,https://tiara-a.vercel.app'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || 'development',
  // Vercel sets this on every deployment (prod + preview) regardless of NODE_ENV — used to tell
  // "genuinely cross-site over HTTPS" (tiara-a.vercel.app calling tiara-b.vercel.app) apart from
  // local dev (different localhost ports, same site, plain HTTP). See common/cookies.js.
  isVercel: Boolean(process.env.VERCEL),
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET,
};

module.exports = env;
