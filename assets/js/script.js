const today = new Date();
let endDate = today.toISOString().split("T")[0];
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7);
let startDate = sevenDaysAgo.toISOString().split("T")[0];

let latitude = "";
let longitude = "";
let city = undefined;
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Geolocation is not supported by your browser")
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Error retrieving location: ${error.message}`));
      }
    );
  });
};

const retrieveWeather = async () => {
  const url = !city
    ? `https://api.weatherapi.com/v1/forecast.json?aqi=yes&days=6&key=b5c797c080df4a2bb9c80049231405&q=${latitude},${longitude}`
    : `https://api.weatherapi.com/v1/forecast.json?aqi=yes&days=6&key=b5c797c080df4a2bb9c80049231405&q=${city}`;

  const response = await fetch(url);
  return response.json();
};

const retrieveHistory = async () => {
  const url = !city
    ? `https://api.weatherapi.com/v1/history.json?days=6&dt=${startDate}&end_dt=${endDate}&key=b5c797c080df4a2bb9c80049231405&q=${latitude},${longitude}`
    : `https://api.weatherapi.com/v1/history.json?days=6&dt=${startDate}&end_dt=${endDate}&key=b5c797c080df4a2bb9c80049231405&q=${city}`;

  const response = await fetch(url);
  return response.json();
};

const setLocation = (location) => {
  document.getElementById(
    "current-location"
  ).innerText = `Location: ${location.name} / ${location.country}`;
  document.getElementById(
    "last-updated-time"
  ).innerText = `Last Updated: ${location.localtime}`;
};

const setCompass = (dir, wind) => {
  document.getElementById("windSpeed").innerText = wind;

  const compassMap = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };

  const deg = compassMap[dir];

  if (typeof deg !== "undefined") {
    const rotationAngle = (deg + 180) % 360;
    document.getElementById(
      "arrowSVG"
    ).style.transform = `rotate(${rotationAngle}deg)`;
  }
};

const setAQ = (aq) => {
  document.getElementById("epa-index").innerText = aq["us-epa-index"];
  document.getElementById("a_q").innerText =
    aq["us-epa-index"] < 50
      ? "Good"
      : aq["us-epa-index"] < 100
      ? "Moderate"
      : "Unhealthy";
};

const setBackgroundImage = (day, condition) => {
  const body = document.querySelector("body");
  let imageUrl = "";

  // switch (true) {
  //   case condition.includes("cloudy"):
  //     imageUrl = `/assets/images/images/day-cloud.jpg`;
  //     break;
  //   case condition.includes("Sunny"):
  //     imageUrl = `/assets/images/images/day-sunny.jpg`;
  //     break;
  //   case condition.includes("Thundery"):
  //     imageUrl = `/assets/images/images/thunder.jpg`;
  //     break;
  //   default:
  //     imageUrl = `/assets/images/images/default.jpg`;
  // }
  imageUrl = `/assets/images/images/def-back.jpg`;

  body.style.backgroundImage = `url(${imageUrl})`;
};
const setCurrentWeather = (data) => {
  const isDay = data.isDay === 1;

  document.getElementById("temp").innerText = `${data.temp_c} °C`;
  document.getElementById("icon-weather").innerHTML = `<img src="https://${
    data.condition.icon.split("//")[1]
  }">`;
  document.getElementById("humid").innerText = `${data.humidity}`;
  document.getElementById("feellike").innerText = `${data.feelslike_c} °C`;
  document.getElementById("pressure").innerText = `${data.pressure_mb} hPa`;
  document.getElementById("uv").innerText = `${data.uv}`;
  document.getElementById("visib").innerText = `${data.vis_km} km`;
  document.getElementById(
    "today_condition"
  ).innerText = `(${data.condition.text})`;

  setCompass(data.wind_dir, data.wind_kph);
  setAQ(data.air_quality);
  setBackgroundImage(isDay ? "day" : "night", data.condition.text);
};

const setPredictionToday = (data) => {
  const currentHour = new Date().getHours();
  for (let index = currentHour + 1, y = 1; y <= 4; index++, y++) {
    const hour = index > 23 ? index - 24 : index;
    document.getElementById(`h${y}_time`).innerText = `${
      data[hour].time.split(" ")[1]
    }`;
    document.getElementById(
      `h${y}_icon-weather`
    ).innerHTML = `<img src="https://${
      data[hour].condition.icon.split("//")[1]
    }">`;
    document.getElementById(`h${y}_temp`).innerText = `${data[hour].temp_c} °C`;
  }
};

const setAstro = (data) => {
  for (const key in data) {
    const el = document.getElementById(key);
    if (el) {
      el.innerText = `${key} : ${data[key]}`;
    }
    continue;
  }
};

const setForecast = (data) => {
  for (let i = 0; i < data.length; i++) {
    document.getElementById(`d${i + 1}_date`).innerText = `${data[i].date}`;
    document.getElementById(
      `d${i + 1}_icon-weather`
    ).innerHTML = `<img src="https://${
      data[i].day.condition.icon.split("//")[1]
    }">`;
    document.getElementById(
      `d${i + 1}_temp`
    ).innerText = `${data[i].day.avgtemp_c} °C`;
  }
};

const setHistory = async () => {
  const res = await retrieveHistory();
  const weatherData = res.forecast.forecastday;
  const table = document.getElementById("history-table");

  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  weatherData.forEach((element) => {
    const day = element.day;

    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.textContent = element.date;
    dateCell.classList.add("px-4", "py-2", "border", "text-center");
    row.appendChild(dateCell);

    const tempCell = document.createElement("td");
    tempCell.textContent = day.avgtemp_c;
    tempCell.classList.add("px-4", "py-2", "border", "text-center");

    row.appendChild(tempCell);

    const imageCell = document.createElement("td");
    const image = document.createElement("img");
    image.src = `https://${day.condition.icon.split("//")[1]}`;
    imageCell.classList.add("px-4", "py-2", "border", "flex", "justify-center");

    imageCell.appendChild(image);

    row.appendChild(imageCell);

    const conditionCell = document.createElement("td");
    conditionCell.textContent = day.condition.text;
    conditionCell.classList.add("px-4", "py-2", "border", "text-center");

    row.appendChild(conditionCell);

    table.appendChild(row);
  });
};

const setWeather = async () => {
  try {
    const location = await getCurrentLocation();
    latitude = location.latitude;
    longitude = location.longitude;
    const weatherData = await retrieveWeather();
    setCurrentWeather(weatherData.current);
    setLocation(weatherData.location);
    setPredictionToday(weatherData.forecast.forecastday[0].hour);
    setAstro(weatherData.forecast.forecastday[0].astro);
    setForecast(weatherData.forecast.forecastday);
    setHistory();
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", setWeather);

document.getElementById("end-date").addEventListener("change", (e) => {
  const selectedDate = new Date(e.target.value);
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  endDate = `${year}-${month}-${day}`;
  setHistory();
});

document.getElementById("start-date").addEventListener("change", (e) => {
  const selectedDate = new Date(e.target.value);
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  startDate = `${year}-${month}-${day}`;
  setHistory();
});

document.getElementById("city-submit").addEventListener("click", () => {
  city = document.getElementById("city-input").value;
  setWeather();
});
