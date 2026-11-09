const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const config = require("./config.json");
const { renderCard } = require("./card.js");

const WEATHER_AR = {
  0: "صافي", 1: "غالبًا صافي", 2: "غيوم متفرقة", 3: "غائم",
  45: "ضباب", 48: "ضباب كثيف",
  51: "رذاذ خفيف", 53: "رذاذ", 55: "رذاذ كثيف",
  61: "مطر خفيف", 63: "مطر", 65: "مطر غزير",
  71: "ثلج خفيف", 73: "ثلج", 75: "ثلج كثيف",
  80: "زخات مطر", 81: "زخات مطر قوية", 82: "زخات عنيفة",
  95: "عاصفة رعدية", 96: "عاصفة رعدية + برد", 99: "عاصفة رعدية شديدة",
};

const COMMANDS = ["طقس", "weather"];
const unit = config.unit === "fahrenheit" ? "fahrenheit" : "celsius";
const unitSymbol = unit === "fahrenheit" ? "°F" : "°C";

if (!config.token || config.token === "ضع_توكن_البوت_هنا") {
  console.error("[!] حط توكن البوت في config.json");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function geocode(city) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: city, count: "1", language: "ar", format: "json" });
  const res = await fetch(url);
  const data = await res.json();
  const r = data.results && data.results[0];
  if (!r) return null;
  return { lat: r.latitude, lon: r.longitude, name: r.name || city };
}

async function fetchWeather(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code," +
      "cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
    timezone: "auto",
    forecast_days: "1",
    temperature_unit: unit,
    wind_speed_unit: "kmh",
  });
  const res = await fetch(url);
  const data = await res.json();
  if (!data.current) return null;
  return { current: data.current, daily: data.daily || {} };
}

client.once("ready", () => {
  console.log(`[+] البوت شغال: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
  const cmd = (args.shift() || "").toLowerCase();
  if (!COMMANDS.includes(cmd)) return;

  const cityInput = args.join(" ") || config.default_city;

  try {
    const geo = await geocode(cityInput);
    if (!geo) return message.reply(`ما لقيت مدينة باسم **${cityInput}**.`);

    const data = await fetchWeather(geo.lat, geo.lon);
    if (!data) return message.reply("ما قدرت أجيب بيانات الطقس، جرّب بعد شوي.");

    const png = renderCard({
      city: geo.name,
      current: data.current,
      daily: data.daily,
      unitSymbol,
      descAr: WEATHER_AR[data.current.weather_code] || "غير معروف",
    });
    const file = new AttachmentBuilder(png, { name: "weather.png" });

    let target = message.channel;
    if (config.channel_id && config.channel_id !== "0") {
      const ch = await client.channels.fetch(config.channel_id).catch(() => null);
      if (ch && ch.isTextBased()) target = ch;
    }

    await target.send({ files: [file] });
    if (target.id !== message.channel.id) await message.react("✅").catch(() => {});
  } catch (e) {
    console.error("[!] خطأ:", e);
    message.reply("صار خطأ أثناء جلب الطقس.").catch(() => {});
  }
});

client.login(config.token);
