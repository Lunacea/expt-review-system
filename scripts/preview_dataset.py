import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="ignore")


def preview_jsonl(path: Path, limit: int = 5) -> None:
    with path.open("r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            if not line.strip():
                continue
            record = json.loads(line)
            print(f"--- record {idx} ---")
            for key, value in record.items():
                if isinstance(value, str):
                    snippet = value[:120].replace("\n", "\\n")
                    suffix = "…" if len(value) > 120 else ""
                    print(f"{key}: {snippet}{suffix}")
                else:
                    print(f"{key}: {value}")
            if idx >= limit:
                break


if __name__ == "__main__":
    data_path = Path("tmp_train.jsonl")
    if not data_path.exists():
        raise SystemExit("tmp_train.jsonl が見つかりません。先にデータをダウンロードしてください。")
    preview_jsonl(data_path)

