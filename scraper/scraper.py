import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime
import os
import time


HEADERS = {"User-Agent": "Mozilla/5.0"}

CATEGORIES = [
    "electronics",
    "phones",
    "computing",
    "fashion",
    "shoes",
    "home",
    "beauty",
    "gaming",
    "sports",
    "toys"
]


# 🔎 scrape one category page
def get_products(category, page):
    url = f"https://www.jumia.ma/catalog/?q={category}&page={page}"
    r = requests.get(url, headers=HEADERS)

    if r.status_code != 200:
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    items = soup.find_all("article", class_="prd")

    products = []

    for item in items:
        try:
            title = item.find("h3", class_="name").text.strip()
            price = item.find("div", class_="prc").text.strip()
            link = "https://www.jumia.ma" + item.find("a")["href"]

            products.append({
                "id": link,
                "title": title,
                "price": price,
                "category": category
            })
        except:
            continue

    return products


# 💾 save to CSV
def save_to_csv(products):
    file_exists = os.path.isfile("products.csv")

    with open("products.csv", "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["id", "title", "price", "category", "date"],
            quoting=csv.QUOTE_ALL
        )

        if not file_exists:
            writer.writeheader()

        for p in products:
            writer.writerow({
                "id": p["id"],
                "title": p["title"],
                "price": p["price"],
                "category": p["category"],
                "date": datetime.now()
            })


# 🚀 main scraping function
def scrape_all():
    print("🚀 Starting scraping...")

    for cat in CATEGORIES:
        print(f"🔍 Category: {cat}")

        page = 1

        while True:
            products = get_products(cat, page)

            if not products:
                break

            save_to_csv(products)

            print(f"   page {page} → {len(products)} products")

            page += 1
            time.sleep(1)

    print("✅ Done scraping!")


# ▶️ run manually
if __name__ == "__main__":
    scrape_all()