# ⚠️ Binary Files Not Supported

This directory was originally for local model files, but binary files (`.bin`) cannot be uploaded to this environment.

## ✅ Solution: Use Teachable Machine Cloud Hosting

Instead of uploading files here, use the cloud-hosted model approach:

1. Upload your model to Teachable Machine cloud
2. Copy the shareable URL
3. Paste it in `/utils/modelInference.ts` (line 6)

See `/MODEL_UPLOAD_INSTRUCTIONS.md` for complete step-by-step guide.

---

**Why this is better:**
- ✅ No file size limits
- ✅ No binary file upload issues
- ✅ Model updates automatically when you retrain
- ✅ Hosted by Google (reliable & fast)
