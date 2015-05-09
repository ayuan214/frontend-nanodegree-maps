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
    var self = this;
    self.filter = ko.observable("");
    self.placesList = ko.observableArray([]);

    // Fills placeList array with observables 
    Model.forEach(function(placeItem){
        self.placesList.push( new Places(placeItem) );
    });

    var map = initializeMap();
    var markers =initializeMarkers(Model, map);
};

// ******************************** End of View Model ******************************
function Places(Model) {
    this.title = ko.observable(Model.title);
    this.LatLng = ko.observableArray(Model.gLatLng);
    this.bizID = ko.observable(Model.bizID);
}

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
    var bounds = new google.maps.LatLngBounds();
    //var yelpData = [];
    //var data_yelp; 
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
        bounds.extend(marker_latlng);

        // need to use closures to make it so that it doesn't always reference last clicked index
        google.maps.event.addListener(markers[i], 'click', function(j) {
            return function() {
                //var content;
                //var data_yelp = yelpData[j];
                yelpAPI(map_view, markers[j], data[j].title, Model[j].bizID, infowindows);
                //content= '<div id = content><h3>' + data[j].title + '</h3>' + '<img class = \'yelp_image\' src =' + yelpData[j] + ' alt = \'Yelp Review\'></div>' ;
                //infowindows.setContent(content); //fills content with whatever is clicked
                //infowindows.open(map_view, markers[j]);  
            }
        }(i));
    }
    map_view.fitBounds(bounds);
    return markers, infowindows;
    //console.log(yelpData);
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
        'cache' : true, 
        'dataType' : 'jsonp',
        'jsonpCallback' : 'cb',
        success : function(data, textStats, XMLHttpRequest) {
            console.log(data);
            console.log(data.rating_img_url);
            //console.log(data_yelp);
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

ko.applyBindings(ViewModel());