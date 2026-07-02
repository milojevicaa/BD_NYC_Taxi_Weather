import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline import config, sources, kafka_pipeline


def main():
    print("Lade und bereinige Taxi-Fahrten aus der Parquet-Datei...")
    trips = sources.load_taxi_trips()
    sample = trips.sample(n=min(config.TRIP_SAMPLE_SIZE, len(trips)), random_state=42)
    print(f"Erzeuge Topic '{config.TOPIC_TAXI}' neu...")
    kafka_pipeline.recreate_topic(config.TOPIC_TAXI)
    print(f"Sende {len(sample)} Fahrt-Events an Kafka ({config.KAFKA_BOOTSTRAP})...")
    sent = kafka_pipeline.produce_taxi_trips(sample, topic=config.TOPIC_TAXI)
    print(f"Fertig: {sent} Events im Topic '{config.TOPIC_TAXI}'.")


if __name__ == "__main__":
    main()
