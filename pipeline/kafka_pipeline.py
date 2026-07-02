import json

from kafka import KafkaProducer
from kafka.admin import KafkaAdminClient, NewTopic
from kafka.errors import UnknownTopicOrPartitionError

from pipeline import config


def recreate_topic(topic, num_partitions=1, replication_factor=1):
    admin = KafkaAdminClient(bootstrap_servers=config.KAFKA_BOOTSTRAP)
    try:
        try:
            admin.delete_topics([topic])
        except UnknownTopicOrPartitionError:
            pass
        import time

        time.sleep(1.0)
        try:
            admin.create_topics(
                [NewTopic(topic, num_partitions=num_partitions, replication_factor=replication_factor)]
            )
        except Exception:
            pass
    finally:
        admin.close()


def _build_producer():
    return KafkaProducer(
        bootstrap_servers=config.KAFKA_BOOTSTRAP,
        value_serializer=lambda value: json.dumps(value).encode("utf-8"),
        linger_ms=50,
        batch_size=65536,
        acks=1,
    )


def produce_taxi_trips(trips_df, topic=config.TOPIC_TAXI, limit=None):
    if limit is not None:
        trips_df = trips_df.head(limit)
    producer = _build_producer()
    sent = 0
    for row in trips_df.itertuples(index=False):
        event = {
            "pickup_datetime": row.tpep_pickup_datetime.isoformat(),
            "dropoff_datetime": row.tpep_dropoff_datetime.isoformat(),
            "passenger_count": int(row.passenger_count),
            "trip_distance": float(row.trip_distance),
            "fare_amount": float(row.fare_amount),
            "total_amount": float(row.total_amount),
            "payment_type": int(row.payment_type),
            "payment_label": row.payment_label,
            "pu_location_id": int(row.PULocationID),
            "do_location_id": int(row.DOLocationID),
        }
        producer.send(topic, event)
        sent += 1
    producer.flush()
    producer.close()
    return sent


def produce_weather(weather_df, topic=config.TOPIC_WEATHER):
    producer = _build_producer()
    sent = 0
    for row in weather_df.itertuples(index=False):
        event = {
            "datetime": row.datetime.isoformat(),
            "temp_c": None if row.temp_c is None else float(row.temp_c),
            "precip_mm": float(row.precip_mm),
            "rain_mm": float(row.rain_mm),
            "snow_cm": float(row.snow_cm),
            "wind_kmh": float(row.wind_kmh),
        }
        producer.send(topic, event)
        sent += 1
    producer.flush()
    producer.close()
    return sent
