import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline import spark_pipeline, storage


def main():
    spark = spark_pipeline.build_spark()
    try:
        trips = spark_pipeline.read_trips_from_kafka(spark)
        weather = spark_pipeline.read_weather_from_kafka(spark)

        hourly_demand = spark_pipeline.aggregate_hourly_demand(trips)
        payment_mix = spark_pipeline.aggregate_payment_mix(trips)
        joined = spark_pipeline.join_demand_with_weather(hourly_demand, weather)
        by_weather = spark_pipeline.demand_by_weather_category(joined)

        hourly_pd = joined.toPandas()
        payment_pd = payment_mix.toPandas()
        weather_pd = by_weather.toPandas()

        print(f"Stundenwerte (joined): {len(hourly_pd)} Zeilen")
        print(f"Zahlungsarten: {len(payment_pd)} Zeilen")
        by_weather.show()

        storage.save_to_mongo(hourly_pd, "demand_weather_hourly")
        storage.save_to_mongo(payment_pd, "payment_mix")
        storage.save_to_mongo(weather_pd, "demand_by_weather")
        storage.save_flatfiles(hourly_pd, "demand_weather_hourly")
        storage.save_flatfiles(weather_pd, "demand_by_weather")
        print("Ergebnisse in MongoDB und output/ gespeichert.")
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
