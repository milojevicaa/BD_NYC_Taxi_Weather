const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaTaxi, FaFileAlt, FaGlobe, FaSpider, FaStream, FaBolt,
  FaDatabase, FaSave, FaCloudRain, FaClock, FaThermometerHalf,
  FaCheckCircle, FaChartBar, FaArrowRight, FaLightbulb,
} = require("react-icons/fa");

const NAVY = "12233B";
const NAVY2 = "1B2A4A";
const YELLOW = "F5C518";
const INK = "1B2A4A";
const GRAY = "5B6B7F";
const WHITE = "FFFFFF";
const CARD = "F4F6FA";
const ICE = "CADCFC";
const BLUE = "3E6DA3";

const makeShadow = () => ({ type: "outer", color: "9AA6B8", blur: 8, offset: 3, angle: 90, opacity: 0.25 });

async function icon(IconComponent, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

function titleBlock(slide, pres, iconData, text, sub) {
  slide.addShape(pres.shapes.OVAL, { x: 0.5, y: 0.36, w: 0.62, h: 0.62, fill: { color: YELLOW } });
  slide.addImage({ data: iconData, x: 0.63, y: 0.49, w: 0.36, h: 0.36 });
  slide.addText(text, { x: 1.28, y: 0.34, w: 8.2, h: 0.66, fontSize: 28, bold: true, color: INK, fontFace: "Calibri", valign: "middle", margin: 0 });
  if (sub) slide.addText(sub, { x: 1.29, y: 0.98, w: 8.2, h: 0.32, fontSize: 13, color: GRAY, fontFace: "Calibri", margin: 0 });
}

function card(slide, pres, x, y, w, h) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: WHITE }, rectRadius: 0.09, line: { color: "E4E9F2", width: 1 }, shadow: makeShadow() });
}

(async () => {
  const ic = {
    taxi: await icon(FaTaxi, "#12233B"),
    file: await icon(FaFileAlt),
    api: await icon(FaGlobe),
    scrape: await icon(FaSpider),
    kafka: await icon(FaStream),
    spark: await icon(FaBolt),
    db: await icon(FaDatabase),
    save: await icon(FaSave),
    rain: await icon(FaCloudRain, "#12233B"),
    clock: await icon(FaClock, "#12233B"),
    temp: await icon(FaThermometerHalf, "#12233B"),
    check: await icon(FaCheckCircle, "#F5C518"),
    bulb: await icon(FaLightbulb, "#12233B"),
    chart: await icon(FaChartBar),
    arrow: await icon(FaArrowRight, "#F5C518"),
  };

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Aron Milojevic, Mateusz Pacyga, Ajay Pal";
  pres.title = "NYC Taxi & Wetter - Big Data Pipeline";

  let s;

  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: 0.55, w: 1.0, h: 1.0, fill: { color: YELLOW } });
  s.addImage({ data: ic.taxi, x: 0.72, y: 0.77, w: 0.56, h: 0.56 });
  s.addText("Wetter & urbane Mobilität", { x: 0.5, y: 1.95, w: 9, h: 0.85, fontSize: 42, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  s.addText("in New York City", { x: 0.5, y: 2.75, w: 9, h: 0.7, fontSize: 42, bold: true, color: YELLOW, fontFace: "Calibri", margin: 0 });
  s.addText("Eine Big-Data-Engineering-Pipeline mit Apache Kafka, Apache Spark & MongoDB", { x: 0.5, y: 3.65, w: 9, h: 0.4, fontSize: 16, color: ICE, fontFace: "Calibri", margin: 0 });
  s.addText("Aron Milojevic   ·   Mateusz Pacyga   ·   Ajay Pal", { x: 0.5, y: 4.7, w: 9, h: 0.35, fontSize: 14, bold: true, color: WHITE, fontFace: "Calibri", margin: 0 });
  s.addText("NYC TLC Yellow-Taxi-Daten · Januar 2023", { x: 0.5, y: 5.05, w: 9, h: 0.3, fontSize: 12, color: GRAY, fontFace: "Calibri", margin: 0 });

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.chart, "Die Fragestellung");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1.55, w: 5.6, h: 2.2, fill: { color: NAVY }, rectRadius: 0.1 });
  s.addText([
    { text: "Wie beeinflussen Wetterbedingungen\n", options: { bold: true, color: WHITE, fontSize: 19, breakLine: true } },
    { text: "(Temperatur, Regen, Schnee) die stündliche\nTaxinachfrage in New York City?", options: { color: ICE, fontSize: 16 } },
  ], { x: 0.85, y: 1.8, w: 4.95, h: 1.7, fontFace: "Calibri", valign: "middle", margin: 0, lineSpacingMultiple: 1.1 });
  s.addText("Der Fokus liegt auf dem Data-Engineering-Setup, nicht auf komplexer Statistik.", { x: 0.5, y: 3.95, w: 5.6, h: 0.7, fontSize: 13, italic: true, color: GRAY, fontFace: "Calibri", margin: 0 });

  const stats = [["~3 Mio.", "Taxifahrten im Rohdatensatz"], ["744", "Wetterstunden (Jan 2023)"], ["3", "Datenquellen · 2 Kafka-Topics"]];
  let sy = 1.55;
  for (const [big, lab] of stats) {
    card(s, pres, 6.4, sy, 3.1, 0.98);
    s.addText(big, { x: 6.55, y: sy + 0.06, w: 1.7, h: 0.86, fontSize: 30, bold: true, color: NAVY2, fontFace: "Calibri", valign: "middle", margin: 0 });
    s.addText(lab, { x: 8.2, y: sy + 0.06, w: 1.25, h: 0.86, fontSize: 11.5, color: GRAY, fontFace: "Calibri", valign: "middle", margin: 0 });
    sy += 1.12;
  }

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.arrow, "Architektur & Datenfluss");
  const iw = 4.0 * 1.743;
  s.addImage({ path: "architektur.png", x: (10 - iw) / 2, y: 1.35, w: iw, h: 4.0 });

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.file, "Drei Datenquellen", "Drei unterschiedliche Akquisitionsarten");
  const sources = [
    [ic.file, "Datei", "Parquet & CSV", "NYC-TLC Yellow-Taxi-\nFahrten und lokaler\nWetter-Snapshot"],
    [ic.api, "REST API", "Open-Meteo", "Historische, stündliche\nWetterdaten für NYC\nprogrammatisch bezogen"],
    [ic.scrape, "Web Scraping", "Wikipedia", "Referenztabelle der fünf\nNYC-Boroughs via\nrequests + BeautifulSoup"],
  ];
  let cx = 0.5;
  for (const [ico, h1, h2, body] of sources) {
    card(s, pres, cx, 1.6, 2.97, 3.3);
    s.addShape(pres.shapes.OVAL, { x: cx + 1.19, y: 1.85, w: 0.6, h: 0.6, fill: { color: YELLOW } });
    s.addImage({ data: ico, x: cx + 1.33, y: 1.99, w: 0.32, h: 0.32 });
    s.addText(h1, { x: cx + 0.1, y: 2.6, w: 2.77, h: 0.4, fontSize: 18, bold: true, color: NAVY2, align: "center", fontFace: "Calibri", margin: 0 });
    s.addText(h2, { x: cx + 0.1, y: 3.0, w: 2.77, h: 0.3, fontSize: 13, bold: true, color: YELLOW, align: "center", fontFace: "Calibri", margin: 0 });
    s.addText(body, { x: cx + 0.2, y: 3.4, w: 2.57, h: 1.35, fontSize: 12.5, color: GRAY, align: "center", fontFace: "Calibri", margin: 0, lineSpacingMultiple: 1.05 });
    cx += 3.13;
  }

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.kafka, "Ingestion & Verarbeitung", "Kafka als Broker, Spark als Verarbeitungsschicht");
  card(s, pres, 0.5, 1.7, 4.0, 3.15);
  s.addShape(pres.shapes.OVAL, { x: 0.85, y: 2.0, w: 0.7, h: 0.7, fill: { color: NAVY } });
  s.addImage({ data: ic.kafka, x: 1.02, y: 2.17, w: 0.36, h: 0.36 });
  s.addText("Apache Kafka", { x: 1.7, y: 2.02, w: 2.7, h: 0.4, fontSize: 19, bold: true, color: NAVY2, fontFace: "Calibri", valign: "middle", margin: 0 });
  s.addText("Zentraler Daten-Broker", { x: 1.7, y: 2.4, w: 2.7, h: 0.3, fontSize: 12, color: YELLOW, bold: true, fontFace: "Calibri", margin: 0 });
  s.addText([
    { text: "Producer schreiben JSON-Events", options: { bullet: true, breakLine: true } },
    { text: "Topic nyc_taxi_trips (120.000)", options: { bullet: true, breakLine: true } },
    { text: "Topic nyc_weather (744)", options: { bullet: true, breakLine: true } },
    { text: "KRaft-Modus, Port 29092", options: { bullet: true } },
  ], { x: 0.95, y: 2.95, w: 3.45, h: 1.75, fontSize: 13, color: INK, fontFace: "Calibri", margin: 0, paraSpaceAfter: 6 });

  s.addShape(pres.shapes.OVAL, { x: 4.62, y: 3.05, w: 0.75, h: 0.75, fill: { color: YELLOW } });
  s.addImage({ data: ic.arrow, x: 4.62, y: 3.05, w: 0.75, h: 0.75 });

  card(s, pres, 5.5, 1.7, 4.0, 3.15);
  s.addShape(pres.shapes.OVAL, { x: 5.85, y: 2.0, w: 0.7, h: 0.7, fill: { color: NAVY } });
  s.addImage({ data: ic.spark, x: 6.04, y: 2.17, w: 0.34, h: 0.36 });
  s.addText("Apache Spark", { x: 6.7, y: 2.02, w: 2.7, h: 0.4, fontSize: 19, bold: true, color: NAVY2, fontFace: "Calibri", valign: "middle", margin: 0 });
  s.addText("Verarbeitungsschicht", { x: 6.7, y: 2.4, w: 2.7, h: 0.3, fontSize: 12, color: YELLOW, bold: true, fontFace: "Calibri", margin: 0 });
  s.addText([
    { text: "Liest beide Topics aus Kafka", options: { bullet: true, breakLine: true } },
    { text: "Parst JSON, rundet auf Stunde", options: { bullet: true, breakLine: true } },
    { text: "Aggregiert Nachfrage & Zahlung", options: { bullet: true, breakLine: true } },
    { text: "Join Nachfrage <-> Wetter", options: { bullet: true } },
  ], { x: 5.95, y: 2.95, w: 3.45, h: 1.75, fontSize: 13, color: INK, fontFace: "Calibri", margin: 0, paraSpaceAfter: 6 });

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.db, "Speicherung (ETL-Output)", "Ergebnisse persistiert für die spätere Nutzung");
  card(s, pres, 0.5, 1.7, 4.4, 3.1);
  s.addShape(pres.shapes.OVAL, { x: 0.85, y: 2.0, w: 0.7, h: 0.7, fill: { color: "2C7A4B" } });
  s.addImage({ data: ic.db, x: 1.03, y: 2.18, w: 0.34, h: 0.34 });
  s.addText("MongoDB (NoSQL)", { x: 1.7, y: 2.05, w: 3.0, h: 0.6, fontSize: 18, bold: true, color: NAVY2, fontFace: "Calibri", valign: "middle", margin: 0 });
  s.addText([
    { text: "demand_weather_hourly  (744)", options: { bullet: true, breakLine: true } },
    { text: "demand_by_weather  (3)", options: { bullet: true, breakLine: true } },
    { text: "payment_mix  (4)", options: { bullet: true, breakLine: true } },
    { text: "nyc_boroughs  (5)", options: { bullet: true } },
  ], { x: 0.95, y: 2.95, w: 3.85, h: 1.7, fontSize: 13.5, color: INK, fontFace: "Calibri", margin: 0, paraSpaceAfter: 6 });

  card(s, pres, 5.1, 1.7, 4.4, 3.1);
  s.addShape(pres.shapes.OVAL, { x: 5.45, y: 2.0, w: 0.7, h: 0.7, fill: { color: BLUE } });
  s.addImage({ data: ic.save, x: 5.63, y: 2.18, w: 0.34, h: 0.34 });
  s.addText("Flat Files", { x: 6.3, y: 2.05, w: 3.0, h: 0.6, fontSize: 18, bold: true, color: NAVY2, fontFace: "Calibri", valign: "middle", margin: 0 });
  s.addText([
    { text: "Parquet + CSV im Ordner output/", options: { bullet: true, breakLine: true } },
    { text: "Spaltenorientiert & komprimiert", options: { bullet: true, breakLine: true } },
    { text: "Langfristige Archivierung", options: { bullet: true, breakLine: true } },
    { text: "Direkt in Pandas nutzbar", options: { bullet: true } },
  ], { x: 5.55, y: 2.95, w: 3.85, h: 1.7, fontSize: 13.5, color: INK, fontFace: "Calibri", margin: 0, paraSpaceAfter: 6 });

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.rain, "Nachfrage nach Wetterlage");
  s.addChart(pres.charts.BAR, [{ name: "Fahrten/Stunde", labels: ["Trocken", "Regen", "Schnee"], values: [160.0, 166.6, 175.3] }], {
    x: 0.4, y: 1.5, w: 5.7, h: 3.7, barDir: "col",
    chartColors: [NAVY2, BLUE, YELLOW],
    chartArea: { fill: { color: WHITE } },
    catAxisLabelColor: GRAY, valAxisLabelColor: GRAY, catAxisLabelFontSize: 13, valAxisLabelFontSize: 11,
    valGridLine: { color: "EDEFF4", size: 0.5 }, catGridLine: { style: "none" },
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: NAVY2, dataLabelFontSize: 13, dataLabelFontBold: true,
    showLegend: false, valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 200,
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.35, y: 1.7, w: 3.2, h: 3.2, fill: { color: NAVY }, rectRadius: 0.1 });
  s.addText("Erkenntnis", { x: 6.6, y: 1.95, w: 2.7, h: 0.35, fontSize: 14, bold: true, color: YELLOW, fontFace: "Calibri", margin: 0 });
  s.addText([
    { text: "Die Nachfrage bricht bei schlechtem Wetter nicht ein.\n\n", options: { color: WHITE, fontSize: 14, bold: true, breakLine: true } },
    { text: "Bei Regen und Schnee liegt die stündliche Nachfrage sogar leicht höher als bei trockenem Wetter.", options: { color: ICE, fontSize: 13 } },
  ], { x: 6.6, y: 2.4, w: 2.7, h: 2.35, fontFace: "Calibri", valign: "top", margin: 0, lineSpacingMultiple: 1.05 });

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.clock, "Tagesrhythmus & Zahlungsarten");
  const hours = [106.0,74.6,51.9,34.2,21.3,23.1,53.6,105.1,146.6,160.6,180.6,195.7,213.1,226.0,246.7,241.3,251.1,266.9,274.7,245.7,211.6,205.7,189.9,144.8];
  s.addChart(pres.charts.LINE, [{ name: "Fahrten/Stunde", labels: hours.map((_, i) => (i % 3 === 0 ? String(i) : "")), values: hours }], {
    x: 0.4, y: 1.55, w: 5.7, h: 3.6, lineSize: 3, lineSmooth: true, chartColors: [NAVY2],
    chartArea: { fill: { color: WHITE } }, catAxisLabelColor: GRAY, valAxisLabelColor: GRAY,
    catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, valGridLine: { color: "EDEFF4", size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
  });
  s.addText("Pendler-Spitzen morgens (8-9h) und abends (17-19h)", { x: 0.5, y: 5.15, w: 5.6, h: 0.3, fontSize: 11.5, italic: true, color: GRAY, fontFace: "Calibri", margin: 0 });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Zahlung", labels: ["Kreditkarte", "Bargeld", "Streit", "Keine Gebühr"], values: [97839, 21045, 705, 411] }], {
    x: 6.2, y: 1.6, w: 3.5, h: 3.4, chartColors: [NAVY2, YELLOW, BLUE, "C0C8D4"],
    showLegend: true, legendPos: "b", legendColor: GRAY, legendFontSize: 11,
    showPercent: true, dataLabelColor: WHITE, dataLabelFontSize: 10, holeSize: 55, title: "Zahlungsarten", showTitle: true, titleColor: NAVY2, titleFontSize: 14,
  });

  s = pres.addSlide();
  s.background = { color: WHITE };
  titleBlock(s, pres, ic.bulb, "Erkenntnisse");
  const insights = [
    [ic.rain, "Wetterresistente Nachfrage", "Regen und Schnee senken das Fahrtaufkommen nicht - Niederschlag verlagert die Mobilität eher ins Taxi."],
    [ic.clock, "Pendler-Rhythmus dominiert", "Der stärkste Treiber sind die Stoßzeiten am Morgen und Abend, nicht das Wetter."],
    [ic.temp, "Temperatur schwacher Prädiktor", "Die reine Temperatur erklärt die Nachfrage kaum; Tageszeit und Wetterart sind aussagekräftiger."],
  ];
  let iy = 1.6;
  for (const [ico, h1, body] of insights) {
    card(s, pres, 0.5, iy, 9.0, 1.02);
    s.addShape(pres.shapes.OVAL, { x: 0.78, y: iy + 0.24, w: 0.55, h: 0.55, fill: { color: YELLOW } });
    s.addImage({ data: ico, x: 0.9, y: iy + 0.36, w: 0.31, h: 0.31 });
    s.addText(h1, { x: 1.6, y: iy + 0.13, w: 7.6, h: 0.38, fontSize: 17, bold: true, color: NAVY2, fontFace: "Calibri", margin: 0 });
    s.addText(body, { x: 1.6, y: iy + 0.5, w: 7.7, h: 0.42, fontSize: 12.5, color: GRAY, fontFace: "Calibri", margin: 0 });
    iy += 1.14;
  }

  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 0.5, y: 0.5, w: 0.72, h: 0.72, fill: { color: YELLOW } });
  s.addImage({ data: ic.taxi, x: 0.66, y: 0.66, w: 0.4, h: 0.4 });
  s.addText("Fazit", { x: 1.35, y: 0.5, w: 8, h: 0.72, fontSize: 32, bold: true, color: WHITE, fontFace: "Calibri", valign: "middle", margin: 0 });
  s.addText("Eine vollständige Big-Data-Engineering-Pipeline - von drei heterogenen Quellen über Kafka und Spark bis zur persistenten Speicherung - läuft reproduzierbar und fehlerfrei durch.", { x: 0.5, y: 1.5, w: 9, h: 0.9, fontSize: 15, color: ICE, fontFace: "Calibri", margin: 0, lineSpacingMultiple: 1.1 });
  const done = ["3 Datenquellen (Datei, REST-API, Scraping)", "Kafka als zentraler Daten-Broker", "Spark liest & verarbeitet aus Kafka", "MongoDB + Flat Files als ETL-Output", "Story & 7 Visualisierungen", "Dokumentiert im Jupyter Notebook"];
  let dy = 2.65, dx = 0.5;
  done.forEach((t, i) => {
    const col = i % 2;
    const xx = 0.5 + col * 4.75;
    if (i % 2 === 0 && i > 0) dy += 0.62;
    const yy = 2.65 + Math.floor(i / 2) * 0.62;
    s.addImage({ data: ic.check, x: xx, y: yy + 0.02, w: 0.3, h: 0.3 });
    s.addText(t, { x: xx + 0.42, y: yy - 0.03, w: 4.2, h: 0.4, fontSize: 13.5, color: WHITE, fontFace: "Calibri", valign: "middle", margin: 0 });
  });
  s.addText([
    { text: "GitHub:  ", options: { color: GRAY, fontSize: 13 } },
    { text: "github.com/milojevicaa/BD_NYC_Taxi_Weather", options: { color: YELLOW, fontSize: 13, bold: true } },
  ], { x: 0.5, y: 5.0, w: 9, h: 0.4, fontFace: "Calibri", margin: 0 });

  await pres.writeFile({ fileName: "NYC_Taxi_Wetter_Praesentation.pptx" });
  console.log("PPTX geschrieben");
})();
