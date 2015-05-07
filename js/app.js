var ViewModel = function() {
    // initalize map

    initializeMap();
    var map;

    function initializeMap(){
        var mapOptions = {
            zoom: 14,
            center: new google.maps.LatLng(37.778790, -122.389259)
        };
        var map = new google.maps.Map(document.getElementById("map_container"), mapOptions);
    } 
};
    
ko.applyBindings(ViewModel());