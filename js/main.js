var locations = [{
  id: 0,
  title: 'Park Ave Penthouse',
  location: {
    lat: 40.7713024,
    lng: -73.9632393
  }
}, {
  id: 1,
  title: 'Chelsea Loft',
  location: {
    lat: 40.7444883,
    lng: -73.9949465
  }
}, {
  id: 2,
  title: 'Union Square Open Floor Plan',
  location: {
    lat: 40.7347062,
    lng: -73.9895759
  }
}, {
  id: 3,
  title: 'East Village Hip Studio',
  location: {
    lat: 40.7281777,
    lng: -73.984377
  }
}, {
  id: 4,
  title: 'TriBeCa Artsy Bachelor Pad',
  location: {
    lat: 40.7195264,
    lng: -74.0089934
  }
}, {
  id: 5,
  title: 'Chinatown Homey Space',
  location: {
    lat: 40.7180628,
    lng: -73.9961237
  }
}]

var marker;
var map;
var placeMarkers = [];
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 40.7413549,
      lng: -73.9980244
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

    marker.addListener('click', function() {
      var self = this;
      setTimeout(function() {
        self.setAnimation(null);
      }, 2000);
      populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
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

  if (infowindow.marker != marker) {

    infowindow.setContent('');
    infowindow.marker = marker;

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;

    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + 
        '</div><div id="pano"></div>');

        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }

    streetViewService.getPanoramaByLocation(marker.position, radius,
    getStreetView);

    infowindow.open(map, marker);
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



var ViewModel = function() {
  var self = this;
  this.list = ko.observableArray();
  this.currentLocation = ko.observable(this.list()[0]);
  for (var i = 0; i < locations.length; i++) {
    self.list.push(locations[i]);
  }
  for (var i = 0; i < locations.length; i++) {
    this.list()[i].marker = markers[i];
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

}

ko.applyBindings(new ViewModel());