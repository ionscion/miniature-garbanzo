let latitude = [];
let longitude = [];
let searchButton = document.getElementById("search-btn");
let ipSearchButton = document.getElementById("ip-search-btn");
let columnData = document.getElementById("column-1");
let clearButton = document.getElementById("clear-btn");
let cityInputElem = document.getElementById("city-input");
let selectedStateElem = document.getElementById("state-input");
let savedList = document.getElementById("saved-list");
let deleteBtn = document.querySelector(".dlt");
let saveButton = $(".save-btn");
let failure = document.getElementById("failure");
let section = document.getElementById("tile-section");

let weatherapi = "326e6d35f7ebe093972477e3b80624aa";
let seatgeekapi = "MzE3NDAyMDR8MTY3NTM1NDU3My4xNzIzODQ";
let ipGeo = "38673022df5a4cfdbd8d9da66bf8a214";

//make city and state mandatory

function getCityApi(evt) {
  evt.preventDefault();
  failure.classList.add("hidden");
  failure.textContent = "";
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
      if (data.length === 0) {
        console.log("no city was found!");
        // Display the failure message
        failure.classList.remove("hidden");
        let failureMessage = document.createElement("p");
        failureMessage.textContent =
          "No city and state combination was found. Please make sure a state has been selected and city spelling is correct.";
        failure.appendChild(failureMessage);
      } else {
        for (let i = 0; i < data.length; i++) {
          const returnedName = data[i].name.toLowerCase();
          if (cityInput.toLowerCase().includes(returnedName)) {
            console.log("city matches exactly");
            latitude.push(data[0].lat);
            longitude.push(data[0].lon);
            console.log(`${latitude},${longitude}`);
          }
        }
        getConcertApi(latitude, longitude);
      }
    })
    .catch(function (error) {
      console.error("There was a problem with the fetch operation:", error);
    });
  clearSearch();
}

// Pulling artist, venue, address and date from SeatGeek API and directions to venue
//Added per_page into URL to bring back 25 results
function getConcertApi() {
  section.classList.remove("hidden");
  clearPage();
  let seatGeekUrl = `https://api.seatgeek.com/2/events?lat=${latitude}&lon=${longitude}&per_page=25&range=5mi&taxonomies.name=concert&client_id=${seatgeekapi}`;
  fetch(seatGeekUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      for (let i = 0; i < 9; i++) {
        let performer = document.getElementById("column-" + [i]);
        let showVenue = document.getElementById("venue-" + [i]);
        let showAddress = document.getElementById("address-" + [i]);
        let showDate = document.getElementById("time-" + [i]);

        showDate.innerText = dayjs(data.events[i].datetime_local).format(
          "dddd, MMM D, YYYY h:mmA"
        );
        performer.innerText = data.events[i].short_title;
        showVenue.innerText = data.events[i].venue.name;
        showAddress.innerHTML =
          '<i class="fa-solid fa-location-dot" aria-hidden="true"> </i> ';
        showAddress.append(
          data.events[i].venue.address + " " + data.events[i].venue.postal_code
        );
        document
          .getElementById("address-" + [i])
          .addEventListener("click", function googleMap() {
            let google = `https://www.google.com/maps/dir/?api=1&destination=${encodeURI(
              data.events[i].venue.address
            )},${encodeURI(data.events[i].venue.city)},${
              data.events[i].venue.state
            },${data.events[i].venue.postal_code}&travelmode=driving`;
            window.open(google, "_blank");
          });

        document
          .getElementById("ticket-" + [i])
          .addEventListener("click", function getTickets() {
            let ticketLink = data.events[i].url;
            window.open(ticketLink, "_blank");
          });
      }
    });

  latitude = [];
  longitude = [];
}

//Gets location by IP address
function getCurrentIpApi() {
  failure.classList.add("hidden");
  failure.textContent = "";
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

//Clears the page
function clearPage() {
  columnData.textContent = "";
}

//Clears the search
function clearSearch() {
  cityInputElem.value = "";
  selectedStateElem.value = "";
}

//Saving the concert by clicking on the specific tile
$(function () {
  saveButton.on("click", function () {
    let clickedSaveButton = $(this);
    let title = clickedSaveButton.closest(".control").siblings(".title").text();
    let subtitle = clickedSaveButton
      .closest(".control")
      .siblings(".subtitle")
      .text();
    let time = clickedSaveButton.closest(".control").siblings(".time").text();
    let concertSearch =
      JSON.parse(localStorage.getItem("concert-search")) || [];
    concertSearch.push(`${title}, ${subtitle}, ${time}`);
    localStorage.setItem("concert-search", JSON.stringify(concertSearch));
    renderSearch();
  });
});

//Display the saved concert below in the saved searches section
function renderSearch() {
  savedList.textContent = "";
  let savedSearches = JSON.parse(localStorage.getItem("concert-search"));
  let uniqueData = [...new Set(savedSearches)];
  for (let index = 0; index < uniqueData.length; index++) {
    let concertInfo = document.createElement("li");
    concertInfo.textContent = uniqueData[index];
    savedList.appendChild(concertInfo);
  }
}

//Deletes saved searches
function deleteConcerts() {
  localStorage.clear();
  savedList.textContent = "";
}

//Renders page
function init() {
  renderSearch();
}

init();

//event listeners
clearButton.addEventListener("click", clearSearch);
searchButton.addEventListener("click", getCityApi);
ipSearchButton.addEventListener("click", getCurrentIpApi);
deleteBtn.addEventListener("click", deleteConcerts);
