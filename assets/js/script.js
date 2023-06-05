const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
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
    }
  });
};

const retrieveData = async (latitude, longitude) => {
  console.log(latitude, "ret");
  return fetch(
    `http://api.weatherapi.com/v1/current.json?aqi=yes&key=b5c797c080df4a2bb9c80049231405&q=${latitude},${longitude}`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

const setLocation = (location) => {
  document.getElementById(
    "current-location"
  ).innerText = `Location : ${location.name} / ${location.country}`;
  document.getElementById(
    "last-updated-time"
  ).innerText = ` Last Updated: ${location.localtime}`;
};

const setCompass = (dir, wind) => {
  document.getElementById("windSpeed").innerText = wind;

  console.log(dir);

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
  console.log(deg);

  if (typeof deg !== "undefined") {
    const rotationAngle = (deg + 180) % 360;
    window.requestAnimationFrame(() => {
      document.getElementById("arrowSVG").style.transform =
        "rotate(" + rotationAngle + "deg)";
    });
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

const setData = (data) => {
  console.log(data);
  console.log();
  document.getElementById("temp").innerText = `${data.temp_c} °C`;
  document.getElementById("icon-weather").innerHTML = `<img src="https://${
    data.condition.icon.split("//")[1]
  }">`;

  setCompass(data.wind_dir, data.wind_kph);
  setAQ(data.air_quality);
};

const getWeatherData = async () => {
  try {
    const location = await getCurrentLocation();
    const weatherData = await retrieveData(
      location.latitude,
      location.longitude
    );
    setLocation(weatherData.location);
    setData(weatherData.current);
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", getWeatherData);
