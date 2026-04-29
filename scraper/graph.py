import pandas as pd
import matplotlib.pyplot as plt

# load data
df = pd.read_csv("products.csv")

# clean price
df["price"] = df["price"].str.replace("DH", "").str.replace(" ", "").astype(float)

# convert date
df["date"] = pd.to_datetime(df["date"])

# average price per category per day
grouped = df.groupby([df["date"].dt.date, "category"])["price"].mean().reset_index()

# pivot (categories = columns automatically)
pivot = grouped.pivot(index="date", columns="category", values="price")

# plot ALL categories dynamically
plt.figure(figsize=(12, 6))

for category in pivot.columns:
    plt.plot(pivot.index, pivot[category], marker="o", label=category)

plt.title("Évolution globale des prix (toutes catégories)")
plt.xlabel("Date")
plt.ylabel("Average Price")
plt.xticks(rotation=45)
plt.grid(True)
plt.legend()

plt.show()