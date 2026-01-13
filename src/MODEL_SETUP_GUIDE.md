# 🤖 DermaVision AI - Model Integration Guide

## ✅ Integration Status

Your app is now **fully configured** to use your Google Teachable Machine model! 

The code is ready and waiting for your model files. Follow the steps below to complete the setup.

---

## 📋 Step-by-Step Instructions

### **Step 1: Export Your Model from Teachable Machine**

1. **Open your Teachable Machine project** at https://teachablemachine.withgoogle.com/
2. Click the **"Export Model"** button
3. In the export dialog, select the **"TensorFlow.js"** tab (NOT TensorFlow Lite)
4. Choose **"Download"** option (not "Upload")
5. Click **"Download my model"**
6. A ZIP file will be downloaded containing:
   - `model.json` - Model architecture
   - `weights.bin` (or multiple shard files like `group1-shard1of1.bin`) - Model weights
   - `metadata.json` - Class labels (optional)

---

### **Step 2: Extract the Model Files**

1. **Unzip the downloaded file**
2. You should see these files:
   ```
   model.json
   weights.bin (or group1-shard1of1.bin)
   metadata.json
   ```

---

### **Step 3: Upload Model Files to Your App**

**IMPORTANT:** You need to place these files in a `/public/model/` directory.

Since you're using Figma Make, you'll need to create this structure:

1. Create a folder called `public` in your project root (if it doesn't exist)
2. Inside `public`, create a folder called `model`
3. Place your extracted files inside `/public/model/`:
   ```
   /public/model/model.json
   /public/model/weights.bin (or group1-shard1of1.bin)
   /public/model/metadata.json (optional)
   ```

**Note:** If you're using a different development environment, you can also:
- Use a CDN to host your model files
- Update the `MODEL_URL` in `/utils/modelInference.ts` to point to your hosted model

---

### **Step 4: Verify the Setup**

Once you've uploaded the model files:

1. **Refresh your app**
2. **Open browser DevTools** (F12 or right-click → Inspect)
3. **Check the Console** for these messages:
   ```
   🚀 Initializing AI model...
   ✅ Model loaded successfully
   ✅ Model warmup complete
   ✅ AI model ready
   ```

If you see these ✅ messages, your model is working!

---

### **Step 5: Test the Integration**

1. Click **"Start New Scan"**
2. **Upload a test image** of a skin lesion
3. Check the console for:
   ```
   🤖 Running AI analysis on uploaded image...
   🔍 Running inference on image...
   ✅ Inference complete:
      Top prediction: Normal (85.3%)
      AI base risk: 5.2%
      All predictions: Normal: 85.3%, Fungal: 8.1%, ...
   ```

4. Continue through the symptom checklist
5. The final risk score will now use **real AI predictions** instead of the mock 0.1 value!

---

## 🎯 How It Works

### **AI Risk Mapping**

Your 5 Teachable Machine classes are mapped to base risk scores:

| Class | Base Risk | Traffic Light Zone |
|-------|-----------|-------------------|
| **Normal** | 0% | Green (Safe) |
| **Benign** | 20% | Green (Safe) |
| **Fungal** | 30% | Yellow (Caution) |
| **Inflammatory** | 40% | Yellow (Caution) |
| **Malignant** | 80% | Red (Danger) |

### **Safety Veto Algorithm**

The final risk calculation follows your existing algorithm:

```
final_risk = ai_base_risk + symptom_weights

Where:
- ai_base_risk = Weighted average from all 5 class probabilities
- symptom_weights:
  - Itch: +15%
  - Bleeding: +45% (CRITICAL)
  - Rapid Growth: +35% (CRITICAL)

Safety Veto Rule:
- IF bleeding OR growth is present → Minimum risk = 75% (Red Zone)
- ALWAYS clamp final risk to max 100%
```

### **Example Calculation**

```
Image uploaded → AI predicts:
  Normal: 10%
  Fungal: 15%
  Inflammatory: 20%
  Benign: 40%
  Malignant: 15%

ai_base_risk = (0.0×0.1) + (0.3×0.15) + (0.4×0.2) + (0.2×0.4) + (0.8×0.15)
             = 0 + 0.045 + 0.08 + 0.08 + 0.12
             = 0.325 (32.5% base risk)

User selects symptoms: Itch ✓, Bleeding ✗, Growth ✗
symptom_weights = 0.15 + 0 + 0 = 0.15

raw_risk = 0.325 + 0.15 = 0.475 (47.5%)

Safety Veto: No bleeding/growth, so no minimum enforcement
final_risk = 47.5%

Traffic Light: Yellow - "Caution - Visit Local Clinic"
```

---

## 🔧 Troubleshooting

### **Error: "Failed to load model"**

**Problem:** Model files not found or incorrect path

**Solutions:**
1. Verify files are in `/public/model/` directory
2. Check file names match exactly:
   - `model.json` (NOT `Model.json` or `model.JSON`)
   - `weights.bin` or `group1-shard1of1.bin`
3. Ensure files were uploaded correctly (not corrupted)
4. Check browser console for specific error messages

---

### **Error: "CORS policy blocked"**

**Problem:** Browser blocking model files due to CORS

**Solutions:**
1. If using a CDN, ensure CORS headers are enabled
2. Serve model files from the same domain as your app
3. If testing locally, use a local server (not `file://` protocol)

---

### **Model loads but predictions are wrong**

**Problem:** Image preprocessing mismatch

**Verification:**
- Teachable Machine uses 224×224 images ✅ (already configured)
- Normalization: (pixel / 127.5) - 1 ✅ (already configured)
- RGB color format ✅ (already configured)

If issues persist:
1. Test with the same images you trained on
2. Compare predictions with Teachable Machine preview
3. Check console logs for prediction probabilities

---

### **Model too slow**

**Problem:** Large model causing lag

**Solutions:**
1. **Use model quantization** when exporting (reduces file size)
2. **Run inference after image upload** (already implemented)
3. Consider using a smaller/faster model architecture
4. Enable GPU acceleration (TensorFlow.js will auto-detect WebGL)

---

## 📊 Advanced: Adjusting Risk Mapping

If you want to adjust the risk scores for each class, edit `/utils/modelInference.ts`:

```typescript
// Current mapping (line ~17)
const CLASS_RISK_SCORES = {
  Normal: 0.0,         // No base risk
  Fungal: 0.30,        // Yellow zone (mild infection)
  Inflammatory: 0.40,  // Yellow zone (needs attention)
  Benign: 0.20,        // Green-Yellow (low risk)
  Malignant: 0.80      // Red zone (high risk)
};

// Example: Make system more conservative (higher risk scores)
const CLASS_RISK_SCORES = {
  Normal: 0.05,        // Slight caution even for normal
  Fungal: 0.40,        // Increased risk
  Inflammatory: 0.50,  // Increased risk
  Benign: 0.30,        // Increased risk
  Malignant: 0.90      // Very high risk
};
```

---

## 🎉 Success Checklist

- [ ] Exported model from Teachable Machine as TensorFlow.js
- [ ] Placed files in `/public/model/` directory
- [ ] Verified model loads (check console for ✅ messages)
- [ ] Tested with sample image
- [ ] AI predictions appear in console logs
- [ ] Final risk score uses real AI values (not 0.1 mock)
- [ ] Traffic light system works with AI + symptoms
- [ ] Safety Veto enforces minimum 75% for bleeding/growth

---

## 🚀 You're All Set!

Once you complete **Step 3** (uploading model files), your DermaVision AI will have **real AI-powered skin lesion classification** integrated with your Safety Veto algorithm!

The system will:
1. ✅ Load model on app startup
2. ✅ Run inference when user uploads image
3. ✅ Combine AI predictions with symptom inputs
4. ✅ Apply Safety Veto rules
5. ✅ Display clear traffic light results

**Need help?** Check the browser console for detailed logs at every step!
