from pymongo import MongoClient

from pipeline import config


def get_database():
    client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=8000)
    client.admin.command("ping")
    return client, client[config.MONGO_DB]


def save_to_mongo(dataframe, collection_name):
    client, db = get_database()
    try:
        collection = db[collection_name]
        collection.delete_many({})
        records = dataframe.to_dict("records")
        if records:
            collection.insert_many(records)
        count = collection.count_documents({})
    finally:
        client.close()
    return count


def save_flatfiles(dataframe, name):
    output_dir = config.ensure_output_dir()
    parquet_path = output_dir / f"{name}.parquet"
    csv_path = output_dir / f"{name}.csv"
    dataframe.to_parquet(parquet_path, index=False)
    dataframe.to_csv(csv_path, index=False)
    return parquet_path, csv_path
