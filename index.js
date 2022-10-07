let ciudad = document.getElementById("ciudad");
document.getElementById("contenedor_mapa").innerHTML = "<div id='mapa'></div>";
let map = L.map("mapa");

window.onload = function () {
  //Carga de ciudades
  carga_ciudades();
};

function carga_ciudades() {
  let ciudad = document.getElementById("ciudad");
  fetch("españa.json")
    .then((respuesta) => respuesta.json())
    .then((ciudades) => {
      ciudades.sort();
      ciudades.reverse();
      let fragmento = document.createDocumentFragment();
      ciudades.forEach((ciudad) => {
        let opcion = document.createElement("option");
        opcion.value = ciudad.coord.lat + "," + ciudad.coord.lon;
        opcion.text = ciudad.name;
        fragmento.appendChild(opcion);
      });
      ciudad.appendChild(fragmento);
      console.log(ciudad.options[0]);
      cambia_ciudad(ciudad.options[0].text, ciudad.options[0].value);
    });
}

document.getElementById("ciudad").addEventListener("change", () => {
  cambia_ciudad(
    ciudad.options[ciudad.selectedIndex].text,
    ciudad.options[ciudad.selectedIndex].value
  );
});

//Funcion encargada de borrar puntos y trayectos del mapa actual
function borra_mapa() {
  for (i in map._layers) {
    console.log(map._layers[i].options.attribution == undefined);
    if (map._layers[i].options.attribution == undefined) {
        try {
            map.removeLayer(map._layers[i]);
        } catch (e) {
            console.log("problem with " + e + map._layers[i]);
        }
    }
}
}

//Funcion encargada de actualizar puntos y trayectos correspondientes a la lista en el mapa actual
function carga_mapa(){
  borra_mapa();
  var latlngs = [];  
  console.log(document.getElementsByClassName("lng").length);
  for (let i = 0; i < document.getElementsByClassName("lng").length; i++) {
        let punto = [];
        punto.push(document.getElementsByClassName("lat")[i].innerHTML)
        punto.push(document.getElementsByClassName("lng")[i].innerHTML)
        latlngs.push(punto);
        L.marker(punto, { draggable: false }).addTo(map);
  }  
  if (latlngs.length == 0){
    document.getElementById("graba").disabled = true;
  } else
  {
    document.getElementById("graba").disabled = false;
    let polyline = L.polyline(latlngs, { color: "red" }).addTo(map);
   // zoom the map to the polyline
   map.fitBounds(polyline.getBounds());
  }
}


// Dibuja el recorrido entre los puntos en el mapa
document.getElementById("dibujo").addEventListener("click", () => {
  carga_mapa();
});

//Funcion de conversion de un vector en formdata
function buildFormData(formData, data, parentKey) {
  if (data && typeof data === 'object') {
    Object.keys(data).forEach(key => {
      buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
    });
  } else {
    formData.append(parentKey, data);
  }
}

// Guarda el fichero KML con los datos de los puntos
document.getElementById("graba").addEventListener("click", () => {
    var latlngs = [];  
    console.log(document.getElementsByClassName("lng").length);
    for (let i = 0; i < document.getElementsByClassName("lng").length; i++) {
          let punto = Object.create(null);
          punto.name = "";
          punto.latitud = document.getElementsByClassName("lat")[i].innerHTML;
          punto.longitud = document.getElementsByClassName("lng")[i].innerHTML;
          latlngs.push(punto);
    }  
    //Creamos un objeto formdata y lo cargamos con la funcion auxiliar
    const formData = new FormData();
    buildFormData(formData, latlngs);

    console.log(JSON.stringify(latlngs));
    fetch("./grabadoc.php", {
      method: 'POST',
      headers: {
        "Access-Control-Allow-Headers": "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,Access-Control-Request-Headers, Authorization"
      },
      body: formData
     })
    .then(respuesta => respuesta.text())
    .then(datos =>{
        console.log(datos);
    })
  });

function eliminapunto(e)  {
  console.log(e.target.className.substring(5));
  let lista_a_eliminar = document.getElementsByClassName(e.target.className.substring(5));
  console.log(typeof lista_a_eliminar);
  Object.values(lista_a_eliminar).forEach(nodo =>
  {
    nodo.remove();
  })
  carga_mapa();
}

function cargapunto(punto) {
  let fragmento = document.createDocumentFragment();

  let denominacion = document.createElement("div");
  denominacion.innerHTML = ciudad.options[ciudad.selectedIndex].text;
  denominacion.className= punto.lat + punto.lng;
  fragmento.appendChild(denominacion);

  let latitud = document.createElement("div");
  latitud.innerHTML = punto.lat;
  latitud.classList.add("lat");
  latitud.classList.add(punto.lat + punto.lng);
  fragmento.appendChild(latitud);

  let longitud = document.createElement("div");
  longitud.innerHTML = punto.lng;
  longitud.classList.add("lng");
  longitud.classList.add(punto.lat + punto.lng);
  fragmento.appendChild(longitud);

  let eliminar = document.createElement("input");
  eliminar.type = "button";
  eliminar.id = "eliminar";
  eliminar.value = "Eliminar";
  eliminar.classList.add("boton");
  eliminar.classList.add(punto.lat + punto.lng);
  eliminar.onclick = eliminapunto;
  latitud.innerHTML = punto.lat;
  fragmento.appendChild(eliminar);

  //aqui agrego la linea al grid
  document.getElementById("contenedor").appendChild(fragmento);
  L.marker(punto, { draggable: true }).addTo(map);
  document.getElementById("graba").disabled = false;
  // map.closePopup();
}

function cambia_ciudad(nomciudad, lonlat) {
  let vector = lonlat.split(",");

  //Aqui volvemos a crear el contenedor del mapa y lo cargamos
  document.getElementById("contenedor_mapa").innerHTML = "<div id='mapa'></div>";
  map = L.map("mapa").setView(vector, 30);

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18,
  }).addTo(map);

  //Agrega el control de escala al mapa
  L.control.scale().addTo(map);

//Herramienta para mostrar una chincheta en una posicion dada por longitud latitud
//   L.marker(vector, { draggable: true }).addTo(map);
//   console.log(vector);
//   console.log(nomciudad);

  var popup = L.popup();

  function onMapClick(e) {
    // popup
    //   .setLatLng(e.latlng) // Punto geografico donde sale el popup
      // .setContent(
      //   "Coordenada:<br> " +
      //     e.latlng.lat.toString() +
      //     "," +
      //     e.latlng.lng.toString() +
      //     " <button onclick='cargapunto(" +
      //     JSON.stringify(e.latlng) +
      //     ")' id='boton'>Agregar</button>"
      // ) // Contenido HTML del popup
      // .openOn(map); // Agrega el popup al mapa cerrando cualquier otro abierto
      cargapunto(e.latlng);
  }

  map.on("click", onMapClick);
}
