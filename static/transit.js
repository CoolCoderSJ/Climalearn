window.onload = function() {
    const api = function(inputValue) {
        return fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&apiKey=1b48259b810e48ddb151889f9ea58db0&limit=5`).then(function(resp) {
          return resp.json()
        }).then(function(addresses) {
          return addresses.features.filter(function(addr) {
            return addr.properties.formatted.toLowerCase().startsWith(inputValue.toLowerCase())
          })
        }).then(function(filtered) {
          return filtered.map(function(addr) {
            return {label: addr.properties.formatted, value: addr.properties.formatted}
          })
        }).then(function(transformed) {
          return transformed.slice(0, 5)
        })
      }
  
      const onSelect = function(addr) {}

      bulmahead('source', 'source-menu', api, onSelect, 200);
      bulmahead('dest', 'dest-menu', api, onSelect, 200);
}

function viewRoutes() {
    let start = document.getElementById("source").value;
    let end = document.getElementById("dest").value;
    window.open(`https://www.google.com/maps/dir/${start}/${end}/`)
}

window.viewRoutes = viewRoutes;