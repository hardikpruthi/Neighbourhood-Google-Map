var locations = [{
  id: 0,
  title: 'Tokyo Tower',
  location: {
    lat: 35.6586,
    lng: 139.7454
  }
}, {
  id: 1,
  title: 'Tokyo Skytree',
  location: {
    lat: 35.7101,
    lng: 139.8107
  }
}, {
  id: 2,
  title: 'Shiba Park',
  location: {
    lat: 35.6549,
    lng: 139.7480
  }
}, {
  id: 3,
  title: 'Zojo-ji',
  location: {
    lat: 35.6574,
    lng: 139.7482
  }
}, {
  id: 4,
  title: 'Rainbow Bridge',
  location: {
    lat: 35.6366,
    lng: 139.7631
  }
}];

var marker;
var map;
var placeMarkers = [];
var markers = [];

function initMap() {

  function markerclick(){
    populateInfoWindow(this, largeInfowindow);
      var self = this;
      this.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        self.setAnimation(null);
      }, 2000);

  }

  function markerin() {
    this.setIcon(highlightedIcon);
  }

  function markerout() {
    this.setIcon(defaultIcon);
  }
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 35.6586,
      lng: 139.7454
    },
    zoom: 13,
    mapTypeControl: false
  });

  var largeInfowindow = new google.maps.InfoWindow();

  var defaultIcon = makeMarkerIcon('0091ff');

  var highlightedIcon = makeMarkerIcon('FFFF24');
  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;

    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });

    markers.push(marker);

    marker.addListener('click', markerclick);

    marker.addListener('mouseover', markerin);
    marker.addListener('mouseout', markerout);
  }
  var searchbox = new google.maps.places.
      SearchBox(document.getElementById('places-search'));
  searchbox.setBounds(map.getBounds());
  searchbox.addListener('places_changed', function() {
    searchBoxPlaces(this);
  });

}

function createMarkersForPlaces(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.id
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}

function searchBoxPlaces(searchbox) {
  hideMarkers(placeMarkers);
  var places = searchbox.getPlaces();
  createMarkersForPlaces(places);
  if (places.length === 0) {
    window.alert("we did not find any place matching to the querry");
  }
}
//function for searchbox when go button is clicked
function textSearchPlaces(value) {
  console.log(value);
  var bounds = map.getBounds();
  hideMarkers(placeMarkers);
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
    query: value,
    bounds: bounds
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    } else {
      window.alert("place not found");
    }
  });

}

 function populateInfoWindow(marker, infowindow) {
   var flag = true;

   function getStreetView(data, status) {
     if (status == google.maps.StreetViewStatus.OK) {
       var nearStreetViewLocation = data.location.latLng;
       var heading = google.maps.geometry.spherical.computeHeading(
         nearStreetViewLocation,
         marker.position
       );

       // error handling
       var errorTimeout = setTimeout(function() {
         alert("Something went wrong");
       }, 9000);
       clearTimeout(errorTimeout);

       var panoramaOptions = {
         position: nearStreetViewLocation,
         pov: {
           heading: heading,
           // this changes the angle of camera whether to look up or down
           pitch: 15
         }
       };
       var panorama = new google.maps.StreetViewPanorama(
         document.getElementById('pano'), panoramaOptions
       );
     } else {
       flag = false;
     }

   }
   // Check to make sure the infowindow is not already opened on this marker.
   if (infowindow.marker != marker) {
     // Clear the infowindow content to give the streetview time to load.
     infowindow.setContent('');
     infowindow.marker = marker;
     // Make sure the marker property is cleared if the infowindow is closed.
     infowindow.addListener('closeclick', function() {
       if (infowindow.marker !== null)
         infowindow.marker.setAnimation(null);
       infowindow.marker = null;
     });

     var streetViewService = new google.maps.StreetViewService();
     var radius = 50;



     infowindow.open(map, marker);


     var wiki = false;

     var wikiElem = '';



     // Use streetview service to get the closest streetview image within
     // 50 meters of the markers position

     // Open the infowindow on the correct marker.
     infowindow.open(map, marker);

     var wikiRequestTimeout = setTimeout(function() {
       wikiElem = 'failed to get wikipedia resources';
     }, 8000);

     var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
       marker.title +
       '&format=json&callback=wikiCallback';

     $.ajax({
       url: wikiUrl,
       dataType: "jsonp",
       //jsonp:"callback", by default, using jsonp as datatype will set the callback function name to callback. so, no need to mention it again.
       success: function(data) {
         wiki = true;
         for (var j = 1; j < data.length; j++) {
           var articeList = data[j];
           for (var i = 0; i < articeList.length; i++) {
             articlestr = articeList[i];
             if (articlestr.length > wikiElem.length) {
               wikiElem = articlestr;
             }
           }
         }

         if (flag === false) {
           infowindow.setContent(
             '<div><h5 class=".h5" id="Title">' +
             marker.title +
             '</h5></div><div id="wikipedia-links" class="text-left text-info">' + wikiElem + '<p>' +
             '</p></div><div id="pano"><span class="text-danger">No Street View Found</span></div>'
           );
         } else {
           infowindow.setContent(
             '<div><h5 class=".h5" id="Title">' +
             marker.title +
             '</h5></div><div id="wikipedia-links" class="text-left text-info">' + wikiElem + '<p>' +
             '</p></div><div id="pano">' + streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView) + '</div>'
           );
         }
         clearTimeout(wikiRequestTimeout);
       }
     }).fail(function(jqXHR, textStatus) {
       if (jqXHR.status === 0) {
         alert('You are offline!\n Please check your network.');
       } else if (jqXHR.status == 404) {
         alert('HTML Error Callback');
       } else alert("Request failed: " + textStatus + "<br>");
     });
   }
 }

function showListings() {
  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

function hideMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}
function error() {
  window.alert("something got wrong!!!!");
}


var ViewModel = function() {
  var self = this;
  this.list = ko.observableArray();
  this.currentLocation = ko.observable(this.list()[0]);
  for (var i = 0; i < locations.length; i++) {
    self.list.push(locations[i]);
  }
  for (var j = 0; j < locations.length; j++) {
    this.list()[j].marker = markers[j];
  }
  this.selectedLocation = function(LocClicked) {
    var marker;
    for (var i = 0; i < self.list().length; i++) {
      var id = self.list()[i].id;
      if (LocClicked.id == id) {
        this.currentLocation = self.list()[i];
        marker = markers[self.list()[i].id];
      }
    }
    if (!marker) alert('Something went wrong!');
    else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      // open an infoWindow when either a location is selected from
      // the list view or its map marker is selected directly.
      google.maps.event.trigger(marker, 'click');
    }
  };



  this.searched = ko.observable('');

  this.filter = function(value) {
    self.list.removeAll();
    for (var i = 0; i < locations.length; i++) {
      var current = locations[i].title.toLowerCase();
      if (current.indexOf(value.toLowerCase()) >= 0) {
        self.list.push(locations[i]);
      }
    }
  };
  this.search = ko.observable('');
  this.TextSearch = function(value) {
    console.log(value);
    textSearchPlaces(value);
  };

  this.FilterForMarkers = function(value) {
    for (var i in locations) {
      var temp = markers[i];
      if (temp.setMap(this.map) !== null) {
        temp.setMap(null);
      }
      var searchQuery = temp.title.toLowerCase();
      if (searchQuery.indexOf(value.toLowerCase()) >= 0) {
        temp.setMap(map);
      }
    }
  };
  this.search.subscribe(this.TextSearch);
  this.searched.subscribe(this.FilterForMarkers);
  this.searched.subscribe(this.filter);

};

ko.applyBindings(new ViewModel());