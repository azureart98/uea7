// Variable para almacenar los datos del archivo GeoJSON
let geojsonFeature;

// Crear el mapa centrado en unas coordenadas específicas
var map = L.map('mapa').setView([19.2906, -99.4985], 14);

// Añadir la capa base de CartoDB
L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.carto.com/">CARTO</a>, &copy; OpenStreetMap contributors'
}).addTo(map);

// Añadir la capa de transporte público de Thunderforest
var thunderforestTransport = L.tileLayer(
  'https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=590f3aacedcd484499baf582c7c2d33f', {
    attribution: 'Maps © Thunderforest, Data © OpenStreetMap contributors',
    maxZoom: 19
  }
).addTo(map); // Añadir directamente al mapa o usar un control de capas si lo prefieres

// Crear un ícono personalizado para los marcadores
var customIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Función para manejar las interacciones con cada característica del GeoJSON
function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.title) {
    layer.bindPopup(
      '<h2>' + feature.properties.title + '</h2>' + 
      '<p>' + feature.properties.description.replace(/\n/g, '<br>') + '</p>'
    );
  }

  if (feature.geometry.type === "Point") {
    layer.setIcon(customIcon);
  }

  
  if (feature.geometry.type === "LineString") {
    const color = feature.properties.color || 'purple';

    // Estilo inicial
    layer.setStyle({
        color: color,
        weight: 4,
        opacity: 0.8, // Transparencia inicial
    });

    // Animación de brillo
    let growing = true;
    setInterval(() => {
        let currentOpacity = layer.options.opacity;
        if (growing) {
            currentOpacity += 0.1; // Incrementa opacidad
            if (currentOpacity >= 1.2) growing = false; // Si alcanza el máximo, empieza a decrecer
        } else {
            currentOpacity -= 0.1; // Decrementa opacidad
            if (currentOpacity <= 0.4) growing = true; // Si alcanza el mínimo, empieza a crecer
        }
        layer.setStyle({ opacity: currentOpacity }); // Aplica la nueva opacidad
    }, 100); // Intervalo en milisegundos
}


  layer.on('mouseover', function () {
    this.setIcon(L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [55, 55],
      iconAnchor: [30, 55],
      popupAnchor: [0, -75]
    }));
  });

  layer.on('mouseout', function () {
    this.setIcon(customIcon);
  });
}

// Obtener los datos del archivo GeoJSON
fetch('/geojson')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    geojsonFeature = data;
    console.log(geojsonFeature);
    L.geoJSON(geojsonFeature, {
      onEachFeature: onEachFeature
    }).addTo(map);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
