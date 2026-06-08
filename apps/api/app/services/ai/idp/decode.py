"""decode — turn token/label sequences into structured field values (shared by train + serve)."""
from __future__ import annotations
import re

MONEY = {"REVENUE", "EBITDA", "NETPROFIT", "ASSETS", "LIABILITIES", "DEBT", "LOANAMT"}


def parse_money(s: str):
    s = s.replace("€", "").replace("EUR", "").replace(",", "").strip()
    m = re.match(r"([\d.]+)\s*m$", s, re.I)
    if m:
        return float(m.group(1)) * 1_000_000
    digits = re.sub(r"[^\d.]", "", s)
    try:
        return float(digits) if digits else None
    except ValueError:
        return None


def extract_fields(tokens, labels) -> dict:
    """First span per tag -> value (money parsed to float, else joined text)."""
    out: dict = {}
    cur_tag, cur = None, []

    def flush():
        nonlocal cur_tag, cur
        if cur_tag and cur_tag not in out:
            val = " ".join(cur)
            out[cur_tag] = parse_money(val) if cur_tag in MONEY else val
        cur_tag, cur = None, []

    for t, l in zip(tokens, labels):
        if l == "O":
            flush()
        elif l.startswith("B-"):
            flush(); cur_tag = l[2:]; cur = [t]
        elif l.startswith("I-"):
            if cur_tag == l[2:]:
                cur.append(t)
            else:
                flush(); cur_tag = l[2:]; cur = [t]
    flush()
    return out
