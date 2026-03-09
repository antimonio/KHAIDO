/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/***************************Data***************************/

var styles = ["./CSS.css", 
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"];


function l(word){return "Cargar('"+word+"')";}
function menu(classd,onclick,id,text){return {class:classd,buttons:onclick.map((e, i) => [e, id[i],text[i]])};}

var buttons =
{
    NAV:menu("kbutton knavbutton",
            [l('video'),l('foto'),l('gyp'),l('audio')],
            ['','','',''],
            ['Vídeo','Fotografía','Graphics&Prog','Audio']),
    ASIDE:menu("kbutton k2button", 
               [l('contacto'),l('colabo')],
               ['b_contacto','b_colabo'],
               ['Contacto','Colaboraciones'])
};


/***************************Functions***************************/


//AJAX

function objAjax()
{
    var xmlhttp=false;
    try { xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");} 
    catch(e) 
    {
        try { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
        catch(E) { xmlhttp = false;}
    } 
    if(!xmlhttp && typeof XMLHttpRequest!='undefined') xmlhttp = new XMLHttpRequest();
    return xmlhttp;
}

function obtener(pagina, javascript = false)
{
    var ajax = objAjax();
    ajax.open("GET","main.php?pagina="+pagina,true);
    ajax.onreadystatechange=function()
    {
        if(ajax.readyState==4  && ajax.status==200)
        {
            let article = document.createElement("article");
            article.id = pagina; document.getElementById("contenido").append(article);
            article.className = "hidden";
            setTimeout(() => { article.className = "visible";}, 100);
            article.innerHTML=ajax.responseText;
            
            if(javascript)
                for(child of article.getElementsByTagName("section")[0].children)
                    if(child.tagName.toLowerCase() == 'script') eval(child.innerHTML);
            
        }
    };
    ajax.setRequestHeader("Content-Type","aaplication/x-www-form-urlencoded");
    ajax.send();
}

//Elements & visibility

function Cargar(seccion_id)
{

    try {document.getElementsByClassName('visible')[0].className = 'hidden';}catch(error){};
    
    var abrir = document.getElementById(seccion_id);
    if(abrir === null) obtener(seccion_id, seccion_id == "foto");
    else if (abrir.querySelector("#title_tagged")) 
    {
        abrir.remove();
        obtener(seccion_id);
    }
    else abrir.className = 'visible';
}

function swapContent(seccion_id, tag)
{
    var ajax = objAjax();
    ajax.open("GET","main.php?pagina="+seccion_id+"&tag="+tag,true);
    ajax.onreadystatechange=function()
    {
        if(ajax.readyState==4  && ajax.status==200)
        {
            document.getElementById("contenido").removeChild(document.getElementById(seccion_id));
            let article = document.createElement("article");
            article.id = seccion_id; 
            document.getElementById("contenido").append(article);
            article.innerHTML=ajax.responseText;
            article.className = 'visible';

        }
    };
    ajax.setRequestHeader("Content-Type","aaplication/x-www-form-urlencoded");
    ajax.send();
}


function cargarmultimedia(enlace)
{
    document.getElementById('reproductor').style.display="block";
    media_container = document.getElementById("media_container");
    media_container.src = enlace;
    media_container.autoplay=1;
    document.body.style.overflow = "hidden";
}

function cargarFotos(data)
{
    var carousel = document.getElementById("carousel");
    var counter = 0;
    for(url of data.urls)
    {
        ++counter;
        let li = document.createElement("li"), img = document.createElement("img");
        img.id = "photo" + counter;
        img.addEventListener('click', function(){ cargarfoto(img.id); });
        img.src = url;
        img.alt = "Cargando fotografía...";
        img.loading = "lazy";
        li.appendChild(img);
        carousel.appendChild(li);
    }
}

function cargarfoto(id)
{
    document.getElementById('photoviewer').style.display="block";
    document.getElementById("photo_container").src = document.getElementById(id).src;
    var num = parseInt(id.replace("photo","")), nextnum = num+1, prevnum = num-1; 

    if(prevnum > 0) 
    {
        let prev = document.getElementById("prev_image");
        prev.setAttribute("onclick","cargarfoto(\"photo"+prevnum+"\")");
        prev.style.display = "block";
    }
    else document.getElementById("prev_image").style.display = "none"; 

    if(document.getElementById("photo"+nextnum))
    {
        let next = document.getElementById("next_image");
        next.setAttribute("onclick","cargarfoto(\"photo"+nextnum+"\")");
        next.style.display = "block";
    }
    else document.getElementById("next_image").style.display = "none";
}