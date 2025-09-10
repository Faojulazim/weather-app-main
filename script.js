// Imperial (°F (Fahrenheit))
// Metric (°C (Celsius)))
import { imageAlgorithm } from "./imageAlgorithm.js";
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const all_info_wrapper = document.querySelector("#all-info-wrapper");
const search_container = document.querySelector("#search-container");
let UnitsGlobal = "metric";
let searchCity;
let latlong;

async function getWeather(
  lat,
  lon,
  tempUnit = "celsius",
  speedUnit = "kmh",
  precipitation = "mm"
) {
  const urlOneDay = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,precipitation,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,wind_speed_10m_max&temperature_unit=${tempUnit}&wind_speed_unit=${speedUnit}&precipitation_unit=${precipitation}&forecast_days=1&timezone=auto
`;
  const urlSevenDays = `https://api.open-meteo.com/v1/forecast?
latitude=${lat}&longitude=${lon}&
current_weather=true&
hourly=temperature_2m,apparent_temperature,precipitation,relativehumidity_2m,weathercode&
daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,wind_speed_10m_max,weathercode&
temperature_unit=${tempUnit}&
wind_speed_unit=${speedUnit}&
precipitation_unit=${precipitation}&
forecast_days=7&
timezone=auto

`;
  const responseOneDay = await fetch(urlOneDay);
  const responseSevenDays = await fetch(urlSevenDays);
  const dataJsonOneDay = await responseOneDay.json();
  const dataJsonSevenDays = await responseSevenDays.json();
  renderHTML(dataJsonOneDay, dataJsonSevenDays);
}
async function getSearch(query, isRunnable = true, count = 5) {
  const city = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=${Number(
    count
  )}`;
  const cityData = await fetch(city);
  const cityJson = await cityData.json();
  if (isRunnable) {
    return cityJson;
  }
  searchFunc(cityJson, query);
}
async function searchFunc(cityJson, query) {
  search_container.innerHTML = "";
  let searchHTML = "";
  if (cityJson.results) {
    search_container.classList.add("p-2");
    cityJson.results.forEach((items) => {
      searchHTML += `
      <div id="${items.name}"
        data-searchcard
          class="px-5 py-2 cursor-pointer rounded-lg hover:bg-Neutral700 border border-Neutral800 hover:border-Neutral600 transition-all"
        >
        <h2>${items.name}, ${items.country}</h2>
      </div>`;
      search_container.innerHTML = searchHTML;
      searchClick();
    });
  } else {
    search_container.classList.remove("p-2");
  }
}

searchInput.addEventListener("input", (e) => {
  if (!e.target.value) {
    search_container.classList.remove("p-2");
    return;
  }
  setTimeout(() => {
    getSearch(e.target.value, false);
  }, 100);
});

async function searchClick() {
  const searchCard = document.querySelectorAll("[data-searchcard");
  searchCard.forEach((cards) => {
    cards.addEventListener("click", (e) => {
      searchInput.value = cards.querySelector("h2").innerText;
      searchCity = cards.id;
      search_container.innerHTML = "";
      search_container.classList.remove("p-2");
      const searchBtn = document.querySelector("#searchBtn");
      searchBtn.addEventListener(
        "click",
        async (e) => {
          let searchTag = await getSearch(cards.id, 1, true);
          latlong = {
            latitude: searchTag.results[0].latitude,
            longitude: searchTag.results[0].longitude,
          };
          getWeather(
            latlong.latitude,
            latlong.longitude,
            "celsius",
            "mph",
            "inch"
          );
        },
        { once: true }
      );
    });
  });
}
function getHours(currentDate, weatherFind) {
  let currentVal;
  for (let i = 0; i <= weatherFind.length; i++) {
    if (currentDate == i) {
      currentVal = weatherFind[i];
    }
  }
  return currentVal;
}
function findDayName(date) {
  const dayName = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });
  return dayName;
}
function getHourlyForecast(
  dataJsonSevenDays,
  currentHour,
  dataDays,
  weatherCodes
) {
  let currentWeatherCode = helperDateFunc(
    findDayName(dataJsonSevenDays.current_weather.time),
    dataDays,
    dataJsonSevenDays.daily.time,
    weatherCodes
  );
  let lastHour = currentHour + 8;
  let hoursTemp = currentWeatherCode.days.slice(currentHour, lastHour);
  let hoursWeatherCode = currentWeatherCode.weatherCodesForDay.slice(
    currentHour,
    lastHour
  );

  let hourArr = [];
  for (let i = currentHour; i < lastHour; i++) {
    hourArr.push(i);
  }
  return {
    hoursData: hoursTemp,
    weathercodes: hoursWeatherCode,
    hours: hourArr,
  };
}

function helperDateFunc(currentDayName, dataDays, dailyDates, weatherCodes) {
  let currHourlyData;

  for (let i = 0; i < dataDays.length; i++) {
    if (currentDayName === findDayName(dailyDates[i])) {
      currHourlyData = {
        days: dataDays[i],
        weatherCodesForDay: weatherCodes[i],
      };
    }
  }
  return currHourlyData;
}
function renderHTML(data, dataSevenDays) {
  let cards = "";
  let cardsHourly = "";
  let weekDays = 7;
  let daysData = [];
  let daysWeatherCode = [];

  let weatherArr = {
    current_weather: data.current_weather,
    daily: data.daily,
    daily_units: data.daily_units,
    hourly: data.hourly,
    timezone: data.timezone,
    current_units: data.current_weather_units,
    hourly_units: data.hourly_units,
  };

  let currentDate = new Date(weatherArr.current_weather.time).getHours();

  for (let i = 0; i < weekDays; i++) {
    let chunk = dataSevenDays.hourly.temperature_2m.slice(i * 24, (i + 1) * 24);
    let chunk2 = dataSevenDays.hourly.weathercode.slice(i * 24, (i + 1) * 24);
    daysData.push(chunk);
    daysWeatherCode.push(chunk2);
  }
  console.log(dataSevenDays);

  let currentHourlyForecastArr = getHourlyForecast(
    dataSevenDays,
    currentDate,
    daysData,
    daysWeatherCode
  );
  console.log(currentHourlyForecastArr);

  dataSevenDays.daily.time.map((items, index) => {
    cards += `    
                  <div
                  class="flex flex-col items-center bg-Neutral200/15 border-Neutral300/20 border rounded-lg p-3"
                  >
                    <p class="text-lg">${findDayName(items).slice(0, 3)}</p>
                    <img
                      class="w-[60px] py-4"
                      src="${imageAlgorithm(
                        Number(dataSevenDays.daily.weathercode[index])
                      )}"
                      alt=""
                    />
                    <div class="flex items-center justify-between w-full">
                      <p>${dataSevenDays.daily.temperature_2m_max[index]}°</p>
                      <p class="text-Neutral200">${
                        dataSevenDays.daily.temperature_2m_min[index]
                      }°</p>
                    </div>
                  </div>`;
  });
  currentHourlyForecastArr.hoursData.map((items, index) => {
    cardsHourly += `
                  <div
                id="card"
                class="flex items-center justify-between bg-Neutral700 rounded-lg px-3 border border-Neutral200/10"
              >
                <div class="flex items-center gap-x-2 py-2">
                  <img
                    class="w-[40px]"
                    src="${imageAlgorithm(
                      currentHourlyForecastArr.weathercodes[index]
                    )}"
                    alt=""
                  />
                  <p class="uppercase text-lg">5 pm</p>
                </div>
                <p class="mr-1">${items}°</p>
              </div>`;
  });

  all_info_wrapper.innerHTML = "";
  all_info_wrapper.innerHTML = `<div
          class="flex flex-col xl:flex-row mt-5 xl:mt-12 items-stretch h-full gap-x-7"
          id="all-info-container"
        >
          <div class="w-full xl:w-[70%] h-full">
            <div class="h-full" id="weather-forecast-section">
              <div
                id="weather-layout-container"
                class="flex flex-col items-center justify-center mt-7 xl:mt-0 relative rounded-2xl py-10 overflow-hidden w-full bg-[url('assets/images/bg-today-small.svg')] 600:bg-[url('assets/images/bg-today-large.svg')] bg-cover bg-[0_90%] 600:bg-[0%_60%] bg-no-repeat h-full"
              >
                <!-- <img
                  class="absolute w-full 600:hidden top-0 left-0 object-cover -z-[200] h-full"
                  src="assets/images/bg-today-small.svg"
                  alt=""
                />
                <img
                  class="absolute hidden 600:block h-full w-full top-0 left-0 object-cover -z-[200]"
                  src="assets/images/bg-today-large.svg"
                  alt=""
                /> -->
                <div
                  class="flex flex-col md:flex-row md:px-7 justify-between md:py-10 items-center mt-4 font-DMSans w-full"
                >
                  <div
                    id="primary-card"
                    class="flex flex-col gap-y-1 md:gap-y-2 items-center md:items-start"
                  >
                    <h1 class="font-[600] text-3xl md:text-4xl">
                      ${searchInput.value}
                    </h1>

                    <p class="md:text-lg">${new Date(
                      weatherArr.current_weather.time
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</p>
                  </div>
                  <div
                    class="flex mt-2 md:mt-0 items-center justify-between px-5 md:px-0 md:pr-2 md:gap-x-5"
                  >
                    <img
                      class="w-[120px]"
                      src="${imageAlgorithm(
                        Number(weatherArr.current_weather.weathercode)
                      )}"
                      alt=""
                    />
                    <h1 class="text-8xl font-[700] italic">
                    ${weatherArr.current_weather.temperature}°</h1>
                  </div>
                </div>
              </div>
              <div
                id="additional-info-container"
                class="font-DMSans grid grid-cols-[repeat(1,minmax(50px,1fr))] 425:grid-cols-[repeat(2,minmax(50px,1fr))] 600:grid-cols-[repeat(3,minmax(50px,1fr))] md:grid-cols-[repeat(4,minmax(50px,1fr))] gap-4 lg:gap-5 mt-5"
              >
                <div
                  id="card"
                  class="flex flex-col gap-y-4 text-Neutral200 bg-Neutral200/20 px-4 py-3 rounded-lg border border-Neutral300/20"
                >
                  <h3 class="text-lg">Feels Like</h3>
                  <h1 class="text-3xl text-white">${getHours(
                    currentDate,
                    weatherArr.hourly.apparent_temperature
                  )}°</h1>
                </div>
                <div
                  id="card"
                  class="flex flex-col gap-y-4 text-Neutral200 bg-Neutral200/20 px-4 py-3 rounded-lg border border-Neutral300/20"
                >
                  <h3 class="text-lg">Humidity</h3>
                  <h1 class="text-3xl text-white">${getHours(
                    currentDate,
                    weatherArr.hourly.relativehumidity_2m
                  )}%</h1>
                </div>
                <div
                  id="card"
                  class="flex flex-col gap-y-4 text-Neutral200 bg-Neutral200/20 px-4 py-3 rounded-lg border border-Neutral300/20"
                >
                  <h3 class="text-lg">Wind</h3>
                  <h1 class="text-3xl text-white">
                  ${weatherArr.current_weather.windspeed}
                  ${weatherArr.current_units.windspeed}</h1>
                </div>
                <div
                  id="card"
                  class="flex flex-col gap-y-4 text-Neutral200 bg-Neutral200/20 px-4 py-3 rounded-lg border border-Neutral300/20"
                >
                  <h3 class="text-lg">Precipitation</h3>
                  <h1 class="text-3xl text-white">${
                    weatherArr.daily.precipitation_sum
                  }
                  ${weatherArr.daily_units.precipitation_sum}</h1>
                </div>
              </div>
              <div id="forecast-info-container" class="font-DMSans mt-7">
                <p class="font-[500] text-lg">Daily Forecast</p>
                <div
                  id="forecast-container"
                  class="mt-3 grid grid-cols-[repeat(3,minmax(50px,1fr))] 425:grid-cols-[repeat(4,minmax(50px,1fr))] 500:grid-cols-[repeat(5,minmax(50px,1fr))] md:grid-cols-[repeat(7,minmax(50px,1fr))] gap-4"
                >     
                ${cards}
                </div>
              </div>
            </div>
          </div>
          <div
            id="forecast-info-container"
            class="font-DMSans rounded-lg px-4 py-3 mt-5 xl:mt-0 flex flex-col gap-y-3 min-h-full w-full xl:w-[30%] bg-Neutral800 lg:rounded-2xl"
          >
            <div class="flex items-center justify-between cursor-pointer">
              <p class="font-[500] text-lg">Hourly Forecast</p>
              <div
                class="flex items-center px-3 py-[6px] gap-x-2 bg-Neutral600 rounded-md"
              >
                <p>${"Tuesday"}</p>
                <img src="assets/images/icon-dropdown.svg" alt="" />
              </div>
            </div>
            <div class="flex flex-col gap-y-4 mt-2">
              
              ${cardsHourly}
            </div>
          </div>
        </div>`;
}
