import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipeline import config, sources, kafka_pipeline


def main():
    print("Lade historische Wetterdaten von der Open-Meteo REST API...")
    weather = sources.fetch_weather_api()
    print(f"Erzeuge Topic '{config.TOPIC_WEATHER}' neu...")
    kafka_pipeline.recreate_topic(config.TOPIC_WEATHER)
    print(f"Sende {len(weather)} Wetter-Events an Kafka ({config.KAFKA_BOOTSTRAP})...")
    sent = kafka_pipeline.produce_weather(weather, topic=config.TOPIC_WEATHER)
    print(f"Fertig: {sent} Events im Topic '{config.TOPIC_WEATHER}'.")


if __name__ == "__main__":
    main()
