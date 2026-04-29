import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("products.csv")

df["price"] = df["price"].str.replace("DH", "").str.replace(" ", "").astype(float)
df["date"] = pd.to_datetime(df["date"])

grouped = df.groupby([df["date"].dt.date, "category"])["price"].mean().reset_index()

pivot = grouped.pivot(index="date", columns="category", values="price")

pivot.plot(figsize=(12,6), marker="o")

plt.show()