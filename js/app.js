// API to use are Google and Yelp

/* *********************************** Model **************************************
List of places:
1. AT&T Park 
2. Ghirardelli Square
3. Oracle Arena
4. Cliff House
5. Koit Tower
6. Orpheum Theater
7. Ike's Place
*/

var Model = [
    {
        title: 'AT&T Park',
        gLatLng: [37.778582, -122.389270],
        bizID: 'at-and-t-park-san-francisco'
    },
    {
        title: 'Ghirardelli Square',
        gLatLng: [37.805832, -122.423011],
        bizID: 'ghirardelli-square-san-francisco?osq=Ghirdelli'
    },
    {
        title: 'Oracle Arena',
        gLatLng: [37.750350, -122.203031],
        bizID: 'oracle-arena-oakland'
    },
    {
        title: 'Cliff House',
        gLatLng: [37.778472, -122.513952],
        bizID: 'the-cliff-house-bistro-san-francisco'
    },
    { 
        title: 'Coit Tower',
        gLatLng: [37.802392, -122.405821],
        bizID: 'coit-tower-san-francisco'

    },
    {
        title: 'Orpheum Theatre',
        gLatLng: [37.779383, -122.414713],
        bizID: 'orpheum-theatre-san-francisco'
    },
    {
        title: 'Ike\'s Place',
        gLatLng: [37.764202, -122.430606],
        bizID: 'ikes-place-san-francisco'
    }
];
// *********************************** View Model *********************************
var ViewModel = function() {

    var map = initializeMap();
    var markers =initializeMarkers(Model, map);
};

// ******************************** End of View Model ******************************

function initializeMap(){
        var mapOptions = {
            zoom: 14,
            center: new google.maps.LatLng(37.778790, -122.389259)
        };
        return new google.maps.Map(document.getElementById("map_container"), mapOptions);
} 

  // create function for markers
function initializeMarkers(data, map_view) {
    var markers = [];
    var infowindows;
    for (var i =0; i<data.length; i++) {
        var name = data[i].title;
        var lat = data[i].gLatLng[0];
        var lng = data[i].gLatLng[1];
        var marker_latlng = new google.maps.LatLng(lat, lng); 

        // create empty infowindow
        infowindows = new google.maps.InfoWindow();

        markers[i] = new google.maps.Marker({
            position: marker_latlng,
            map: map_view,
            title: name 
        }); 

        // need to use closures to make it so that it doesn't always reference last clicked index
        google.maps.event.addListener(markers[i], 'click', function(j) {
            return function() {
                infowindows.setContent(data[j].title); //fills content with whatever is clicked
                infowindows.open(map_view, markers[j]);  
            }
        }(i));
    }
    return markers, infowindows; 
} 

ko.applyBindings(ViewModel());