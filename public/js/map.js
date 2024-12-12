// Js code to provide map using mapbox api

// JS code to present maps on the show listing page
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12",
  center: JSON.parse(coordinates), // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 10, // starting zoom
});

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(JSON.parse(coordinates)) //Listing.geometry.coordinates
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listingLocation}</h4><p>Exact location will be provided after booking</p>`
    )
  )
  .addTo(map);
