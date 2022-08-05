let map;
let src = 'https://tidesandcurrents.noaa.gov/sltrends/coops-slt.kml';

window.onload = () => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(),
    zoom: 2,
    mapTypeId: 'terrain'
  });

  let kmlLayer = new google.maps.KmlLayer(src, {
    suppressInfoWindows: true,
    preserveViewport: false,
    map: map
  });
  kmlLayer.addListener('click', function(event) {
    let content = event.featureData.infoWindowHtml;
    let contentWindow = document.getElementById('capture');
    contentWindow.innerHTML = content;
  });
}