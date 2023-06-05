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
    `http://api.weatherapi.com/v1/current.json?key=b5c797c080df4a2bb9c80049231405&q=${latitude},${longitude}`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

const setLocation = (location) => {};

const getWeatherData = async () => {
  try {
    const location = await getCurrentLocation();
    const weatherData = await retrieveData(
      location.latitude,
      location.longitude
    );
    console.log(weatherData);
    setLocation(weatherData.location);
    setData(weatherData.current);
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener("DOMContentLoaded", getWeatherData);
