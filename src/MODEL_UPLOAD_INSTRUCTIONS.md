# 🚀 Teachable Machine Model Setup Guide

## ⚠️ Important: Binary files (.bin) cannot be uploaded to this environment

Instead, we'll use **Teachable Machine's cloud hosting** - it's actually easier!

---

## ✅ **Quick Setup (3 Steps):**

### **Step 1: Upload Your Model to Teachable Machine Cloud**

1. Go to **https://teachablemachine.withgoogle.com/**
2. Open your trained project
3. Click **"Export Model"** button
4. Select **"Upload my model"** tab
5. Click **"Upload my model"** button (it will upload to Google's servers)
6. Wait for upload to complete
7. **Copy the shareable link** (it looks like: `https://teachablemachine.withgoogle.com/models/abc123xyz/`)

---

### **Step 2: Add Model URL to Code**

1. Open `/utils/modelInference.ts`
2. Find line 6 (starts with `const TEACHABLE_MACHINE_URL`)
3. Replace `PASTE_YOUR_MODEL_URL_HERE` with your copied link
4. **Important:** Keep the trailing slash `/` at the end!

**Example:**
```typescript
// BEFORE:
const TEACHABLE_MACHINE_URL = 'https://teachablemachine.withgoogle.com/models/PASTE_YOUR_MODEL_URL_HERE/';

// AFTER:
const TEACHABLE_MACHINE_URL = 'https://teachablemachine.withgoogle.com/models/abc123xyz/';
```

---

### **Step 3: Refresh Browser**

1. Save the file
2. Refresh your browser
3. Check console - you should see:
   ```
   ✅ Model loaded successfully
   ✅ AI ready for inference
   ```

---

## 🎯 **That's It!**

Your DermaVision AI app is now using your trained model! Upload a test image and watch it predict:
- 0_Normal
- 1_Fungal
- 2_Inflammatory
- 3_Benign
- 4_Malignant

---

## 📋 **What This Method Does:**

✅ **No file uploads needed** - Model is hosted by Google  
✅ **Works immediately** - Just paste the URL  
✅ **Always up-to-date** - Re-train and it updates automatically  
✅ **No size limits** - Binary weights are handled by Teachable Machine  

---

## 🔍 **Troubleshooting:**

### **Still seeing "Please configure your model URL"?**
- Make sure you replaced the placeholder URL
- Check you didn't accidentally remove the `/` at the end
- Save the file and hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### **Getting "Failed to load model" error?**
- Make sure your model is uploaded to Teachable Machine cloud
- Check the URL is correct (copy-paste it directly)
- Verify you have internet connection
- Try the URL in your browser - should show a JSON file

### **Model loads but predictions seem wrong?**
- Check the class names in console match your training:
  - 0_Normal
  - 1_Fungal
  - 2_Inflammatory
  - 3_Benign
  - 4_Malignant
- If class order is different, update `CLASS_RISK_SCORES` in `/utils/modelInference.ts`

---

## 🎉 **Success Indicators:**

✅ Console shows: "Model loaded successfully"  
✅ Console shows: "AI ready for inference"  
✅ When you upload image: Shows predicted class name  
✅ Risk calculation uses your model's predictions  

Your app is now powered by real AI! 🚀
