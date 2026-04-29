import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("products.csv")

df["price"] = df["price"].str.replace("DH", "").str.replace(" ", "").astype(float)
df["date"] = pd.to_datetime(df["date"])

name = input("Product name: ")

df_p = df[df["title"].str.contains(name, case=False, na=False)]

df_p = df_p.groupby(df_p["date"].dt.date)["price"].mean()

df_p.plot(marker="o")

df = pd.read_csv(
    "file.csv",
    engine="python",
    on_bad_lines="skip",
    sep=",",
    quotechar='"'
)

plt.show()