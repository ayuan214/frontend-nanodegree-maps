// API to use are Google and Yelp

/* *********************************** Model ***************************************/

var Model = [
    {
        title: 'AT&T Park', // name of place
        gLatLng: [37.778582, -122.389270], //latlng of place for gmaps
        bizID: 'at-and-t-park-san-francisco' // bizID to do yelp search
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
    var self = this;
    self.filter = ko.observable(""); // create filter variable for textField to filter
    self.placesList = ko.observableArray([]); // create placeList observable 

    var map = initializeMap(); //create map on screen
    infowindows = new google.maps.InfoWindow(); // create infowindows for gmaps
    self.map = ko.observable(map); //make map observable
    self.infowindows = ko.observable(infowindows); // make infowindows ko.observable
    initializeMarkers(Model, map, infowindows); //create all markers on the map

    Model.forEach(function(placeItem){ 
        self.placesList.push( new Places(placeItem) );// fill placesList with Model data;
    });

    self.filteredItems = ko.computed(function() {
        return ko.utils.arrayFilter(self.placesList(), function(places){
            if (places.title.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1){
                places.marker.setMap(map); //if there are matches make map on screen
            }
            else {
                places.marker.setMap(null); //otherwise if no index map found set marker map to null
            }
            return places.title.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1; //filters the array
        });
    }, self);

   self.clickList = function(data) {
        //runs yelp function that will open info window
    yelpAPI(self.map(), data.marker, data.title, data.bizID, self.infowindows());
   };
};

// ******************************** End of View Model ******************************
function Places(Model) {
    this.title = Model.title;
    this.LatLng = Model.gLatLng;
    this.bizID = Model.bizID;
    this.marker = Model.marker;
}

function initializeMap(){
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(37.778790, -122.389259) // random center location chosen
    };
    return new google.maps.Map(document.getElementById("map_container"), mapOptions);
}

  // create function for markers
function initializeMarkers(data, map_view, infowindows) {
    var markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i =0; i<data.length; i++) {
        var name = data[i].title;
        var lat = data[i].gLatLng[0];
        var lng = data[i].gLatLng[1];
        var marker_latlng = new google.maps.LatLng(lat, lng); 

        markers[i] = new google.maps.Marker({
            position: marker_latlng,
            title: name 
        }); 
        data[i].marker = markers[i];
        bounds.extend(marker_latlng);

        // need to use closures to make it so that it doesn't always reference last clicked index
        google.maps.event.addListener(data[i].marker, 'click', function(j) {
            return function() {
                yelpAPI(map_view, data[j].marker, data[j].title, Model[j].bizID, infowindows); 
            };
        }(i));
    }
    map_view.fitBounds(bounds);
    return data, markers, infowindows;
} 

function yelpAPI (map, markers, title, bizID, infowindows) {
    var auth = {
        consumerKey : "gRRJAGvD01BXyeZkXt9kUw",
        consumerSecret : "RqcoTBNLQaRAbV1bPtFqS_vdWA8",
        accessToken : "JbLZZ9MPRsM7tlv6WXwVex6KfU1t9p8z",
        accessTokenSecret : "8fasPNOG1EXM8dNQQx5n96VHVqk",
        serviceProvider : {
            signatureMethod : "HMAC-SHA1"
        }
    };

    var business = bizID;
    var accessor = {
        consumerSecret : auth.consumerSecret,
        tokenSecret : auth.accessTokenSecret
    };
    parameters = [];
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

    var message = {
        'action' : 'http://api.yelp.com/v2/business/' + business,
        'method' : 'GET',
        'parameters' : parameters
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var parameterMap = OAuth.getParameterMap(message.parameters);
    console.log(parameterMap);

    $.ajax({
        'url' : message.action,
        'data' : parameterMap,
        'cache' : true, //this has to be included after jquery1.6
        'dataType' : 'jsonp',
        'jsonpCallback' : 'cb',
        success : function(data, textStats, XMLHttpRequest) {
            console.log(data);
            console.log(data.rating_img_url);
            var content;
            content = '<div id = \'content\'><h3>' + title + '</h3>' + '<img class = \'yelp_image\' src =' + data.rating_img_url + ' alt = \'Yelp Review\'></div>' ;
            infowindows.setContent(content); //fills content with whatever is clicked
            infowindows.open(map, markers);  
        },
        error : function() {
            var content;
            content = '<div id = \'content\'><h3>' + title + '</h3>' + '<p>Yelp Review unavailable</p></div>' ;
            infowindows.setContent(content); //fills content with whatever is clicked
            infowindows.open(map, markers);  
        }

    });
}

// Initalize Function
ko.applyBindings(new ViewModel());