# Model Training Experiments Log

## Baseline (Current FastAI Tabular)

**Commit:** `3eab1c75f1aec83107e766e3aa64d7ab806319c2`  
**Training Command:** `python training/train_fastai.py`  
**Date:** 2026-02-16

### Dataset
- **Total rows:** 384,691 (after price sanitization)
- **Train:** 245,242 (63.8%)
- **Validation:** 43,277 (11.2%)
- **Test:** 96,172 (25.0%)
- **Split Strategy:** Random (seed=42)

### Baseline Metrics

| Set | MAE | RMSE | MAPE | R2 | Within ¬±10% | Within ¬±15% |
|-----|-----|------|------|----|-------------|-------------|
| **Validation** | $2,725 | $5,734 | 29.3% | 0.8537 | 51.0% | 64.4% |
| **Test** | $2,731 | $5,724 | 28.7% | 0.8582 | 51.0% | 64.4% |

### Model Configuration
- **Architecture:** FastAI Tabular (layers [400, 200], dropout 0.3, weight decay 1e-2)
- **Training:** 30 epochs, one-cycle LR (max 3e-3), early stopping (patience=3)
- **Best epoch:** 27 (valid_loss: 0.134)
- **Loss:** MSE (log space)
- **Target:** log1p(price)

### Observations
- ‚úÖ Excellent generalization (validation ‚âà test)
- ‚úÖ Strong improvement vs legacy baseline (MAE: $3,269 ‚Üí $2,725)
- ‚ö†Ô∏è RMSE driven by tail errors (36 predictions clipped to [500, 250000])
- ‚ö†Ô∏è Preprocessing leakage: median fill applied before train/val/test split

---

## Experiment 1: Fix Preprocessing Leakage

**Goal:** Remove median fill before split; rely on FastAI FillMissing (train-only)

**Changes:**
- Remove manual median fill loop (lines 137-140)
- Ensure FastAI FillMissing computes stats from train split only

**Expected Impact:** Slight improvement in generalization; more honest evaluation

---

## Experiment 2: Error Analysis ‚úÖ DONE

**Goal:** Identify where large errors (RMSE drivers) cluster

**Tool:** `python training/analyze_errors.py`

**Results (2026-02-17):**
- Validation: 12,249 samples (after dropping NaN), MAE $2,396, RMSE $4,653, P95 $7,709, P99 $16,779
- Test: 27,535 samples, MAE $2,424, RMSE $5,013, P95 $7,839, P99 $17,965
- **Price decile 9 (highest)** has largest mean error ($5,873) ‚Äî tail errors cluster in high-price vehicles
- **Worst make/models:** rare/niche (e.g. jaguar xk 150, toyota tundra limited 4x4) with very few samples
- **Worst regions:** lewiston/clarkston, pierre, san angelo (smaller markets)

**Output:** `training/error_report.md`, `training/error_cases_validation.csv`, `training/error_cases_test.csv`

---

## Experiment 3: Robust Loss (Huber)

**Goal:** Reduce sensitivity to outliers while preserving MAE

**Configuration:** `LOSS_TYPE = "huber"` (delta=1.0)

**Metrics to Compare:**
- MAE, RMSE, within¬±10/15 (should maintain or improve)
- 95th/99th percentile absolute error (target: reduce)

---

## Experiment 4: Ensemble (3 models)

**Goal:** Reduce variance and tail risk via averaging

**Configuration:** `ENSEMBLE_SIZE = 3` (seeds: 42, 52, 62)

**Artifacts:** `export_seed42.pkl`, `export_seed52.pkl`, `export_seed62.pkl`

**Inference:** Average predictions from all 3 models

---

## Experiment 5: Group Split

**Goal:** Assess robustness under group-based split (by manufacturer_model)

**Configuration:** `SPLIT_STRATEGY = "group"`

**Comparison:** Random vs Group split performance

---

## Results Summary

| Experiment | Status | Notes |
|------------|--------|--------|
| 1. Leakage fix | ‚úÖ In code | Median fill removed; FillMissing train-only |
| 2. Error analysis | ‚úÖ Done | Report + CSVs generated; high-price decile + rare make/model drive tail errors |
| 3. Robust loss (Huber) | Pending | Run: `LOSS_TYPE=huber python training/train_fastai.py` |
| 4. Ensemble (3 models) | Pending | Run: `ENSEMBLE_SIZE=3 python training/train_fastai.py` |
| 5. Group split | Pending | Run: `SPLIT_STRATEGY=group python training/train_fastai.py` |

---

## Next Steps (Run These)

1. **Train with Huber loss** (reduce tail sensitivity):
   ```bash
   LOSS_TYPE=huber python training/train_fastai.py
   ```
   Then compare `server/models/training_metrics.json` (RMSE, P95, P99) to baseline.

2. **Train ensemble** (reduce variance):
   ```bash
   ENSEMBLE_SIZE=3 python training/train_fastai.py
   ```
   Ensures `export_seed42.pkl`, `export_seed52.pkl`, `export_seed62.pkl` exist; server will average predictions.

3. **Optional: group split** (assess robustness):
   ```bash
   SPLIT_STRATEGY=group python training/train_fastai.py
   ```
   Compare validation/test metrics to random split.

4. **Re-run error analysis** after any new training:
   ```bash
   python training/analyze_errors.py
   ```

---
## Run (auto-appended)

**Commit:** `8ad3d08ad73d42dd00d973247be0c0a7d8104920`  
**Seed:** 42  
**Split:** random (GROUP_KEY=manufacturer_model)  
**Loss:** mse  
**Training time:** 3261.9s  
**Hardware:** Intel64 Family 6 Model 140 Stepping 1, GenuineIntel cores=8  
**Date:** 2026-02-17T21:17:11.749370

| Set | MAE | RMSE | Unclipped RMSE | P95 | P99 | Within ¬±10% | ¬±15% |
|-----|-----|------|----------------|-----|-----|------------|------|
| Val | $2,687 | $5,798 | $5,858 | $9,012 | $22,328 | 51.4% | 64.4% |

---
## Run (auto-appended)

**Commit:** `8ad3d08ad73d42dd00d973247be0c0a7d8104920`  
**Seed:** 42  
**Split:** random (GROUP_KEY=manufacturer_model)  
**Loss:** huber  
**Training time:** 1006.4s  
**Hardware:** Intel64 Family 6 Model 140 Stepping 1, GenuineIntel cores=8  
**Date:** 2026-02-17T22:14:10.298286

| Set | MAE | RMSE | Unclipped RMSE | P95 | P99 | Within ¬±10% | ¬±15% |
|-----|-----|------|----------------|-----|-----|------------|------|
| Val | $4,485 | $9,834 | $9,684,425,009,299,500,040,192 | $14,345 | $33,712 | 29.6% | 44.5% |

## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 10:27  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $230,542 |
| RMSE | $231,043 |
| MAPE | 2894.5% |
| R≤ | -230.0928 |
| Within ±10% | 0.0% |
| Within ±15% | 0.0% |
| P95 abs error | $247,100 |
| P99 abs error | $249,055 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 10:30  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $63,474 |
| RMSE | $64,966 |
| MAPE | 623.5% |
| R≤ | -17.2714 |
| Within ±10% | 0.1% |
| Within ±15% | 0.1% |
| P95 abs error | $82,381 |
| P99 abs error | $89,152 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 10:33  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $63,474 |
| RMSE | $64,966 |
| MAPE | 623.5% |
| R≤ | -17.2714 |
| Within ±10% | 0.1% |
| Within ±15% | 0.1% |
| P95 abs error | $82,381 |
| P99 abs error | $89,152 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 10:37  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $63,474 |
| RMSE | $64,966 |
| MAPE | 623.5% |
| R≤ | -17.2714 |
| Within ±10% | 0.1% |
| Within ±15% | 0.1% |
| P95 abs error | $82,381 |
| P99 abs error | $89,152 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 10:41  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $2,921 |
| RMSE | $5,950 |
| MAPE | 25.8% |
| R≤ | 0.8467 |
| Within ±10% | 45.9% |
| Within ±15% | 60.6% |
| P95 abs error | $9,670 |
| P99 abs error | $21,960 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 12:20  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $230,542 |
| RMSE | $231,043 |
| MAPE | 2894.5% |
| R≤ | -230.0928 |
| Within ±10% | 0.0% |
| Within ±15% | 0.0% |
| P95 abs error | $247,100 |
| P99 abs error | $249,055 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 12:22  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $230,542 |
| RMSE | $231,043 |
| MAPE | 2894.5% |
| R≤ | -230.0928 |
| Within ±10% | 0.0% |
| Within ±15% | 0.0% |
| P95 abs error | $247,100 |
| P99 abs error | $249,055 |


---
## Run (auto-appended)

**Commit:** `f1c7f28543b80b5c1972cc59daf1331c175c801d`  
**Seed:** 42  
**Split:** random (GROUP_KEY=manufacturer_model)  
**Loss:** mse  
**Training time:** 3369.9s  
**Hardware:** Intel64 Family 6 Model 140 Stepping 1, GenuineIntel cores=8  
**Date:** 2026-02-18T13:32:05.613379

| Set | MAE | RMSE | Unclipped RMSE | P95 | P99 | Within ¬±10% | ¬±15% |
|-----|-----|------|----------------|-----|-----|------------|------|
| Val | $2,651 | $5,798 | $6,568 | $8,885 | $21,795 | 51.9% | 64.9% |

---
## Run (auto-appended)

**Commit:** `f1c7f28543b80b5c1972cc59daf1331c175c801d`  
**Seed:** 42  
**Split:** random (GROUP_KEY=manufacturer_model)  
**Loss:** mse  
**Training time:** 2847.1s  
**Hardware:** Intel64 Family 6 Model 140 Stepping 1, GenuineIntel cores=8  
**Date:** 2026-02-18T14:13:25.201188

| Set | MAE | RMSE | Unclipped RMSE | P95 | P99 | Within ¬±10% | ¬±15% |
|-----|-----|------|----------------|-----|-----|------------|------|
| Val | $2,707 | $5,750 | $5,750 | $9,003 | $22,591 | 50.7% | 64.0% |

## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 14:22  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $2,582 |
| RMSE | $5,527 |
| MAPE | 25.1% |
| R≤ | 0.8677 |
| Within ±10% | 52.0% |
| Within ±15% | 65.8% |
| P95 abs error | $8,703 |
| P99 abs error | $20,942 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 14:24  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $2,582 |
| RMSE | $5,527 |
| MAPE | 25.1% |
| R≤ | 0.8677 |
| Within ±10% | 52.0% |
| Within ±15% | 65.8% |
| P95 abs error | $8,703 |
| P99 abs error | $20,942 |


## Blend evaluation (production 0.6 FastAI + 0.4 CatBoost)

**Evaluated:** 2026-02-18 14:53  
**Test set:** 96,172 samples (from split_indices.json)

| Metric | Test |
|--------|------|
| MAE | $2,582 |
| RMSE | $5,527 |
| MAPE | 25.1% |
| R≤ | 0.8677 |
| Within ±10% | 52.0% |
| Within ±15% | 65.8% |
| P95 abs error | $8,703 |
| P99 abs error | $20,942 |

