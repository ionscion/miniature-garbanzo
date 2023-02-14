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
let userChoice = document.getElementById("display-input");
let failure = document.getElementById("failure");
let section = document.getElementById("real-section");
let hideBox = document.getElementById("hide-box");

let weatherapi = "326e6d35f7ebe093972477e3b80624aa";
let seatgeekapi = "MzE3NDAyMDR8MTY3NTM1NDU3My4xNzIzODQ";
let ipGeo = "38673022df5a4cfdbd8d9da66bf8a214";

function getCityApi(evt) {
  evt.preventDefault();
  failure.classList.add("hidden");
  failure.textContent = "";
  let cityInput = cityInputElem.value;
  let selectedState = selectedStateElem.value;

  if (cityInput === "New York" || cityInput === "new york") {
    cityInput = "City of New York";
  }

  //add failure message here if city or state are not selected together because the fetch will fail before the message below happens

  let cityUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput},${selectedState},US&limit=1&appid=${weatherapi}`;

  fetch(cityUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.length === 0) {
        // Display the failure message
        failure.classList.remove("hidden");
        let failureMessage = document.createElement("p");
        failureMessage.textContent =
          "No city and state combination was found. Please make sure a state has been selected and city spelling is correct.";
        failure.appendChild(failureMessage);
        clearSearch();
      } else {
        for (let i = 0; i < data.length; i++) {
          const returnedName = data[i].name.toLowerCase();
          if (cityInput.toLowerCase().includes(returnedName)) {
            latitude.push(data[0].lat);
            longitude.push(data[0].lon);
          }
        }
        getConcertApi(latitude, longitude);
      }
    })
    .catch(function (error) {
      console.error("There was a problem with the fetch operation:", error);
    });
}

// Pulling artist, venue, address and date from SeatGeek API and directions to venue
//Added per_page into URL to bring back 25 results
function getConcertApi() {
  let selectedOutput = userChoice.value;
  let output = 12;
  if (selectedOutput !== "Number of Results") {
    output = selectedOutput;
  }

  let seatGeekUrl = `https://api.seatgeek.com/2/events?lat=${latitude}&lon=${longitude}&per_page=${output}&range=5mi&taxonomies.name=concert&client_id=${seatgeekapi}`;
  fetch(seatGeekUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (let i = 0; i < output; i++) {
        let concertTitle = data.events[i].short_title;
        let concertVenue = data.events[i].venue.name;
        let concertAddress = data.events[i].venue.address;
        let concertTime = dayjs(data.events[i].datetime_local).format(
          "dddd, MMM D, YYYY h:mmA"
        );

        let card = $(`
        
        <div class="tile is-parent">
        <article class="tile is-child box card-clr">
          <p class="title" id="column-${i}">${concertTitle}</p>
          <p class="subtitle" id="venue-${i}">
            ${concertVenue} <br> ${concertTime}
          </p>
          <br>
          <button class="address direct-link mg-top" id="address-${i}">
          <i class="fa-solid fa-location-dot" aria-hidden="true"> ${concertAddress} </i>
          </button> 
          <p class="time" id="time-${i}"></p>
          <div class="control">
            <button
              id="btn-${i}"
              class="save-btn button is-primary artist-btn"
            >
              Save<i
                class="sv-icon ml-2 fa-solid fa-cloud-arrow-down"
              ></i>
            </button>
            <button id="ticket-${i}" class="ticket button">
              <i
                class="tkt mr-2 fa-solid fa-ticket fa-rotate-by"
                style="--fa-rotate-angle: -35deg"
              ></i
              >Tickets
            </button>
          </div>
        </article>
        </div>`);

        // Append the parent div to the appropriate location in the HTML
        $(section).append(card);

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
  clearPage();
  clearSearch();
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
      latitude.push(data.latitude);
      longitude.push(data.longitude);
      getConcertApi(latitude, longitude);
    });
}

//Clears the page
function clearPage() {
  while (section.firstChild) {
    section.removeChild(section.firstChild);
  }
}

//Clears the search
function clearSearch() {
  cityInputElem.value = "";
  selectedStateElem.value = "State";
}

$(document).on("click", ".save-btn", function () {
  let clickedSaveButton = $(this);
  let title = clickedSaveButton.closest(".control").siblings(".title").text();
  let subtitle = clickedSaveButton
    .closest(".control")
    .siblings(".subtitle")
    .text();
  let time = clickedSaveButton.closest(".control").siblings(".time").text();
  let concertSearch = JSON.parse(localStorage.getItem("concert-search")) || [];
  concertSearch.push(`${title} at ${subtitle} ${time}`);
  localStorage.setItem("concert-search", JSON.stringify(concertSearch));
  renderSearch();
});

//Display the saved concert below in the saved searches section
function renderSearch() {
  savedList.textContent = "";
  let savedSearches = JSON.parse(localStorage.getItem("concert-search"));

  //Added if/else to hide the My Saved Searches box if no concerts are saved, and to display box when a concert is saved, and will display on page load if a concert is saved
  if (savedSearches === null) {
    hideBox.style.display = "none";
  } else {
    hideBox.style.display = "block";
  }

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
