let latitude = [];
let longitude = [];
let searchButton = document.getElementById("search-btn");
let ipSearchButton = document.getElementById("ip-search-btn");
let columnData = document.getElementById("column-1");
let clearButton = document.getElementById("clear-btn");
let cityInputElem = document.getElementById("city-input");
let selectedStateElem = document.getElementById("state-input");
// let saveBtn = document.querySelector(".save-btn");
let savedList = document.getElementById("saved-list");
let deleteBtn = document.querySelector(".dlt")

let saveButton = $(".save-btn");

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
        let performer = document.getElementById("column-" + [i]);
        let showVenue = document.getElementById("venue-" + [i]);
        let showDate = document.getElementById("time-" + [i]);

        showDate.innerText = dayjs(data.events[i].datetime_local).format(
          "dddd, MMM D, YYYY h:mmA"
        );
        performer.innerText = data.events[i].short_title;
        showVenue.innerText = data.events[i].venue.name;
        let artist = data.events[i].short_title;
        let venueAddress = data.events[i].venue.address;
        let venuePostalCode = data.events[i].venue.postal_code;
        // saveConcert(artist, venueAddress, venuePostalCode);
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
}

function saveConcert(artist, venueAddress, venuePostalCode) {
  let concertSearch = JSON.parse(localStorage.getItem("concert-search")) || [];
  concertSearch.push(`${artist}, ${venueAddress}, ${venuePostalCode}`);
  localStorage.setItem("concert-search", JSON.stringify(concertSearch));
}

function saveConcert2() {
  const parent = this.parentElement.parentElement;
  const title = parent.querySelector(".title").textContent;
  const subtitle = parent.querySelector(".subtitle").textContent;
  const time = parent.querySelector(".mg-top").textContent;
  
  let concertSearch = JSON.parse(localStorage.getItem("concert-search")) || [];
  concertSearch.push(`${title}, ${subtitle}, ${time}`);
  localStorage.setItem("concert-search", JSON.stringify(concertSearch));
}

$(function() {
  saveButton.on("click", function(){
    let clickedSaveButton = $(this);
    let title = clickedSaveButton.closest(".control").siblings(".title").text();
    let subtitle = clickedSaveButton.closest(".control").siblings(".subtitle").text();
    let time = clickedSaveButton.closest(".control").siblings(".time").text();
    let concertSearch = JSON.parse(localStorage.getItem("concert-search")) || [];
    concertSearch.push(`${title}, ${subtitle}, ${time}`);
    localStorage.setItem("concert-search", JSON.stringify(concertSearch));
  });
}

);

function renderSearch() {
  let savedSearches = JSON.parse(localStorage.getItem("concert-search"));
  let uniqueData = [...new Set(savedSearches)];
  for (let index = 0; index < uniqueData.length; index++) {
    let concertInfo = document.createElement("li");
    concertInfo.textContent = uniqueData[index];
    savedList.appendChild(concertInfo);
  }
}

function deleteConcerts() {
  localStorage.clear();
}

function init() {
  renderSearch();
}
init();
clearButton.addEventListener("click", clearSearch);
searchButton.addEventListener("click", getCityApi);
ipSearchButton.addEventListener("click", getCurrentIpApi);
deleteBtn.addEventListener("click", deleteConcerts)

// saveBtn.addEventListener("click", saveConcert2);
