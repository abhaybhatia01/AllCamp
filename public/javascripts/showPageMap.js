
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});


const layerList = document.getElementById('menu');
const inputs = layerList.getElementsByTagName('input');
 
for (const input of inputs) {
input.onclick = (layer) => {
const layerId = layer.target.id;
map.setStyle('mapbox://styles/mapbox/' + layerId);
};
}


map.addControl(new mapboxgl.FullscreenControl());
map.addControl(new mapboxgl.NavigationControl());

const marker1 = new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:25})
    .setHTML(
        `<h3> ${campground.title}</h3><p> ${campground.location}</p>`
    )
)
.addTo(map);