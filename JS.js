var styles = ["./CSS.css",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"];


function l(word){return "Cargar('"+word+"')";}
function menu(classd,onclick,id,text){return {class:classd,buttons:onclick.map((e, i) => [e, id[i],text[i]])};}

var buttons =
{
    NAV:menu("kbutton knavbutton",
            [l('video'),l('gyp'),l('audio')],
            ['','',''],
            ['Vídeo','Graphics&Prog','Audio']),
    ASIDE:menu("kbutton k2button",
               [l('colabo')],
               ['b_colabo'],
               ['Colaboraciones'])
};


let mediaData = [];

fetch("media/media.csv")
    .then(response => response.text())
    .then(csv => {
        let lines = csv.trim().split('\n');
        let headers = lines[0].split(';');
        for(let i = 1; i < lines.length; i++){
            let row = [], col = '', inQuotes = false;
            for(let j = 0; j < lines[i].length; j++){
                let ch = lines[i][j];
                if(ch === '"') inQuotes = !inQuotes;
                else if(ch === ';' && !inQuotes){
                    row.push(col.replace(/"/g, ''));
                    col = '';
                } else col += ch;
            }
            row.push(col.replace(/"/g, ''));

            let item = {};
            headers.forEach((header, idx) => {
                item[header] = row[idx] || '';
            });
            mediaData.push(item);
        }

        renderizarSeccion('video', null);
        renderizarSeccion('gyp', null);
        renderizarSeccion('audio', null);
    });

function renderizarSeccion(seccion, tag){
    let section = document.getElementById(seccion) || document.getElementById(seccion + "s");
    if(!section) return;

    section.innerHTML = '';

    let filtrados = mediaData.filter(item => item.TIPO === seccion);

    if(tag){
        section.innerHTML = '<br><h3>' + tag + '</h3>';
        filtrados = filtrados.filter(item => {
            let tags = item.TAGS.split(',').map(t => t.trim());
            return tags.includes(tag);
        });
    }

    filtrados.forEach(item => {
        let card = document.createElement('div');
        card.className = 'mediacard';

        let portada = document.createElement('div');
        portada.className = 'portada';
        portada.style.background = "url('media/previews/" + item.MEDIA + ".webp') center/cover no-repeat";
        portada.onclick = function(){ cargarmultimedia(item.LINK + item.PARAMETERS); };

        let titulo = document.createElement('h2');
        titulo.className = 'titulo';
        titulo.textContent = item.TITULO;

        let desc = document.createElement('p');
        desc.className = 'descripcion';
        desc.innerHTML = item.DESCRIPCION;

        card.appendChild(portada);
        card.appendChild(titulo);
        card.appendChild(desc);

        let tags = item.TAGS.split(',').map(t => t.trim()).filter(t => t);
        tags.forEach(t => {
            let link = document.createElement('a');
            link.href = '#';
            link.textContent = '#' + t;
            link.onclick = function(e){
                e.preventDefault();
                swapContent(seccion, t);
                return false;
            };
            card.appendChild(link);
        });

        section.appendChild(card);
    });
}

function Cargar(seccion_id)
{
    try {document.getElementsByClassName('visible')[0].className = 'hidden';}catch(error){};

    var abrir = document.getElementById(seccion_id);
    if(abrir !== null) abrir.className = 'visible';
}

function swapContent(seccion_id, tag)
{
    var element = document.getElementById(seccion_id);
    if(element) element.className = 'visible';
    renderizarSeccion(seccion_id, tag);
}

function cargarmultimedia(enlace)
{
    document.getElementById('reproductor').style.display="block";
    media_container = document.getElementById("media_container");
    media_container.src = enlace;
    media_container.autoplay=1;
    document.body.style.overflow = "hidden";
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

