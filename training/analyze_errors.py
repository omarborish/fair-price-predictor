"""
Error Analysis Script for FastAI Model
======================================
Analyzes prediction errors; saves error_cases.csv, error_report.md, and training/figures/*.png.
Uses split_indices.json when available so splits match training.
"""
import json
import sys
from pathlib import Path
import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

OUTPUT_DIR = REPO_ROOT / "server" / "models"
ERROR_OUTPUT_DIR = REPO_ROOT / "training"
FIGURES_DIR = ERROR_OUTPUT_DIR / "figures"
FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def load_model_and_data():
    """Load exported model and prepare data (shared feature pipeline + split_indices)."""
    try:
        from fastai.tabular.all import load_learner  # type: ignore[reportMissingImports]
    except ImportError:
        print("[ERROR] FastAI not installed. Install with: pip install fastai")
        sys.exit(1)

    export_path = OUTPUT_DIR / "export.pkl"
    if not export_path.exists():
        print(f"[ERROR] Model not found: {export_path}")
        sys.exit(1)

    print(f"Loading model from {export_path}...")
    learn = load_learner(export_path)
    cat_names = learn.dls.cat_names
    cont_names = learn.dls.cont_names
    y_name = "log_price"

    data_path = REPO_ROOT / "vehicles.csv"
    if not data_path.exists():
        print(f"[ERROR] Data not found: {data_path}")
        sys.exit(1)

    df = pd.read_csv(data_path, low_memory=False)
    MIN_PRICE, MAX_PRICE = 500, 250_000
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df = df.dropna(subset=["price"])
    df = df[(df["price"] >= MIN_PRICE) & (df["price"] <= MAX_PRICE)].copy()

    from training.train_fastai import prepare_dataframe
    df = prepare_dataframe(df)

    # Use split_indices if available
    split_path = OUTPUT_DIR / "split_indices.json"
    if split_path.exists():
        split = json.loads(split_path.read_text())
        valid_idx = split["valid_idx"]
        test_idx = split["test_idx"]
    else:
        np.random.seed(42)
        n = len(df)
        idx = np.random.permutation(n)
        n_test = int(n * 0.25)
        n_valid = int((n - n_test) * 0.15)
        test_idx = idx[:n_test].tolist()
        valid_idx = idx[n_test : n_test + n_valid].tolist()

    df_valid = df.iloc[valid_idx].copy()
    df_test = df.iloc[test_idx].copy()
    return learn, df_valid, df_test, cat_names, cont_names, y_name


def analyze_errors(learn, df_set, set_name, cat_names, cont_names, y_name):
    """Analyze errors for a dataset."""
    print(f"\nAnalyzing {set_name} set ({len(df_set):,} samples)...")
    
    # Prepare data: only columns the model expects, drop rows with NaN (model's FillMissing was fit on train)
    required = [c for c in cat_names + cont_names + [y_name] if c in df_set.columns]
    test_df = df_set[required].copy()
    before = len(test_df)
    test_df = test_df.dropna(subset=required)
    if len(test_df) < before:
        print(f"  Dropped {before - len(test_df):,} rows with missing values (model expects no NaN in these cols)")
    test_dl = learn.dls.test_dl(test_df)
    
    # Get predictions (only for rows in test_df)
    preds_log, _ = learn.get_preds(dl=test_dl)
    preds_log = preds_log.numpy().reshape(-1)
    
    # Clip predictions
    MIN_PRICE = 500
    MAX_PRICE = 250_000
    log_min = np.log1p(MIN_PRICE)
    log_max = np.log1p(MAX_PRICE)
    preds_log_clipped = np.clip(preds_log, log_min, log_max)
    preds = np.expm1(preds_log_clipped)
    y_true = np.expm1(test_df[y_name].values)
    
    # Compute errors
    errors = preds - y_true
    abs_errors = np.abs(errors)
    pct_errors = (errors / (y_true + 1e-9)) * 100
    
    # Create analysis dataframe (same rows as test_df)
    analysis_df = df_set.loc[test_df.index].copy()
    analysis_df["predicted_price"] = preds
    analysis_df["true_price"] = y_true
    analysis_df["error"] = errors
    analysis_df["abs_error"] = abs_errors
    analysis_df["pct_error"] = pct_errors
    
    # Sort by absolute error (worst first)
    analysis_df = analysis_df.sort_values("abs_error", ascending=False)
    cols_export = ["year", "manufacturer", "model", "odometer", "condition", "fuel", "type", "state", "region",
                   "true_price", "predicted_price", "error", "abs_error", "pct_error"]
    cols_export = [c for c in cols_export if c in analysis_df.columns]
    worst_200 = analysis_df.head(200)[cols_export]
    error_csv_path = ERROR_OUTPUT_DIR / f"error_cases_{set_name}.csv"
    worst_200.to_csv(error_csv_path, index=False)
    print(f"Saved top 200 worst errors to {error_csv_path}")
    
    # Aggregate analysis
    analysis = {
        "set_name": set_name,
        "n_samples": len(analysis_df),
        "mae": float(np.mean(abs_errors)),
        "rmse": float(np.sqrt(np.mean(errors ** 2))),
        "p95_error": float(np.percentile(abs_errors, 95)),
        "p99_error": float(np.percentile(abs_errors, 99)),
    }
    
    # Error by price decile
    analysis_df["price_decile"] = pd.qcut(analysis_df["true_price"], q=10, labels=False, duplicates="drop")
    decile_errors = analysis_df.groupby("price_decile")["abs_error"].agg(["mean", "std", "count"]).to_dict("index")
    analysis["by_price_decile"] = {str(k): {"mean_error": float(v["mean"]), "std_error": float(v["std"]), "count": int(v["count"])} 
                                     for k, v in decile_errors.items()}
    
    # Error by car_age_bucket (if present) or car_age bins
    if "car_age_bucket" in analysis_df.columns:
        age_errors = analysis_df.groupby("car_age_bucket", observed=True)["abs_error"].agg(["mean", "count"]).to_dict("index")
        analysis["by_car_age_bucket"] = {str(k): {"mean_error": float(v["mean"]), "count": int(v["count"])} for k, v in age_errors.items()}
    if "car_age" in analysis_df.columns and "by_car_age_bucket" not in analysis:
        age_bins = [0, 3, 6, 10, 15, 20, float("inf")]
        analysis_df["age_bucket"] = pd.cut(analysis_df["car_age"], bins=age_bins, labels=["0-3", "3-6", "6-10", "10-15", "15-20", "20+"])
        age_errors = analysis_df.groupby("age_bucket", observed=True)["abs_error"].agg(["mean", "count"]).to_dict("index")
        analysis["by_age_bucket"] = {str(k): {"mean_error": float(v["mean"]), "count": int(v["count"])} for k, v in age_errors.items()}
    
    # Error by odometer buckets
    odometer_bins = [0, 30000, 60000, 100000, 150000, 200000, float('inf')]
    analysis_df["odometer_bucket"] = pd.cut(analysis_df["odometer"], bins=odometer_bins, 
                                             labels=["0-30k", "30-60k", "60-100k", "100-150k", "150-200k", "200k+"])
    odometer_errors = analysis_df.groupby("odometer_bucket", observed=True)["abs_error"].agg(["mean", "count"]).to_dict("index")
    analysis["by_odometer_bucket"] = {str(k): {"mean_error": float(v["mean"]), "count": int(v["count"])} 
                                       for k, v in odometer_errors.items()}
    
    # Error by manufacturer_model (top 20 worst)
    if "manufacturer_model" in analysis_df.columns:
        mfr_model_errors = analysis_df.groupby("manufacturer_model")["abs_error"].agg(["mean", "count"]).sort_values("mean", ascending=False)
        analysis["by_manufacturer_model"] = {str(k): {"mean_error": float(v["mean"]), "count": int(v["count"])} 
                                              for k, v in mfr_model_errors.head(20).to_dict("index").items()}
    
    # Error by region (top 20 worst)
    if "region" in analysis_df.columns:
        region_errors = analysis_df.groupby("region")["abs_error"].agg(["mean", "count"]).sort_values("mean", ascending=False)
        analysis["by_region"] = {str(k): {"mean_error": float(v["mean"]), "count": int(v["count"])} 
                                   for k, v in region_errors.head(20).to_dict("index").items()}
    
    return analysis, analysis_df


def generate_report(valid_analysis, test_analysis):
    """Generate markdown report."""
    report_lines = [
        "# Error Analysis Report",
        "",
        f"Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## Summary Statistics",
        "",
        f"### Validation Set",
        f"- Samples: {valid_analysis['n_samples']:,}",
        f"- MAE: ${valid_analysis['mae']:,.0f}",
        f"- RMSE: ${valid_analysis['rmse']:,.0f}",
        f"- 95th percentile error: ${valid_analysis['p95_error']:,.0f}",
        f"- 99th percentile error: ${valid_analysis['p99_error']:,.0f}",
        "",
        f"### Test Set",
        f"- Samples: {test_analysis['n_samples']:,}",
        f"- MAE: ${test_analysis['mae']:,.0f}",
        f"- RMSE: ${test_analysis['rmse']:,.0f}",
        f"- 95th percentile error: ${test_analysis['p95_error']:,.0f}",
        f"- 99th percentile error: ${test_analysis['p99_error']:,.0f}",
        "",
        "## Error Distribution by Price Decile",
        "",
        "| Decile | Mean Error | Std Error | Count |",
        "|--------|------------|-----------|-------|",
    ]
    
    for decile, stats in valid_analysis.get("by_price_decile", {}).items():
        report_lines.append(f"| {decile} | ${stats['mean_error']:,.0f} | ${stats['std_error']:,.0f} | {stats['count']:,} |")
    
    report_lines.extend([
        "",
        "## Error Distribution by Car Age",
        "",
        "| Age Bucket | Mean Error | Count |",
        "|------------|------------|-------|",
    ])
    
    for bucket, stats in valid_analysis.get("by_age_bucket", {}).items():
        report_lines.append(f"| {bucket} | ${stats['mean_error']:,.0f} | {stats['count']:,} |")
    
    report_lines.extend([
        "",
        "## Error Distribution by Odometer",
        "",
        "| Odometer Bucket | Mean Error | Count |",
        "|------------------|------------|-------|",
    ])
    
    for bucket, stats in valid_analysis.get("by_odometer_bucket", {}).items():
        report_lines.append(f"| {bucket} | ${stats['mean_error']:,.0f} | {stats['count']:,} |")
    
    report_lines.extend([
        "",
        "## Top 20 Worst-Performing Make/Model Combinations",
        "",
        "| Make/Model | Mean Error | Count |",
        "|------------|------------|-------|",
    ])
    
    for mfr_model, stats in list(valid_analysis.get("by_manufacturer_model", {}).items())[:20]:
        report_lines.append(f"| {mfr_model.replace('__', ' ')} | ${stats['mean_error']:,.0f} | {stats['count']:,} |")
    
    report_lines.extend([
        "",
        "## Top 20 Worst-Performing Regions",
        "",
        "| Region | Mean Error | Count |",
        "|--------|------------|-------|",
    ])
    
    for region, stats in list(valid_analysis.get("by_region", {}).items())[:20]:
        report_lines.append(f"| {region} | ${stats['mean_error']:,.0f} | {stats['count']:,} |")
    
    report_lines.extend([
        "",
        "## Recommendations",
        "",
        "Based on this analysis:",
        "",
        "1. **High-price vehicles** (top deciles) show larger absolute errors. Consider price-bucketed models or log-space regularization.",
        "2. **Specific make/model combinations** with high errors may need more training data or feature engineering.",
        "3. **Regional differences** suggest location-specific pricing patterns that could benefit from region embeddings.",
        "4. **Tail errors (P95/P99)** drive RMSE. Consider robust loss (Huber) or ensemble methods.",
        "",
        "See `training/error_cases_validation.csv` and `training/error_cases_test.csv` for detailed case-by-case analysis.",
    ])
    
    report_path = ERROR_OUTPUT_DIR / "error_report.md"
    with open(report_path, "w") as f:
        f.write("\n".join(report_lines))
    print(f"\nSaved error report to {report_path}")


def generate_figures(valid_analysis_df, test_analysis_df):
    """Generate residual histogram and error by price decile PNGs."""
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("[WARN] matplotlib not installed; skipping figures")
        return
    # Combined for decile plot
    valid_analysis_df = valid_analysis_df.copy()
    valid_analysis_df["set"] = "validation"
    test_analysis_df = test_analysis_df.copy()
    test_analysis_df["set"] = "test"
    combined = pd.concat([valid_analysis_df, test_analysis_df], ignore_index=True)
    if "price_decile" not in combined.columns:
        combined["price_decile"] = pd.qcut(combined["true_price"], q=10, labels=False, duplicates="drop")
    # Residual histogram
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(combined["error"], bins=80, edgecolor="black", alpha=0.7)
    ax.set_xlabel("Residual (predicted - true price)")
    ax.set_ylabel("Count")
    ax.set_title("Residual distribution")
    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "residual_histogram.png", dpi=150)
    plt.close()
    print(f"Saved {FIGURES_DIR / 'residual_histogram.png'}")
    # Error by price decile
    dec = combined.groupby("price_decile")["abs_error"].mean()
    fig, ax = plt.subplots(figsize=(8, 5))
    dec.plot(kind="bar", ax=ax)
    ax.set_xlabel("Price decile")
    ax.set_ylabel("Mean absolute error ($)")
    ax.set_title("Mean absolute error by price decile")
    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "error_by_price_decile.png", dpi=150)
    plt.close()
    print(f"Saved {FIGURES_DIR / 'error_by_price_decile.png'}")


def main():
    print("=" * 60)
    print("ERROR ANALYSIS - FastAI Model")
    print("=" * 60)
    
    learn, df_valid, df_test, cat_names, cont_names, y_name = load_model_and_data()
    
    valid_analysis, valid_df = analyze_errors(learn, df_valid, "validation", cat_names, cont_names, y_name)
    test_analysis, test_df = analyze_errors(learn, df_test, "test", cat_names, cont_names, y_name)

    generate_report(valid_analysis, test_analysis)
    generate_figures(valid_df, test_df)

    print("\n" + "=" * 60)
    print("ERROR ANALYSIS COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
