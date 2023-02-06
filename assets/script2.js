let latitude = [];
let longitude = [];
let searchButton = document.getElementById("search-btn");
let ipSearchButton = document.getElementById("ip-search-btn");
let columnData = document.getElementById("column-1");
let clearButton = document.getElementById("clear-btn");
let cityInputElem = document.getElementById("city-input");
let selectedStateElem = document.getElementById("state-input");

let weatherapi = "326e6d35f7ebe093972477e3b80624aa";
let seatgeekapi = "MzE3NDAyMDR8MTY3NTM1NDU3My4xNzIzODQ";
let ipGeo = "38673022df5a4cfdbd8d9da66bf8a214";

//make city and state mandatory

function getCityApi(evt) {
  evt.preventDefault();
  let cityInput = cityInputElem.value;
  let selectedState = selectedStateElem.value;

  if (cityInput === "New York" || cityInput === "new york") {
    cityInput = "City of New York";
  }

  let cityUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput},${selectedState},US&limit=1&appid=${weatherapi}`;

  fetch(cityUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (let i = 0; i < data.length; i++) {
        const returnedName = data[i].name.toLowerCase();
        if (cityInput.toLowerCase().includes(returnedName)) {
          console.log("city matches exactly");
          latitude.push(data[0].lat);
          longitude.push(data[0].lon);
          console.log(`${latitude},${longitude}`);
        } else {
          console.log("no city was found!");
        }
      }
      // this will be the function Nate is working on below
      getConcertApi(latitude, longitude);
    })
    .catch(function (error) {
      console.error("There was a problem with the fetch operation:", error);
    });
  // searchSave(cityInput, selectedState);
  clearSearch();
}

//temporary to be removed when Nate add his functions
function getConcertApi() {
  clearPage();
  let seatGeekUrl = `https://api.seatgeek.com/2/events?lat=${latitude}&lon=${longitude}&range=5mi&taxonomies.name=concert&client_id=${seatgeekapi}`;
  fetch(seatGeekUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);

      for (let i = 0; i < 6; i++) {
        let performer = document.getElementById("column-"+[i])
        let showVenue = document.getElementById("venue-"+[i])
        let showDate = document.getElementById("time-"+[i])
        
        showDate.innerText = dayjs(data.events[i].datetime_local).format("M/D/YYYY h:mmA")
        performer.innerText = data.events[i].short_title;
        showVenue.innerText = data.events[i].venue.name;
        
      }
    });
  latitude = [];
  longitude = [];
}

function getCurrentIpApi() {
  let ipGeoUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeo}`;
  fetch(ipGeoUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("ip data below");
      console.log(data);
      latitude.push(data.latitude);
      longitude.push(data.longitude);
      getConcertApi(latitude, longitude);
    });
}
function clearPage() {
  columnData.textContent = "";
  //   for (let i = 0; i < 5; i++) {
  //     let currentId = document.getElementById(`day-${i + 1}`);
  //     currentId.textContent = "";
  //   }
}

function clearSearch() {
  cityInputElem.value = "";
  selectedStateElem.value = "";
  console.log("clear search ran");
}

clearButton.addEventListener("click", clearSearch);
searchButton.addEventListener("click", getCityApi);
ipSearchButton.addEventListener("click", getCurrentIpApi);
