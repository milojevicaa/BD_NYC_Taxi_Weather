from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType,
    StructField,
    StringType,
    IntegerType,
    DoubleType,
)

from pipeline import config

config.configure_spark_environment()

TRIP_SCHEMA = StructType(
    [
        StructField("pickup_datetime", StringType()),
        StructField("dropoff_datetime", StringType()),
        StructField("passenger_count", IntegerType()),
        StructField("trip_distance", DoubleType()),
        StructField("fare_amount", DoubleType()),
        StructField("total_amount", DoubleType()),
        StructField("payment_type", IntegerType()),
        StructField("payment_label", StringType()),
        StructField("pu_location_id", IntegerType()),
        StructField("do_location_id", IntegerType()),
    ]
)

WEATHER_SCHEMA = StructType(
    [
        StructField("datetime", StringType()),
        StructField("temp_c", DoubleType()),
        StructField("precip_mm", DoubleType()),
        StructField("rain_mm", DoubleType()),
        StructField("snow_cm", DoubleType()),
        StructField("wind_kmh", DoubleType()),
    ]
)


def build_spark(app_name="NYC_Taxi_Weather_Pipeline"):
    spark = (
        SparkSession.builder.master("local[*]")
        .appName(app_name)
        .config("spark.jars.packages", config.KAFKA_PACKAGE)
        .config("spark.sql.shuffle.partitions", "8")
        .config("spark.ui.showConsoleProgress", "false")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("ERROR")
    return spark


def _read_topic(spark, topic, schema):
    raw = (
        spark.read.format("kafka")
        .option("kafka.bootstrap.servers", config.KAFKA_BOOTSTRAP)
        .option("subscribe", topic)
        .option("startingOffsets", "earliest")
        .option("endingOffsets", "latest")
        .load()
    )
    return raw.select(
        F.from_json(F.col("value").cast("string"), schema).alias("data")
    ).select("data.*")


def read_trips_from_kafka(spark):
    trips = _read_topic(spark, config.TOPIC_TAXI, TRIP_SCHEMA)
    trips = trips.withColumn(
        "pickup_ts", F.to_timestamp("pickup_datetime")
    ).withColumn("date_hour", F.date_trunc("hour", F.col("pickup_ts")))
    return trips


def read_weather_from_kafka(spark):
    weather = _read_topic(spark, config.TOPIC_WEATHER, WEATHER_SCHEMA)
    weather = weather.withColumn(
        "date_hour", F.date_trunc("hour", F.to_timestamp("datetime"))
    )
    weather = weather.withColumn(
        "weather_category",
        F.when(F.col("snow_cm") > 0, "Snow")
        .when(F.col("rain_mm") > 0, "Rain")
        .when(F.col("precip_mm") > 0, "Drizzle")
        .otherwise("Dry"),
    )
    return weather


def aggregate_hourly_demand(trips):
    return (
        trips.groupBy("date_hour")
        .agg(
            F.count("*").alias("trip_count"),
            F.round(F.avg("trip_distance"), 3).alias("avg_distance"),
            F.round(F.avg("total_amount"), 2).alias("avg_total_amount"),
            F.round(F.sum("total_amount"), 2).alias("revenue"),
        )
        .orderBy("date_hour")
    )


def aggregate_payment_mix(trips):
    return (
        trips.groupBy("payment_label")
        .agg(F.count("*").alias("trip_count"))
        .orderBy(F.desc("trip_count"))
    )


def join_demand_with_weather(hourly_demand, weather):
    weather_slim = weather.select(
        "date_hour", "temp_c", "precip_mm", "snow_cm", "wind_kmh", "weather_category"
    )
    joined = hourly_demand.join(weather_slim, on="date_hour", how="inner")
    return joined.orderBy("date_hour")


def demand_by_weather_category(joined):
    return (
        joined.groupBy("weather_category")
        .agg(
            F.sum("trip_count").alias("total_trips"),
            F.round(F.avg("trip_count"), 1).alias("avg_trips_per_hour"),
            F.round(F.avg("temp_c"), 1).alias("avg_temp_c"),
        )
        .orderBy(F.desc("avg_trips_per_hour"))
    )
