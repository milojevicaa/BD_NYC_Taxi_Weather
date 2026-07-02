import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

COL = {
    "source": "#4C72B0",
    "broker": "#DD8452",
    "process": "#C44E52",
    "store": "#55A868",
    "viz": "#8172B3",
    "text": "#FFFFFF",
}


def box(ax, x, y, w, h, label, color):
    patch = FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle="round,pad=0.02,rounding_size=0.08",
        linewidth=0,
        facecolor=color,
    )
    ax.add_patch(patch)
    ax.text(
        x + w / 2,
        y + h / 2,
        label,
        ha="center",
        va="center",
        color=COL["text"],
        fontsize=10,
        fontweight="bold",
        wrap=True,
    )


def arrow(ax, x1, y1, x2, y2):
    ax.add_patch(
        FancyArrowPatch(
            (x1, y1),
            (x2, y2),
            arrowstyle="-|>",
            mutation_scale=18,
            linewidth=1.8,
            color="#444444",
        )
    )


fig, ax = plt.subplots(figsize=(13, 7.5))
ax.set_xlim(0, 13)
ax.set_ylim(0, 7.5)
ax.axis("off")

ax.text(
    6.5,
    7.15,
    "NYC Taxi & Wetter - Big Data Datenfluss",
    ha="center",
    fontsize=15,
    fontweight="bold",
    color="#222222",
)

box(ax, 0.3, 5.4, 2.5, 1.0, "Datei-Quelle\nParquet + CSV\n(Taxi-Fahrten)", COL["source"])
box(ax, 0.3, 3.9, 2.5, 1.0, "REST API\nOpen-Meteo\n(Wetter)", COL["source"])
box(ax, 0.3, 2.4, 2.5, 1.0, "Web Scraping\nWikipedia\n(NYC Boroughs)", COL["source"])

box(ax, 3.6, 4.0, 2.6, 1.9, "Apache Kafka\nTopics:\nnyc_taxi_trips\nnyc_weather", COL["broker"])

box(ax, 7.0, 4.0, 2.6, 1.9, "Apache Spark\nKafka lesen\nParsen + Aggregation\nJoin Demand/Wetter", COL["process"])

box(ax, 10.2, 5.1, 2.5, 1.4, "MongoDB\n(NoSQL Store)\nKollektionen", COL["store"])
box(ax, 10.2, 3.3, 2.5, 1.4, "Flat Files\nParquet + CSV\n(output/)", COL["store"])

box(ax, 5.0, 0.7, 3.0, 1.3, "Jupyter Notebook\nVisualisierung &\nData Story", COL["viz"])

arrow(ax, 2.8, 5.9, 3.6, 5.4)
arrow(ax, 2.8, 4.4, 3.6, 4.8)
arrow(ax, 2.8, 2.9, 5.0, 3.9)

arrow(ax, 6.2, 4.95, 7.0, 4.95)

arrow(ax, 9.6, 5.2, 10.2, 5.6)
arrow(ax, 9.6, 4.7, 10.2, 4.1)

arrow(ax, 11.4, 5.1, 8.0, 2.0)
arrow(ax, 11.4, 3.3, 8.0, 1.9)
arrow(ax, 8.3, 4.0, 6.7, 2.0)

plt.tight_layout()
plt.savefig("architektur.png", dpi=130, bbox_inches="tight", facecolor="white")
print("architektur.png erzeugt")
