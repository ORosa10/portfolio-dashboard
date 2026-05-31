#!/usr/bin/env python3
"""Download an Excel file from OneDrive / Microsoft Graph for GitHub Actions.

Required env vars for Graph mode:
  MS_TENANT_ID
  MS_CLIENT_ID
  MS_CLIENT_SECRET
  ONEDRIVE_DRIVE_ID
  ONEDRIVE_ITEM_ID

Alternative direct URL mode:
  ONEDRIVE_DOWNLOAD_URL

Usage:
  python scripts/download_onedrive_file.py --output input/source.xlsx
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import requests


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True, help="Where to save the downloaded Excel file")
    return parser.parse_args()


def download_direct(url: str, output: Path) -> None:
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    output.write_bytes(response.content)


def get_graph_token(tenant_id: str, client_id: str, client_secret: str) -> str:
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    response = requests.post(
        token_url,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def download_graph(output: Path) -> None:
    tenant_id = required_env("MS_TENANT_ID")
    client_id = required_env("MS_CLIENT_ID")
    client_secret = required_env("MS_CLIENT_SECRET")
    drive_id = required_env("ONEDRIVE_DRIVE_ID")
    item_id = required_env("ONEDRIVE_ITEM_ID")

    token = get_graph_token(tenant_id, client_id, client_secret)
    url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/items/{item_id}/content"
    response = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=120)
    response.raise_for_status()
    output.write_bytes(response.content)


def required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def main() -> None:
    args = parse_args()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    direct_url = os.environ.get("ONEDRIVE_DOWNLOAD_URL")
    if direct_url:
        print("Downloading Excel via ONEDRIVE_DOWNLOAD_URL")
        download_direct(direct_url, output)
    else:
        print("Downloading Excel via Microsoft Graph")
        download_graph(output)

    if not output.exists() or output.stat().st_size == 0:
        print("Download failed: output file is empty", file=sys.stderr)
        sys.exit(1)

    print(f"Downloaded Excel to {output} ({output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
