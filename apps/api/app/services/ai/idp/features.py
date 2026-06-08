"""features — token features for the CRF field extractor (shared by train + serve)."""
from __future__ import annotations


def word_feats(tokens, i):
    w = tokens[i]
    f = {
        "bias": 1.0, "w.lower": w.lower(),
        "w.isdigit": w.replace(",", "").replace(".", "").isdigit(),
        "w.istitle": w.istitle(), "w.isupper": w.isupper(), "len": len(w),
        "has_euro": ("€" in w) or (w.upper() == "EUR"), "has_comma": "," in w,
        "has_at": "@" in w, "has_plus": "+" in w, "suf3": w[-3:], "pre3": w[:3],
        "has_digit": any(c.isdigit() for c in w),
    }
    if i > 0:
        f["-1.lower"] = tokens[i - 1].lower()
        f["-1.istitle"] = tokens[i - 1].istitle()
    else:
        f["BOS"] = True
    if i > 1:
        f["-2.lower"] = tokens[i - 2].lower()
    if i < len(tokens) - 1:
        f["+1.lower"] = tokens[i + 1].lower()
    else:
        f["EOS"] = True
    return f


def feats(tokens):
    return [word_feats(tokens, i) for i in range(len(tokens))]
