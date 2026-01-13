# 📊 Weighted Clinical Score (WCS) Algorithm

## Overview

The DermaVision AI app uses a sophisticated **Weighted Clinical Score (WCS)** algorithm that combines AI predictions with symptomatic support and safety overrides.

---

## 🧮 Mathematical Formula

```
WCS = (P_AI × W_AI) + Σ(S_i × W_S_i)

With Critical Override:
if S_Critical = True → WCS = max(WCS, 0.75)

Final Score:
Risk Score = clamp(WCS, 0, 1)
```

Where:
- `P_AI` = AI Primary Prediction (0-1)
- `W_AI` = AI Weight (0.7 = 70%)
- `S_i` = Symptom Value (0 or 1)
- `W_S_i` = Symptom Weight
- `S_Critical` = Bleeding OR Rapid Growth present

---

## ⚖️ Weights Configuration

### **AI Weight (Primary Driver)**
- **W_AI = 0.7 (70%)**
- Rationale: AI analysis is the most objective and reliable indicator

### **Symptom Weights (Clinical Support)**
- **W_ITCH = 0.10 (10%)** - Minor symptom
- **W_BLEED = 0.15 (15%)** - Critical symptom
- **W_GROWTH = 0.15 (15%)** - Critical symptom

**Total symptom weight: 30% maximum** (if all symptoms present)

---

## 🎯 How It Works

### **Step 1: AI Primary Prediction (P_AI)**

The Convolutional Neural Network analyzes the uploaded image and outputs probabilities for each class:

| Class | Risk Contribution |
|-------|-------------------|
| 0_Normal | 0% |
| 1_Fungal | 30% |
| 2_Inflammatory | 40% |
| 3_Benign | 20% |
| 4_Malignant | 80% |

**Weighted average calculation:**
```
P_AI = Σ(class_probability × class_risk_score)
```

**Example:**
- Malignant: 85% × 0.80 = 0.68
- Benign: 10% × 0.20 = 0.02
- Normal: 5% × 0.00 = 0.00
- **P_AI = 0.70 (70%)**

### **Step 2: Symptom Support**

User-reported symptoms add clinical context:

**Symptom Values (S_i):**
- `S_itch` = 1 if itching, 0 otherwise
- `S_bleed` = 1 if bleeding/crusting, 0 otherwise
- `S_growth` = 1 if rapid growth, 0 otherwise

**Weighted Contribution:**
```
Symptom_Score = (S_itch × 0.10) + (S_bleed × 0.15) + (S_growth × 0.15)
```

### **Step 3: Combined Score**

```
WCS_raw = (P_AI × 0.7) + Symptom_Score
```

**Example:**
- P_AI = 0.70
- S_itch = 1, S_bleed = 0, S_growth = 1
- WCS_raw = (0.70 × 0.7) + (1 × 0.10) + (0 × 0.15) + (1 × 0.15)
- WCS_raw = 0.49 + 0.10 + 0 + 0.15
- **WCS_raw = 0.74 (74%)**

### **Step 4: Critical Safety Override**

**The Safety Veto Rule:**

If bleeding OR rapid growth is present:
```
WCS = max(WCS_raw, 0.75)
```

This ensures:
- ✅ Critical symptoms **never** result in "Safe" classification
- ✅ Minimum 75% risk enforced (Red Zone - Danger)
- ✅ Patient safety prioritized over AI confidence

**Example (Override Triggered):**
- AI says: Normal (0%)
- Symptoms: Bleeding = Yes
- WCS_raw = (0 × 0.7) + (0 × 0.10) + (1 × 0.15) + (0 × 0.15) = 0.15
- **Override Applied:** WCS = max(0.15, 0.75) = **0.75 (75%)**
- Result: **RED - Danger** (even though AI said "Normal")

**Example (No Override):**
- WCS_raw = 0.74 (from Step 3)
- Critical symptoms present but WCS_raw already ≥ 0.75
- **No override needed:** WCS = 0.74

Wait, that's wrong. Let me recalculate...

Actually if bleeding OR growth is present and WCS_raw < 0.75, then override to 0.75.
If WCS_raw ≥ 0.75 already, keep WCS_raw.

In the example above, WCS_raw = 0.74, critical symptom (growth) is present, so:
- **Override Applied:** WCS = max(0.74, 0.75) = **0.75 (75%)**

### **Step 5: Final Clamp**

Ensure score stays within valid range:
```
Final_Risk_Score = clamp(WCS, 0, 1)
```

---

## 🚦 Traffic Light System

Final score maps to traffic light zones:

| Risk Score | Zone | Label | Action |
|------------|------|-------|--------|
| **71-100%** | 🔴 **RED** | Danger - See Specialist Urgently | Visit hospital/specialist ASAP |
| **31-70%** | 🟡 **YELLOW** | Caution - Visit Local Clinic | Visit clinic within 1-2 weeks |
| **0-30%** | 🟢 **GREEN** | Safe - Normal Spot | Monitor for changes |

---

## 📝 Complete Example Walkthrough

### **Scenario: Suspicious Mole with Bleeding**

**Input:**
- Uploaded image of irregular mole
- Symptoms: Itching = No, Bleeding = Yes, Growth = No

**Step 1: AI Analysis**
```
Model predictions:
- 4_Malignant: 45%
- 3_Benign: 30%
- 2_Inflammatory: 15%
- 1_Fungal: 8%
- 0_Normal: 2%

P_AI = (0.45 × 0.80) + (0.30 × 0.20) + (0.15 × 0.40) + (0.08 × 0.30) + (0.02 × 0.00)
P_AI = 0.36 + 0.06 + 0.06 + 0.024 + 0
P_AI = 0.504 (50.4%)
```

**Step 2: Symptoms**
```
S_itch = 0
S_bleed = 1 (CRITICAL!)
S_growth = 0

Symptom_Score = (0 × 0.10) + (1 × 0.15) + (0 × 0.15) = 0.15
```

**Step 3: WCS Calculation**
```
WCS_raw = (0.504 × 0.7) + 0.15
WCS_raw = 0.353 + 0.15
WCS_raw = 0.503 (50.3%)
```

**Step 4: Critical Override**
```
hasCriticalSymptoms = True (bleeding present)
WCS = max(0.503, 0.75)
WCS = 0.75 (75%)
```

**Step 5: Traffic Light**
```
Final_Risk_Score = 0.75 (75%)
Zone = RED (≥ 71%)
Label = "Danger - See Specialist Urgently"
```

**Console Output:**
```
📊 Weighted Clinical Score Calculation:
   P_AI (AI Prediction): 50.4%
   W_AI (AI Weight): 0.7
   Symptoms: Itch=0, Bleed=1, Growth=0
   WCS_raw = (0.50 × 0.7) + (0 × 0.10) + (1 × 0.15) + (0 × 0.15) = 0.503
   ⚠️ Critical Override Applied: max(0.503, 0.75) = 0.75
   Final Risk Score: 75.0%
```

**Results Screen Shows:**
- AI Analysis (70% weight): **50%**
- Symptoms Added (30% weight):
  - Itching: 0%
  - Bleeding: **+15%** ⚠️ CRITICAL
  - Growth: 0%
- **Critical Override: Minimum 75% enforced** 🛡️
- **Total Risk: 75%** 🔴

---

## 🔬 Design Rationale

### **Why 70% AI Weight?**
- AI is objective and consistent
- Trained on thousands of images
- Primary diagnostic tool

### **Why 30% Symptom Weight?**
- Symptoms provide important clinical context
- Some conditions (e.g., fungal) present with itching
- Bleeding/growth are critical warning signs
- Balances AI with patient-reported data

### **Why Critical Override at 75%?**
- Bleeding and rapid growth are **red flags** in dermatology
- Even if AI is confident it's "normal," these symptoms require medical evaluation
- Patient safety >> AI confidence
- Forces RED zone classification (≥71%)

### **Why These Specific Weights?**
Based on clinical knowledge:
- **Itching (10%):** Common in many benign conditions
- **Bleeding (15%):** Strong indicator of malignancy or severe inflammation
- **Rapid Growth (15%):** Classic melanoma warning sign (ABCDE rule - "Evolving")

---

## 🎓 Clinical Knowledge Base Integration

The algorithm implicitly uses clinical knowledge:

| AI Prediction | + Symptom | = Confidence Increase |
|---------------|-----------|----------------------|
| Fungal | Itching | ✅ Supports diagnosis |
| Malignant | Bleeding | ✅ Critical flag |
| Normal | Bleeding | ⚠️ **Override triggered** |

---

## 🛡️ Safety Features

1. **Never Ignore Critical Symptoms**
   - Bleeding/Growth always trigger ≥75% risk
   - Prevents false negatives

2. **AI as Primary, Not Sole Arbiter**
   - 70% weight respects AI capability
   - 30% symptom weight acknowledges limitations

3. **Transparent Calculation**
   - Full breakdown shown in results
   - User sees exactly how score was computed

4. **Conservative Thresholds**
   - Red zone starts at 71%
   - Critical override at 75%
   - Errs on side of caution

---

## 🚀 Implementation

**Location:** `/App.tsx` - `handleAnalyze()` function

**Key Variables:**
```typescript
const P_AI = scanSession.ai_malignant_prob;
const W_AI = 0.7;
const W_ITCH = 0.10;
const W_BLEED = 0.15;
const W_GROWTH = 0.15;
```

**Calculation:**
```typescript
const WCS_raw = (P_AI * W_AI) + 
                (S_itch * W_ITCH) + 
                (S_bleed * W_BLEED) + 
                (S_growth * W_GROWTH);

let WCS = WCS_raw;
if (hasCriticalSymptoms) {
  WCS = Math.max(WCS_raw, 0.75);
}

const final_risk_score = Math.min(1.0, Math.max(0, WCS));
```

---

## 📊 Console Logging

Every calculation is logged for debugging:

```
🤖 Running AI analysis on uploaded image...
🔍 Running inference on image...
✅ Inference complete:
   Top prediction: 4_Malignant (45.0%)
   AI base risk: 50.4%
   All predictions: 4_Malignant: 45.0%, 3_Benign: 30.0%, ...

📊 Weighted Clinical Score Calculation:
   P_AI (AI Prediction): 50.4%
   W_AI (AI Weight): 0.7
   Symptoms: Itch=0, Bleed=1, Growth=0
   WCS_raw = (0.50 × 0.7) + (0 × 0.10) + (1 × 0.15) + (0 × 0.15) = 0.503
   ⚠️ Critical Override Applied: max(0.503, 0.75) = 0.75
   Final Risk Score: 75.0%
```

---

## ✅ Advantages Over Simple Additive Approach

### **Old "Safety Veto" Algorithm:**
```
risk = ai_base + itch(+0.15) + bleed(+0.45) + growth(+0.35)
if bleed OR growth: risk = max(risk, 0.75)
```

**Problems:**
- AI treated equally to symptoms (no weighting)
- Symptom values arbitrary (+0.45 for bleeding?)
- No mathematical justification

### **New WCS Algorithm:**
```
WCS = (P_AI × 0.7) + (S_i × W_S_i)
if critical: WCS = max(WCS, 0.75)
```

**Benefits:**
- ✅ AI is primary driver (70% weight) - mathematically sound
- ✅ Symptoms provide clinical support (30% weight total)
- ✅ Weights reflect clinical importance
- ✅ Formula is interpretable and adjustable
- ✅ Aligns with medical decision-making process

---

## 🎯 Summary

The Weighted Clinical Score algorithm:
1. **Respects AI capability** (70% weight)
2. **Incorporates clinical context** (30% symptoms)
3. **Enforces patient safety** (critical override)
4. **Provides transparency** (full calculation visible)
5. **Balances accuracy and caution**

This makes DermaVision AI both **clinically sound** and **rural-accessible**! 🚀
