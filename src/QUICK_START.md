# 🎯 DermaVision AI - Quick Start Guide

## Your App is Ready! Just Connect Your Model

---

## ⚡ **3-Step Setup:**

### **📤 Step 1: Upload Model to Cloud**

Go to Teachable Machine and upload your trained model:

```
1. Visit: https://teachablemachine.withgoogle.com/
2. Open your trained project
3. Click: "Export Model"
4. Select: "Upload my model" tab  
5. Click: "Upload my model" button
6. Wait for upload... ⏳
7. Copy the URL shown (looks like: https://teachablemachine.withgoogle.com/models/abc123xyz/)
```

---

### **🔧 Step 2: Paste URL in Code**

```
1. Open: /utils/modelInference.ts
2. Find line 6: const TEACHABLE_MACHINE_URL = ...
3. Replace: PASTE_YOUR_MODEL_URL_HERE
4. With: Your copied URL (keep the trailing /)
5. Save file ✅
```

**Example:**
```typescript
// Line 6 in /utils/modelInference.ts
const TEACHABLE_MACHINE_URL = 'https://teachablemachine.withgoogle.com/models/abc123xyz/';
                             //  👆 Paste your URL here (with trailing /)
```

---

### **🎉 Step 3: Refresh & Test**

```
1. Hard refresh browser: Ctrl+Shift+R (Win) or Cmd+Shift+R (Mac)
2. Check console for: "✅ Model loaded successfully"
3. Upload a test skin image
4. Watch your AI predict: Normal/Fungal/Inflammatory/Benign/Malignant
```

---

## ✅ **Success Checklist:**

When it's working, you'll see:

- [ ] Console: "✅ Model loaded successfully"
- [ ] Console: "✅ AI ready for inference"  
- [ ] Welcome screen: Shows "AI Model Loaded" (green badge)
- [ ] Image upload: Shows predicted class name
- [ ] Risk score: Based on your model (not fallback 0.1)

---

## ❌ **Common Issues:**

**"Please configure your model URL"**
- You forgot to replace the placeholder URL
- Edit `/utils/modelInference.ts` line 6

**"Failed to load model"**
- URL is incorrect - copy it directly from Teachable Machine
- Model not uploaded to cloud yet
- Check internet connection

**Model loads but predictions are wrong**
- Verify class names match:
  - 0_Normal
  - 1_Fungal  
  - 2_Inflammatory
  - 3_Benign
  - 4_Malignant

---

## 📚 **Complete Documentation:**

- Full setup guide: `/MODEL_UPLOAD_INSTRUCTIONS.md`
- Architecture details: See code comments in `/utils/modelInference.ts`

---

## 🚀 **You're Done!**

After setup, your app will:
1. ✅ Run real AI predictions on uploaded images
2. ✅ Calculate accurate base risk using your model
3. ✅ Combine AI + symptoms with Safety Veto algorithm
4. ✅ Show Traffic Light risk assessment (Green/Yellow/Red)

Enjoy your DermaVision AI app! 🎉
