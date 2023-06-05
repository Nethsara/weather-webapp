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

const retrieveWeather = async (latitude, longitude) => {
  const response = await fetch(
    `http://api.weatherapi.com/v1/forecast.json?aqi=yes&days=6&key=b5c797c080df4a2bb9c80049231405&q=${latitude},${longitude}`
  );
  const data = await response.json();
  return data;
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

const setCurrentWeather = (data) => {
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
};

const setPredictionToday = (data) => {
  const currentHour = new Date().getHours();
  for (
    let index = currentHour + 1, y = 1;
    index < currentHour + 5;
    index++, y++
  ) {
    document.getElementById(`h${y}_time`).innerText = `${
      data[index].time.split(" ")[1]
    }`;
    document.getElementById(
      `h${y}_icon-weather`
    ).innerHTML = `<img src="https://${
      data[index].condition.icon.split("//")[1]
    }">`;
    document.getElementById(
      `h${y}_temp`
    ).innerText = `${data[index].temp_c} °C`;
  }
};

const setAstro = (data) => {
  console.log(typeof data);
  for (const key in data) {
    const el = document.getElementById(key);
    if (el) {
      el.innerText = `${key} : ${data[key]}`;
    }
    continue;
  }
};

const setForecast = (data) => {
  console.log(data);
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

const setWeather = async () => {
  try {
    const location = await getCurrentLocation();
    const weatherData = await retrieveWeather(
      location.latitude,
      location.longitude
    );
    console.log(weatherData);
    setCurrentWeather(weatherData.current);
    setLocation(weatherData.location);
    setPredictionToday(weatherData.forecast.forecastday[0].hour);
    setAstro(weatherData.forecast.forecastday[0].astro);
    setForecast(weatherData.forecast.forecastday);
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", setWeather);
