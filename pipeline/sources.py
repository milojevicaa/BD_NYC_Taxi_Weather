import pandas as pd
import requests
from bs4 import BeautifulSoup

from pipeline import config

TAXI_COLUMNS = [
    "tpep_pickup_datetime",
    "tpep_dropoff_datetime",
    "passenger_count",
    "trip_distance",
    "fare_amount",
    "total_amount",
    "payment_type",
    "PULocationID",
    "DOLocationID",
]

PAYMENT_LABELS = {
    1: "Credit card",
    2: "Cash",
    3: "No charge",
    4: "Dispute",
    5: "Unknown",
    6: "Voided trip",
    0: "Flex Fare",
}


def load_taxi_trips():
    df = pd.read_parquet(config.TAXI_FILE, columns=TAXI_COLUMNS)
    df["tpep_pickup_datetime"] = pd.to_datetime(df["tpep_pickup_datetime"])
    df["tpep_dropoff_datetime"] = pd.to_datetime(df["tpep_dropoff_datetime"])
    mask = (
        (df["tpep_pickup_datetime"] >= "2023-01-01")
        & (df["tpep_pickup_datetime"] < "2023-02-01")
        & (df["trip_distance"] > 0)
        & (df["total_amount"] > 0)
        & (df["passenger_count"] > 0)
    )
    df = df.loc[mask].reset_index(drop=True)
    df["payment_label"] = df["payment_type"].map(PAYMENT_LABELS).fillna("Other")
    return df


def load_weather_file():
    df = pd.read_csv(config.WEATHER_FILE)
    df["datetime"] = pd.to_datetime(df["datetime"])
    return df


def fetch_weather_api():
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": config.NYC_LAT,
        "longitude": config.NYC_LON,
        "start_date": config.WEATHER_START,
        "end_date": config.WEATHER_END,
        "hourly": "temperature_2m,precipitation,rain,snowfall,wind_speed_10m",
        "timezone": "America/New_York",
    }
    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()
    payload = response.json()["hourly"]
    df = pd.DataFrame(payload)
    df = df.rename(
        columns={
            "time": "datetime",
            "temperature_2m": "temp_c",
            "precipitation": "precip_mm",
            "rain": "rain_mm",
            "snowfall": "snow_cm",
            "wind_speed_10m": "wind_kmh",
        }
    )
    df["datetime"] = pd.to_datetime(df["datetime"])
    df["source"] = "open-meteo-api"
    return df


def _to_number(text):
    cleaned = text.replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def scrape_nyc_boroughs():
    url = "https://en.wikipedia.org/wiki/Boroughs_of_New_York_City"
    headers = {"User-Agent": "Mozilla/5.0 (NYC-Taxi-Project Data Engineering)"}
    response = requests.get(url, headers=headers, timeout=60)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table", class_="wikitable")
    valid = {"The Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"}
    records = []
    for tr in table.find_all("tr"):
        cells = [c.get_text(strip=True) for c in tr.find_all(["th", "td"])]
        if len(cells) >= 8 and cells[0] in valid:
            records.append(
                {
                    "borough": cells[0],
                    "county": cells[1],
                    "population_2020": _to_number(cells[2]),
                    "land_area_sqmi": _to_number(cells[3]),
                    "land_area_sqkm": _to_number(cells[4]),
                    "density_per_sqmi": _to_number(cells[5]),
                    "density_per_sqkm": _to_number(cells[6]),
                    "gdp_billion_usd": _to_number(cells[7]),
                }
            )
    return pd.DataFrame(records).reset_index(drop=True)
