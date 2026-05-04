from flask import Flask
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)

# 📍 CSV path (backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "products.csv")


# 📥 load & clean data
def load_data():
    df = pd.read_csv(CSV_PATH)

    # 🧹 remove corrupted column
    if "Unnamed: 5" in df.columns:
        df = df.drop(columns=["Unnamed: 5"])

    # clean price
    df["price"] = (
        df["price"]
        .astype(str)
        .str.replace(r"[^\d.]", "", regex=True)
    )
    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    # clean date
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # clean category
    df["category"] = df["category"].astype(str).str.lower().str.strip()

    # remove invalid rows
    df = df.dropna(subset=["price", "date"])

    return df
app = Flask(__name__)
CORS(app)

# 🏠 home
@app.route("/")
def home():
    return "Flask is working 🚀"


# 🧪 debug (IMPORTANT)
@app.route("/debug")
def debug():
    df = load_data()
    return {
        "rows": len(df),
        "columns": list(df.columns)
    }


# 📊 category distribution (LIMITED)
@app.route("/category-count")
def category_count():
    df = load_data()

    counts = df["category"].value_counts().reset_index()
    counts.columns = ["category", "count"]

    return counts.head(20).to_json(orient="records")


# 📈 category evolution (LIMITED FOR PERFORMANCE)
@app.route("/categories")
def categories():
    df = load_data()

    grouped = df.groupby(
        [df["date"].dt.date, "category"]
    )["price"].mean().reset_index()

    pivot = grouped.pivot(
        index="date",
        columns="category",
        values="price"
    ).reset_index()

    # limit rows for React performance
    return pivot.tail(200).to_json(orient="records")


# 📦 all products (optional)
@app.route("/products")
def products():
    df = load_data()
    return df.head(1000).to_json(orient="records")


# 📉 single product (if needed)
@app.route("/product/<int:id>")
def product(id):
    df = load_data()
    p = df[df["id"] == id].sort_values("date")
    return p.to_json(orient="records")

@app.route("/product-search")
def product_search():
    from flask import request
    query = request.args.get("q", "").lower().strip()
    if not query:
        return []
    df = load_data()
    results = df[df["title"].str.lower().str.contains(query, na=False)]
    results = results.sort_values("date")
    return results[["title", "price", "date", "category"]].head(500).to_json(orient="records")

if __name__ == "__main__":
    app.run(debug=True)