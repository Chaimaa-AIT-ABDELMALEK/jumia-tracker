import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime
import os

HEADERS = {"User-Agent": "Mozilla/5.0"}

def get_products(query):
    url = f"https://www.jumia.ma/catalog/?q={query}"
    response = requests.get(url, headers=HEADERS)

    soup = BeautifulSoup(response.text, "html.parser")
    items = soup.find_all("article", class_="prd")

    products = []

    for item in items:
        try:
            title = item.find("h3", class_="name").text.strip()
            price = item.find("div", class_="prc").text.strip()
            link = "https://www.jumia.ma" + item.find("a")["href"]

            # 🔥 نحاولو نخرجو category من الرابط
            category = link.split("/")[3] if len(link.split("/")) > 3 else "unknown"

            products.append({
                "id": link,
                "title": title,
                "price": price,
                "category": category
            })
        except:
            continue

    return products


def save_to_csv(products, filename="products.csv"):
    file_exists = os.path.isfile(filename)

    with open(filename, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "title", "price", "category", "date"])

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


if __name__ == "__main__":
    query = input("Product search: ")

    data = get_products(query)
    save_to_csv(data)

    print("Saved automatically ✅")