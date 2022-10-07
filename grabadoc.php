<?php
    // Crea el Documento raiz.
    $dom = new DOMDocument('1.0', 'UTF-8');

    // Crea el elemento raiz de KML y lo añade al raiz.
    $node = $dom->createElementNS('http://www.opengis.net/kml/2.2', 'kml');
    $parNode = $dom->appendChild($node);

    // Crea un elemento de un documento KML y lo agrega.
    $dnode = $dom->createElement('Document');
    $docNode = $parNode->appendChild($dnode);
    $puntos = count($_POST)-1;
    $direcciones = "";

    //Esto entraria en el bucle de puntos del mapa
        for ($i = 0; $i <= $puntos; $i++) {
             // Crea un punto en el mapa
            $node = $dom->createElement('Placemark');
            $placeNode = $docNode->appendChild($node);
        
            // Creates un id 
            // $placeNode->setAttribute('id', 'placemark' . '1');

            // Crea el nombre del punto
            $nameNode = $dom->createElement('name',$_POST[$i]['name']);
            $placeNode->appendChild($nameNode);

            // Crea un punto.
            $pointNode = $dom->createElement('Point');
            $placeNode->appendChild($pointNode);

            // Crea las coordenadas
            $coorStr = $_POST[$i]['longitud'].",".$_POST[$i]['latitud'];
            $coorNode = $dom->createElement('coordinates', $coorStr);
            $pointNode->appendChild($coorNode);
            $direcciones = $direcciones.$_POST[$i]['longitud'].",".$_POST[$i]['latitud']." ";
        }
        
         // Crea otro punto en el mapa
         $node = $dom->createElement('Placemark');
         $placeNode = $docNode->appendChild($node);

        // Creo el id de la linea 
        $placeNode->setAttribute('id', 'Linea');
        
        //Create a LineString element
        $lineNode = $dom->createElement('LineString');
        $placeNode->appendChild($lineNode);
        $coorStr = $direcciones;
        $coorNode = $dom->createElement('coordinates', $coorStr);
        $lineNode->appendChild($coorNode);
        $placeNode->appendChild($lineNode);

        //Crea el estilo de la linea
        $style = $dom->createElement('Style');
        $linestyle = $dom->createElement('LineStyle');
        $style->appendChild($linestyle);

        //Crea los datos de linestyle        
        $colorLine = $dom->createElement('color', '#ff0000ff');
        $linestyle->appendChild($colorLine);
        $withLine = $dom->createElement('width', 5);
        $linestyle->appendChild($withLine);
        $placeNode->appendChild($style);
    //
    $kmlOutput = $dom->saveXML();
    header('Content-type: application/vnd.google-earth.kml+xml');
    $file = 'actual.kml';
    file_put_contents($file, $kmlOutput);
    echo "Grabado fichero";
?>