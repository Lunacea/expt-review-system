#!/usr/bin/env python3
"""
Hugging FaceのSetFit/amazon_reviews_multi_jaデータセットをダウンロードし、
MongoDBに商品およびレビューとして投入するユーティリティスクリプト。

参考: https://note.com/eurekachan/n/nbde77c119945
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Tuple
from urllib.request import Request, urlopen

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    load_dotenv = None

from pymongo import MongoClient
from pymongo.server_api import ServerApi

if load_dotenv is not None:
    load_dotenv()

sys.stdout.reconfigure(encoding="utf-8", errors="ignore")
sys.stderr.reconfigure(encoding="utf-8", errors="ignore")

DATASET_URLS = {
    "train": "https://huggingface.co/datasets/SetFit/amazon_reviews_multi_ja/resolve/main/train.jsonl",
    "validation": "https://huggingface.co/datasets/SetFit/amazon_reviews_multi_ja/resolve/main/validation.jsonl",
    "test": "https://huggingface.co/datasets/SetFit/amazon_reviews_multi_ja/resolve/main/test.jsonl"
}

ANNOTATION_TYPES = ["insightful", "unclear", "empathy", "helpful"]

PRODUCT_CONFIGS = [
    {
        "id": "prod-001",
        "slug": "wireless-earbuds-pro",
        "category": "家電・カメラ",
        "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
        "keywords": ["イヤホン", "ヘッドホン", "ワイヤレス", "音質", "ノイズ"]
    },
    {
        "id": "prod-002",
        "slug": "smart-watch-x1",
        "category": "家電・カメラ",
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        "keywords": ["スマートウォッチ", "腕時計", "心拍", "睡眠", "フィットネス"]
    },
    {
        "id": "prod-003",
        "slug": "mechanical-keyboard-rgb",
        "category": "パソコン・周辺機器",
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
        "keywords": ["キーボード", "タイピング", "キー", "打鍵", "メカニカル"]
    }
]

COLLECTION_PRODUCTS = "products"
COLLECTION_REVIEWS = "reviews"

random.seed(42)


def download_file(url: str, dest: Path, overwrite: bool = False) -> None:
    if dest.exists() and not overwrite:
        return

    dest.parent.mkdir(parents=True, exist_ok=True)
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req) as response, dest.open("wb") as f:
        chunk_size = 1024 * 1024
        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            f.write(chunk)


def iter_dataset(paths: Dict[str, Path]) -> Iterable[Tuple[str, Dict[str, object]]]:
    for split, path in paths.items():
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                record = json.loads(line)
                record["split"] = split
                yield split, record


def classify_sentiment(label: int) -> str | None:
    if label <= 1:
        return "negative"
    if label >= 3:
        return "positive"
    return None


def create_title(text: str) -> str:
    cleaned = text.strip().splitlines()[0] if text.strip() else ""
    if not cleaned:
        return "レビュー"
    first_sentence = re.split(r"[。！？!?\n]", cleaned, maxsplit=1)[0]
    first_sentence = first_sentence.strip()
    if not first_sentence:
        first_sentence = cleaned.strip()
    return first_sentence[:30] + ("…" if len(first_sentence) > 30 else "")


def split_into_sentences(text: str) -> List[str]:
    sentences: List[str] = []
    buffer: List[str] = []
    for char in text:
        buffer.append(char)
        if char in ("。", "！", "?", "？", "\n"):
            sentence = "".join(buffer).strip()
            buffer.clear()
            if sentence:
                sentences.append(sentence)
    if buffer:
        tail = "".join(buffer).strip()
        if tail:
            sentences.append(tail)
    return sentences


def build_sentence_entities(review_id: str, sentences: List[str]) -> List[Dict[str, object]]:
    entities = []
    for idx, sentence in enumerate(sentences, start=1):
        entities.append(
            {
                "id": f"{review_id}-sentence-{idx:02d}",
                "text": sentence,
                "annotations": [{"type": ann_type, "count": 0} for ann_type in ANNOTATION_TYPES],
            }
        )
    return entities


def random_datetime_within(days: int = 365) -> datetime:
    now = datetime.now(timezone.utc)
    delta_days = random.randint(0, days)
    delta_minutes = random.randint(0, 23 * 60 + 59)
    return now - timedelta(days=delta_days, minutes=delta_minutes)


def build_review_document(
    record: Dict[str, object],
    product: Dict[str, object],
    review_index: int,
    sentiment: str
) -> Dict[str, object]:
    dataset_label = int(record["label"])
    rating = max(1, min(5, dataset_label + 1))
    review_id = f"{product['id']}-rev-{review_index:04d}"
    created_at = random_datetime_within()
    total_votes = random.randint(0, 120)
    if total_votes == 0:
        helpful_votes = 0
    elif sentiment == "positive":
        helpful_votes = random.randint(max(0, total_votes // 2), total_votes)
    else:
        helpful_votes = random.randint(0, total_votes // 2)

    sentences = split_into_sentences(record["text"])

    return {
        "reviewId": review_id,
        "productId": product["id"],
        "productSlug": product["slug"],
        "datasetId": record["id"],
        "datasetLabel": dataset_label,
        "datasetSplit": record["split"],
        "sentiment": sentiment,
        "rating": rating,
        "title": create_title(record["text"]),
        "content": record["text"],
        "userId": f"user-{review_id}",
        "userName": f"ユーザー{review_index:04d}",
        "userAvatar": f"https://i.pravatar.cc/150?u={review_id}",
        "verifiedPurchase": random.random() < 0.85,
        "helpfulVotes": helpful_votes,
        "totalVotes": total_votes,
        "createdAt": created_at,
        "updatedAt": created_at,
        "language": "ja",
        "sentences": build_sentence_entities(review_id, sentences),
    }


def summarize_text(text: str, max_length: int = 220) -> str:
    collapsed = re.sub(r"\s+", " ", text).strip()
    if len(collapsed) <= max_length:
        return collapsed
    return collapsed[:max_length].rstrip() + "…"


def extract_product_name_from_reviews(reviews: List[Dict[str, object]]) -> str:
    """レビューから商品名を推測"""
    # レビュー本文から商品名らしき単語を抽出
    product_keywords = {}
    for review in reviews:
        text = str(review.get("content", ""))
        # 一般的な商品名パターンを抽出
        # 「○○を購入」「○○が届いた」「○○を使った」などのパターン
        patterns = [
            r"([^。、\s]{2,15}?)(を|が|の)(購入|届いた|使った|使用|試した)",
            r"([^。、\s]{2,15}?)(の)(レビュー|感想|評価)",
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple):
                    keyword = match[0] if match[0] else ""
                else:
                    keyword = match
                if len(keyword) >= 2 and len(keyword) <= 15:
                    product_keywords[keyword] = product_keywords.get(keyword, 0) + 1
    
    if product_keywords:
        # 最も頻出するキーワードを商品名として使用
        most_common = max(product_keywords.items(), key=lambda x: x[1])
        return most_common[0]
    
    # フォールバック: レビューの最初の文から抽出
    if reviews:
        first_review = str(reviews[0].get("content", ""))
        first_sentence = re.split(r"[。！？!?\n]", first_review, maxsplit=1)[0]
        # 最初の10文字程度を商品名として使用
        return first_sentence[:15].strip()
    
    return "商品"


def infer_category_from_reviews(reviews: List[Dict[str, object]]) -> str:
    """レビューからカテゴリを推測"""
    category_keywords = {
        "家電・カメラ": ["充電", "電源", "バッテリー", "イヤホン", "ヘッドホン", "スピーカー", "カメラ", "レンズ", "テレビ", "冷蔵庫", "洗濯機"],
        "パソコン・周辺機器": ["キーボード", "マウス", "モニター", "PC", "パソコン", "ノート", "タブレット", "USB", "ケーブル", "充電器"],
        "スマートフォン・タブレット": ["iPhone", "Android", "スマホ", "スマートフォン", "タブレット", "アプリ", "画面", "タッチ"],
        "ホビー・ゲーム": ["ゲーム", "プレイ", "コントローラー", "ソフト", "フィギュア", "プラモデル"],
        "本・雑誌・コミック": ["本", "書籍", "雑誌", "コミック", "マンガ", "小説"],
        "食品・飲料": ["食べ", "飲み", "味", "おいしい", "まずい", "料理", "レシピ"],
        "ファッション": ["服", "靴", "バッグ", "アクセサリー", "サイズ", "着用"],
        "美容・健康": ["化粧", "スキンケア", "シャンプー", "歯磨き", "サプリメント"],
    }
    
    text_content = " ".join(str(r.get("content", "")) for r in reviews)
    category_scores = {}
    
    for category, keywords in category_keywords.items():
        score = sum(1 for keyword in keywords if keyword in text_content)
        if score > 0:
            category_scores[category] = score
    
    if category_scores:
        return max(category_scores.items(), key=lambda x: x[1])[0]
    
    return "その他"


def build_product_document(
    config: Dict[str, str],
    reviews: List[Dict[str, object]]
) -> Dict[str, object]:
    average_rating = round(sum(review["rating"] for review in reviews) / len(reviews), 2)
    
    # レビューから実際の商品名を抽出
    extracted_name = extract_product_name_from_reviews(reviews)
    if extracted_name and extracted_name != "商品":
        product_name = extracted_name
    else:
        # フォールバック: レビューのタイトルから生成
        positive_reviews = [review for review in reviews if review["sentiment"] == "positive"]
        representative_review = positive_reviews[0] if positive_reviews else reviews[0]
        representative_text = str(representative_review["content"])
        product_name = create_title(representative_text)
    
    # カテゴリを推測
    inferred_category = infer_category_from_reviews(reviews)
    category = inferred_category if inferred_category != "その他" else config["category"]
    
    # 説明文を生成
    all_reviews_text = " ".join(str(r.get("content", "")) for r in reviews[:5])
    description = summarize_text(all_reviews_text, 220)
    
    # 価格を推測（レビューの内容から）
    # 平均評価とレビュー数に基づいて価格を設定
    base_price = 3000 if average_rating >= 4.0 else 2000 if average_rating >= 3.0 else 1500
    price_variation = random.randint(-500, 2000)
    price = max(500, min(50000, base_price + price_variation))

    now = datetime.now(timezone.utc)

    return {
        "productId": config["id"],
        "slug": config["slug"],
        "name": product_name,
        "category": category,
        "image": config["image"],
        "price": price,
        "description": description,
        "averageRating": average_rating,
        "totalReviews": len(reviews),
        "updatedAt": now,
        "createdAt": now,
    }


def match_review_to_product(record: Dict[str, object]) -> str | None:
    """レビューを最も適切な商品にマッチング"""
    text = str(record.get("text", "")).lower()
    
    # 各商品のキーワードとのマッチングスコアを計算
    product_scores: Dict[str, int] = {}
    
    for product in PRODUCT_CONFIGS:
        score = 0
        for keyword in product["keywords"]:
            if keyword.lower() in text:
                score += 1
        if score > 0:
            product_scores[product["id"]] = score
    
    # 最もスコアが高い商品を返す
    if product_scores:
        return max(product_scores.items(), key=lambda x: x[1])[0]
    
    return None


def collect_records(
    dataset_paths: Dict[str, Path],
    per_sentiment: int
) -> Dict[str, Dict[str, List[Dict[str, object]]]]:
    selected: Dict[str, Dict[str, List[Dict[str, object]]]] = {
        product["id"]: {"positive": [], "negative": []} for product in PRODUCT_CONFIGS
    }
    
    # 各商品ごとに必要なレビュー数を追跡
    required_counts = {product["id"]: per_sentiment for product in PRODUCT_CONFIGS}
    
    for _, record in iter_dataset(dataset_paths):
        label = int(record["label"])
        sentiment = classify_sentiment(label)
        if sentiment is None:
            continue
        
        # レビューを最も適切な商品にマッチング
        matched_product_id = match_review_to_product(record)
        
        if matched_product_id:
            # 必要なレビュー数に達していない場合のみ追加
            if len(selected[matched_product_id][sentiment]) < required_counts[matched_product_id]:
                selected[matched_product_id][sentiment].append(record)
        
        # すべての商品で必要なレビュー数に達したかチェック
        all_complete = all(
            len(selected[product["id"]]["positive"]) >= required_counts[product["id"]]
            and len(selected[product["id"]]["negative"]) >= required_counts[product["id"]]
            for product in PRODUCT_CONFIGS
        )
        
        if all_complete:
            break
    
    # 不足しているレビューを補完（マッチングできなかったレビューを使用）
    unmatched_positives: List[Dict[str, object]] = []
    unmatched_negatives: List[Dict[str, object]] = []
    
    for _, record in iter_dataset(dataset_paths):
        label = int(record["label"])
        sentiment = classify_sentiment(label)
        if sentiment is None:
            continue
        
        matched_product_id = match_review_to_product(record)
        if not matched_product_id:
            if sentiment == "positive":
                unmatched_positives.append(record)
            else:
                unmatched_negatives.append(record)
    
    # 不足分をランダムに補完
    random.shuffle(unmatched_positives)
    random.shuffle(unmatched_negatives)
    
    for product in PRODUCT_CONFIGS:
        product_id = product["id"]
        # 肯定レビューの不足分を補完
        while len(selected[product_id]["positive"]) < required_counts[product_id] and unmatched_positives:
            selected[product_id]["positive"].append(unmatched_positives.pop())
        # 否定レビューの不足分を補完
        while len(selected[product_id]["negative"]) < required_counts[product_id] and unmatched_negatives:
            selected[product_id]["negative"].append(unmatched_negatives.pop())

    return selected


def ensure_records_sufficient(
    records: Dict[str, Dict[str, List[Dict[str, object]]]],
    per_sentiment: int
) -> None:
    shortages: List[str] = []
    for product in PRODUCT_CONFIGS:
        for sentiment in ("positive", "negative"):
            count = len(records[product["id"]][sentiment])
            if count < per_sentiment:
                shortages.append(f"{product['id']} ({sentiment}): {count}/{per_sentiment}")
    if shortages:
        message = "十分な件数のレビューを収集できませんでした:\n  " + "\n  ".join(shortages)
        raise RuntimeError(message)


def upsert_products(db, product_documents: Dict[str, Dict[str, object]]) -> None:
    for product_id, document in product_documents.items():
        payload = document.copy()
        created_at = payload.pop("createdAt")
        payload["updatedAt"] = datetime.now(timezone.utc)

        db[COLLECTION_PRODUCTS].update_one(
            {"productId": product_id},
            {
                "$set": payload,
                "$setOnInsert": {"createdAt": created_at},
            },
            upsert=True,
        )


def insert_reviews(db, product_reviews: Dict[str, List[Dict[str, object]]], keep_existing: bool) -> None:
    for product in PRODUCT_CONFIGS:
        reviews = product_reviews.get(product["id"], [])
        if not reviews:
            continue
        if not keep_existing:
            db[COLLECTION_REVIEWS].delete_many({"productId": product["id"]})
        if reviews:
            db[COLLECTION_REVIEWS].insert_many(reviews)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="SetFit/amazon_reviews_multi_jaデータセットをMongoDBに投入します。"
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path("data/amazon_reviews"),
        help="データファイルを保存するディレクトリ",
    )
    parser.add_argument(
        "--per-sentiment",
        type=int,
        default=30,
        help="商品ごとに確保する肯定/否定レビュー件数",
    )
    parser.add_argument(
        "--force-download",
        action="store_true",
        help="既存のJSONLファイルを上書きダウンロードします",
    )
    parser.add_argument(
        "--keep-existing",
        action="store_true",
        help="既存のレビューを削除せずに追加します（デフォルトは置き換え）",
    )
    parser.add_argument(
        "--mongodb-uri",
        default=os.environ.get("MONGODB_URI"),
        help="MongoDBの接続URI（未指定時は環境変数MONGODB_URI）",
    )
    parser.add_argument(
        "--mongodb-db",
        default=os.environ.get("MONGODB_DB_NAME", "review-system"),
        help="MongoDBのデータベース名（未指定時は環境変数MONGODB_DB_NAMEまたはreview-system）",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not args.mongodb_uri:
        raise SystemExit("MongoDBの接続URIが指定されていません。--mongodb-uriまたは環境変数MONGODB_URIを設定してください。")

    mongodb_uri = args.mongodb_uri.strip().strip('"').strip("'")
    mongodb_db = args.mongodb_db.strip().strip('"').strip("'")

    dataset_paths = {
        split: args.data_dir / f"amazon_reviews_{split}.jsonl" for split in DATASET_URLS.keys()
    }

    print("📥 データセットを確認しています...")
    for split, url in DATASET_URLS.items():
        download_file(url, dataset_paths[split], overwrite=args.force_download)
        print(f"  - {split}: {dataset_paths[split]}")

    print("\n🔎 レビューを抽出しています...")
    raw_records = collect_records(dataset_paths, args.per_sentiment)
    ensure_records_sufficient(raw_records, args.per_sentiment)

    product_reviews: Dict[str, List[Dict[str, object]]] = {product["id"]: [] for product in PRODUCT_CONFIGS}

    for product in PRODUCT_CONFIGS:
        index = 1
        for sentiment in ("positive", "negative"):
            for record in raw_records[product["id"]][sentiment]:
                review_doc = build_review_document(record, product, index, sentiment)
                product_reviews[product["id"]].append(review_doc)
                index += 1

    product_documents: Dict[str, Dict[str, object]] = {}
    for config in PRODUCT_CONFIGS:
        reviews = product_reviews.get(config["id"], [])
        if not reviews:
            continue
        product_documents[config["id"]] = build_product_document(config, reviews)

    # MongoDB接続オプションを設定（DNS解決の問題を回避）
    client_options = {
        "serverSelectionTimeoutMS": 30000,  # 30秒
        "connectTimeoutMS": 30000,
    }
    
    # MongoDB Atlasの場合、Server APIを指定
    if "mongodb+srv://" in mongodb_uri:
        client_options["server_api"] = ServerApi("1")
    
    with MongoClient(mongodb_uri, **client_options) as client:
        # 接続テスト
        try:
            client.admin.command("ping")
            print("✅ MongoDB接続を確認しました")
        except Exception as e:
            print(f"⚠️  MongoDB接続テストに失敗しました: {e}")
            print("接続を続行しますが、エラーが発生する可能性があります...")
        
        db = client[mongodb_db]
        upsert_products(db, product_documents)
        insert_reviews(db, product_reviews, keep_existing=args.keep_existing)

    print("\n✅ データ投入が完了しました。概要:")
    for config in PRODUCT_CONFIGS:
        reviews = product_reviews[config["id"]]
        positives = sum(1 for review in reviews if review["sentiment"] == "positive")
        negatives = sum(1 for review in reviews if review["sentiment"] == "negative")
        name = product_documents.get(config["id"], {}).get("name", config["slug"])
        print(f"  - {name}: {len(reviews)}件 (positive {positives}, negative {negatives})")
    print("\nMongoDBでデータが利用可能になりました。")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"❌ エラー: {exc}", file=sys.stderr)
        sys.exit(1)

