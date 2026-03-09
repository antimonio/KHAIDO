
<?php
    function cargarseccion($seccion, $tag)
    {
        $header = NULL;
        $data = array();
        if ($handle = fopen("media/media.csv", 'r'))
        {
            if($tag != NULL) 
            { 
                ?> <br><h3 id='title_tagged'> Elementos con temática de <?php echo $tag ?> </h3> <?php 
            }
            
            while ($row = fgetcsv($handle, 1000, ';'))
            {
                if(!$header) $header = $row;
                else if($row[2]==$seccion)
                {
                    $data = array_combine($header, $row);
                    $tags = explode(",", $data['TAGS']);
                    $tags_null = $tags;
                    array_push($tags_null,NULL);
                    array_push($tags_null,"");
                    
                    if(in_array($tag, $tags_null))
                    {
                        ?> <div class='mediacard'>
                            <div class='portada' 
                                 style="background:url('media/previews/<?php echo $data['MEDIA'] ?>.webp') center/cover no-repeat" 
                                 onclick="cargarmultimedia('<?php echo $data['LINK'].$data['PARAMETERS']?>')">
                            </div>
                            <h2 class='titulo'> <?php echo $data['TITULO'] ?> </h2>
                            <p class='descripcion'> <?php echo $data['DESCRIPCION'] ?> </p> <?php 
                            
                            foreach($tags as $e_tag) 
                            { 
                                ?> <a href='#' onclick="return swapContent('<?php echo $seccion ?>','<?php echo $e_tag ?>')">#<?php echo $e_tag ?></a> <?php    
                            }
                            
                        ?> </div> <?php
                    }
                }
            } 
            fclose($handle);
        }
    }

    function refrescarfotos()
    {
        $reload = false; $decode = "";
        $source =  file_get_contents("media/urls.json");
        if($source !== false AND !empty($source))
        {
            $decode = json_decode($source, true);
            if(strtotime($decode["date"]) < strtotime('-15 minutes')) $reload = true;
        }
        else $reload = true;
        
        if($reload)
        {
            $token = "IGQVJVcWFKemhFYjQtdWVhOFFrNlh2TFRDcU1zZA0g1OFMtTFUtSDNmeE9NY2ZAKUXA0MVpvTXI3bDNlUU1NSW5yTUtsQ1lYcmY2aW1CUmEyenJ0U3hoWjQyLWNGZAmxLRTVJVjNUaV91VjZAnWVBuMnVmVgZDZD";
            $continue = "https://graph.instagram.com/me/media?fields=media_type,media_url&limit=100&access_token=".$token;
            $object = new STDClass();
            $object->date = date('m/d/Y h:i:s a', time());
            $object->urls = array();
            
            while($continue)
            {
                $res = file_get_contents($continue);
                $res = json_decode($res);
                foreach($res->data as $e)
                    if($e->media_type == "IMAGE" || $e->media_type == "CAROUSEL_ALBUM") array_push($object->urls,$e->media_url);
                $continue = isset($res->paging->next) ? $res->paging->next : null;
            }
            
            file_put_contents("media/urls.json", json_encode($object,true));
        }
    }

    if(isset($_GET['pagina']))
    {
        $tag_filter = isset($_GET['tag']) ? $_GET['tag'] : NULL;
        switch($_GET['pagina'])
        {
            case "inicio":
 ?>
                    <p> ¡Bienvenido a la web :DDD! </p>
                    <p> Ahora mismo te encuentras en el espacio de KHAIDO. Mi nombre es Antonio Alcaraz y en este lugar podrás encontrar el portfolio de la marca, incluyendo todo tipo de proyectos audiovisuales: fotografías, cortos, videoclips, shorts, programación web, elementos de videojuegos y de audio...
                    </p>
                    <p> Puedes acceder también a nuestras redes sociales mediante los botones inferiores o los enlaces indicados en algunas secciones.
                    <p> En <b> Youtube  </b> se publican principalmente los proyectos de vídeo más grandes y directamente relacionados con la marca. La cuenta de <b>  Instagram  </b> está más bien dedicada a la fotografía y a pequeños shorts de vídeo. </p>
                    <p> <b> A continuación se muestra un reel con abundante contenido realizado en cuanto a procesos de Pipeline, TD... Está en proceso de corrección y síntesis, pero es un vista preliminar del contenido realizado. </b> </p>
                    <div style="width:100%; padding-top:66%; position:relative">
                        <iframe style="position:absolute; top:0; bottom:0; left:0; right:0; width:100%; height:100%" src="https://www.youtube.com/embed/vA3j2AA3W84" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
<?php               
                break;
            case "video":
?>
                    <a style="float:right; margin:0.3em;" href="https://www.instagram.com/khaido_ig/channel/"><img src="./images/igprofile.jpg" style="border-radius:50%; width:5em; height:5em;"/></a>
                    <h1> Sección de video </h1>          
                    <p> Puedes acceder a los shorts e historias publicadas a través del enlace en la foto de la derecha, directo a la sección de IGTV de Instagram. </p> 
                    <section id="videos">   <?php cargarseccion('video', $tag_filter); ?>    </section>

<?php     
                break;
        
            case "foto":
                ?>                  
                    <a style="float:right; margin:0.3em;" href="https://www.instagram.com/khaido_ig/"><img src="./images/igprofile.jpg" style="border-radius:50%; width:5em; height:5em;"/></a>
                    <h1> Sección de fotografía</h1>                    
                    <p> Es probable que la sección no esté visible debido a problemas con la API de Instragram. Puedes acceder a todas las fotos publicadas a través del icono de Instagram o de la foto de la derecha. </p> 
                    <section id="fotos"> 
                        <ul id="carousel"></ul>
                        <?php refrescarfotos(); ?>  
                        <script>  
                            fetch("media/urls.json").then(response => { response.json().then(data => { cargarFotos(data); }); });
                        </script> 
                    </section>
<?php
                break;
        
            case "gyp":
?>
                    <h1> Sección de gráficos y programación </h1>
                    <p> Parte del código fuente de estos proyectos se encuentra innacesible líbremente o no completamente documentado. En caso de interés contacten a través del formulario de la web o a la dirección que ahí se indica. </p> 
                    <p> <b> ATENCION: </b> gran parte del material proviene de prácticas en torno a la construcción de servicios en la web no específicos para dispositivos móviles (hacen uso del teclado o de un monitor de gran tamaño) por lo que estos <b> no se recomienda visualizarlos en móviles.</b> </p>
                    <section id="gyp"> <?php cargarseccion('gyp', $tag_filter); ?>  </section>
<?php
                break;
        
            case "audio":
?>
                    <h1> Sección de audio </h1> 
                    <section id="audios"> <?php cargarseccion('audio', $tag_filter); ?> </section>      
<?php 
                break;
        
            case "contacto":
?>
                    <h1> Sección de contacto directo (formulario) </h1>
                    <p> Puede rellenar y enviar este formulario o bien enviar un correo a la dirección <a href="mailto:info@khaido.website">siguiente</a></p>
                    <form id="formulario_contacto" method="post" action="sendmail.php">
                        <input type = "text" name="name" placeholder="Nombre" size="25" maxlength="40" pattern="[A-Z a-z áéíóúÁÉÍÓÚ ]{0,40}" title="Solo texto por favor" required/>
                        <input type = "text" name="name2" placeholder="Apellidos" size="25" maxlength="40" pattern="[A-Z a-z áéíóúÁÉÍÓÚ ]{0,40}" title="Solo texto por favor"/>
                        <input type = "email" name="from" placeholder="Correo" size="25" maxlength="40" required />
                        <input type = "tel" name="tlf" placeholder="Teléfono" size="25" maxlength="40" pattern="[+0-9 ]{10,20}" title="Incluya su extensión (ej: +34)"/>
                        <input type = "text" name="subject" placeholder="Asunto" size="25" maxlength="40" pattern="[A-Z a-z áéíóúÁÉÍÓÚ 0-9 ]{0,40}" title="Indique el asunto" />
                        <textarea name="message" rows="10" cols="40" placeholder="Mensaje" required></textarea>
                        <input class="kbutton" name="submit" type="submit" value="Enviar" />
                    </form>
<?php
                break;
        
            case "colabo":
?>
                    <h1> Sección de colaboraciones con otras marcas </h1>
                    <p> Durante el desarrollo de la actividad de esta marca se han realizado colaboraciones con diversas personas y marcas. Esta sección pretende dar visibilidad a las mismas. </p>
                    <p> Se pretende que para ello dichas personas preparen un banner personalizado a su gusto para que la publicación sea de su agrado, de forma que la sección permanecerá en construcción hasta que al menos 3 de las colaboraciones que hemos tenido nos envíen dicho material. </p>
<?php
                break;
        }
    }
?>