import os
import pandas as pd
import matplotlib.pyplot as plt

# قراءة CSV
df = pd.read_csv("products.csv", engine="python", on_bad_lines="skip")

# تنظيف price
df["price"] = (
    df["price"]
    .astype(str)
    .str.replace(r"[^\d.]", "", regex=True)
)
df["price"] = pd.to_numeric(df["price"], errors="coerce")

# تنظيف date
df["date"] = pd.to_datetime(df["date"], errors="coerce")

# تنظيف title
df["title"] = df["title"].astype(str).str.strip()

# حذف القيم الخاسرة
df = df.dropna(subset=["price", "date", "title"])

# 👇 طلب من المستخدم اسم المنتج
product_name = input("🔍 Enter product name: ").strip()

# فلترة product
product_df = df[df["title"].str.contains(product_name, case=False, na=False)]

if product_df.empty:
    print("❌ No product found!")
    exit()

# ترتيب حسب التاريخ
product_df = product_df.sort_values("date")

# graph
plt.figure(figsize=(10,5))
plt.plot(product_df["date"], product_df["price"], marker="o")

plt.title(f"📊 Price Evolution: {product_name}")
plt.xlabel("Date")
plt.ylabel("Price (Dhs)")
plt.grid()

# save
path = os.path.join(os.getcwd(), f"{product_name}_graph.png")
plt.savefig(path)

print("✅ Graph saved here:")
print(path)

plt.show()