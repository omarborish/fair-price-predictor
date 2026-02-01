"""
Generate Vehicle Options Lookup Table
======================================
Creates a JSON file mapping make -> models -> valid options (fuel, type, drive, transmission)
Used for dependent dropdowns in the predictor form.

Usage:
    python server/scripts/generate_vehicle_options.py
"""

import pandas as pd
import json
from pathlib import Path
from collections import defaultdict

# Configuration
DATA_PATH = Path(__file__).parent.parent.parent / "vehicles.csv"
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "vehicle_options.json"

# Minimum listings required to include a make/model
MIN_LISTINGS_MAKE = 50
MIN_LISTINGS_MODEL = 20


def normalize_string(s: str) -> str:
    """Normalize string: lowercase, strip whitespace."""
    if pd.isna(s) or not isinstance(s, str):
        return ""
    return s.strip().lower()


def title_case(s: str) -> str:
    """Convert to title case for display."""
    if not s:
        return ""
    # Handle special cases
    special = {
        'bmw': 'BMW',
        'gmc': 'GMC',
        'ram': 'RAM',
        'suv': 'SUV',
        'fwd': 'FWD',
        'rwd': 'RWD',
        '4wd': '4WD',
        'awd': 'AWD',
    }
    lower = s.lower()
    if lower in special:
        return special[lower]
    return s.title()


def generate_vehicle_options():
    """Generate the vehicle options lookup JSON."""
    print("=" * 60)
    print("GENERATING VEHICLE OPTIONS LOOKUP")
    print("=" * 60)
    
    # Load data
    print(f"\nLoading data from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH, low_memory=False)
    print(f"Loaded {len(df):,} rows")
    
    # Normalize columns
    for col in ['manufacturer', 'model', 'fuel', 'type', 'drive', 'transmission']:
        if col in df.columns:
            df[col] = df[col].apply(normalize_string)
    
    # Filter out rows missing critical fields
    df = df[df['manufacturer'].notna() & (df['manufacturer'] != '')]
    df = df[df['model'].notna() & (df['model'] != '')]
    print(f"After filtering empty: {len(df):,} rows")
    
    # Get make counts
    make_counts = df['manufacturer'].value_counts()
    valid_makes = make_counts[make_counts >= MIN_LISTINGS_MAKE].index.tolist()
    print(f"Makes with >= {MIN_LISTINGS_MAKE} listings: {len(valid_makes)}")
    
    # Build lookup structure
    lookup = {
        "makes": [],
        "models_by_make": {},
        "options_by_make_model": {},
        "common_defaults": {}
    }
    
    # Process each make
    for make in sorted(valid_makes):
        make_df = df[df['manufacturer'] == make]
        
        # Get model counts for this make
        model_counts = make_df['model'].value_counts()
        valid_models = model_counts[model_counts >= MIN_LISTINGS_MODEL].index.tolist()
        
        if not valid_models:
            continue
            
        lookup["makes"].append({
            "value": make,
            "label": title_case(make),
            "count": int(make_counts[make])
        })
        
        lookup["models_by_make"][make] = []
        
        for model in sorted(valid_models):
            model_df = make_df[make_df['model'] == model]
            count = len(model_df)
            
            lookup["models_by_make"][make].append({
                "value": model,
                "label": title_case(model),
                "count": count
            })
            
            # Get valid options for this make+model
            key = f"{make}|{model}"
            
            fuels = model_df['fuel'].dropna().unique().tolist()
            fuels = [f for f in fuels if f]
            
            types = model_df['type'].dropna().unique().tolist()
            types = [t for t in types if t]
            
            drives = model_df['drive'].dropna().unique().tolist()
            drives = [d for d in drives if d]
            
            transmissions = model_df['transmission'].dropna().unique().tolist()
            transmissions = [t for t in transmissions if t]
            
            lookup["options_by_make_model"][key] = {
                "fuels": sorted(fuels),
                "types": sorted(types),
                "drives": sorted(drives),
                "transmissions": sorted(transmissions)
            }
            
            # Get most common values for defaults
            common = {}
            if fuels:
                common["fuel"] = model_df['fuel'].mode().iloc[0] if len(model_df['fuel'].mode()) > 0 else fuels[0]
            if types:
                common["type"] = model_df['type'].mode().iloc[0] if len(model_df['type'].mode()) > 0 else types[0]
            if drives:
                common["drive"] = model_df['drive'].mode().iloc[0] if len(model_df['drive'].mode()) > 0 else drives[0]
            if transmissions:
                common["transmission"] = model_df['transmission'].mode().iloc[0] if len(model_df['transmission'].mode()) > 0 else transmissions[0]
            
            lookup["common_defaults"][key] = common
    
    # Sort makes by count (popularity)
    lookup["makes"].sort(key=lambda x: x["count"], reverse=True)
    
    # Sort models by count within each make
    for make in lookup["models_by_make"]:
        lookup["models_by_make"][make].sort(key=lambda x: x["count"], reverse=True)
    
    # Add global fallback options (for "Other" selections)
    all_fuels = df['fuel'].dropna().unique().tolist()
    all_types = df['type'].dropna().unique().tolist()
    all_drives = df['drive'].dropna().unique().tolist()
    all_transmissions = df['transmission'].dropna().unique().tolist()
    
    lookup["fallback_options"] = {
        "fuels": sorted([f for f in all_fuels if f]),
        "types": sorted([t for t in all_types if t]),
        "drives": sorted([d for d in all_drives if d]),
        "transmissions": sorted([t for t in all_transmissions if t])
    }
    
    # Add metadata
    lookup["metadata"] = {
        "total_makes": len(lookup["makes"]),
        "total_models": sum(len(m) for m in lookup["models_by_make"].values()),
        "min_listings_make": MIN_LISTINGS_MAKE,
        "min_listings_model": MIN_LISTINGS_MODEL,
        "generated_from_rows": len(df)
    }
    
    # Save
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(lookup, f, indent=2)
    
    print(f"\n[OK] Saved vehicle options to: {OUTPUT_PATH}")
    print(f"     - {lookup['metadata']['total_makes']} makes")
    print(f"     - {lookup['metadata']['total_models']} models")
    
    return lookup


if __name__ == "__main__":
    generate_vehicle_options()
