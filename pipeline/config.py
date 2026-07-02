import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

RAW_DIR = PROJECT_ROOT / "Rohdaten"
OUTPUT_DIR = PROJECT_ROOT / "output"
HADOOP_DIR = PROJECT_ROOT / "hadoop"

TAXI_FILE = RAW_DIR / "yellow_tripdata_2023-01.parquet"
WEATHER_FILE = RAW_DIR / "New York, NY, United Stat... 2023-01-01 to 2023-01-31.csv"

KAFKA_BOOTSTRAP = os.environ.get("KAFKA_BOOTSTRAP", "localhost:29092")
TOPIC_TAXI = "nyc_taxi_trips"
TOPIC_WEATHER = "nyc_weather"

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = "nyc_taxi_weather"

NYC_LAT = 40.7128
NYC_LON = -74.0060
WEATHER_START = "2023-01-01"
WEATHER_END = "2023-01-31"

JAVA_HOME = os.environ.get("PROJECT_JAVA_HOME", r"C:\Program Files\Java\jdk-17")

KAFKA_PACKAGE = "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1"

TRIP_SAMPLE_SIZE = 120000


def configure_spark_environment():
    if os.path.isdir(JAVA_HOME):
        os.environ["JAVA_HOME"] = JAVA_HOME
    os.environ["HADOOP_HOME"] = str(HADOOP_DIR)
    bin_dir = str(HADOOP_DIR / "bin")
    if bin_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = bin_dir + os.pathsep + os.environ.get("PATH", "")
    os.environ.setdefault("PYSPARK_PYTHON", "python")
    os.environ.setdefault("PYSPARK_DRIVER_PYTHON", "python")


def ensure_output_dir():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR
