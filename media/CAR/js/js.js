/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//console.log("aaaa");
import * as THREE from './three.module.js';

//Para cargar el coche, se necesitan estas dos librerías
import { GLTFLoader } from './GLTFLoader.js';
import { DRACOLoader } from './DRACOLoader.js';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

//Para el control de la cámara en el modo 1ª persona
import { OrbitControls } from './OrbitControls.js';;

//Variables de escena y control
var camera, scene, renderer, first = true; //"First person camera"
var keyboard = new THREEx.KeyboardState();
var controls;

//Elementos de la escena
var road;
var parks_list; //Lista de parkings
var car;		
var carp = new Object();	//Propiedades del coche
        carp.direction = new THREE.Vector3( 0, 0, -1 );
        carp.speed = 0; carp.sense = 0;
        carp.acc = 0.01; carp.rot_dir = 0;
        carp.wheel_rot = 0;
const wheels = []; 		//Lista de ruedas del coche
var ambient_light;		


/**
 * Inicio de la escena
 */
function init() 
{

        //HTMLconf
        const container = document.getElementById( 'container' );
        window.addEventListener( 'resize', onWindowResize );

        //Renderer y escena 
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        scene = new THREE.Scene();			

        //Camara
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 ); //far=100
        camera.position.set( 4.25, 1.4, - 4.5 );

        //Controles: el target es el coche asi que se generara despues
        controls = new OrbitControls( camera, container );
        controls.update();

        //Luz 
        //carp.light = new THREE.PointLight(0xffffff,1,100);
        ambient_light = new THREE.AmbientLight(0xFFFFFF,1);
                scene.add(ambient_light); 

        //Suelo

                //Materiales
                const textureLoader = new THREE.TextureLoader();		
                const roadMaterial = new THREE.MeshStandardMaterial( 
                { 
                        color: 0xffffff,
                        map: textureLoader.load( "city.jpg" ),
                        side: THREE.DoubleSide
                } );

                //Mesh
                road = new THREE.Mesh(new THREE.PlaneGeometry(100,100,1000,1000), roadMaterial);
                road.rotation.x = -Math.PI / 2;
                road.position.y = -0.1;

                //Se añade el mapa principal y copias de este a sus lados, para obtener un mosaico más grande que nos permite obtener un efecto de mapa infinito
                scene.add( road );

                var external_map = [[road.clone(),-100,0],[road.clone(),100,0],[road.clone(),0,100],	//Ademas de los clones del mapa, se almacenan las posiciones
                [road.clone(),0,-100],[road.clone(),-100,-100],[road.clone(),100,100],[road.clone(),-100,100],[road.clone(),100,-100]];

                for (var piece of external_map)
                {	//Se introduce la posición a cada clon y entra en escena
                        piece[0].position.x = piece[1];
                        piece[0].position.z = piece[2];	
                        scene.add(piece[0]);
                }

        //Coche: es un modelo especial por partes que requiere otro loader. Se cargará e introducirá en la escena con una función auxiliar cargarCoche();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( 'https://threejs.org/examples/js/libs/draco/' );
        const loader = new GLTFLoader();
        loader.setDRACOLoader( dracoLoader );
        loader.load( 'ferrari.glb', function ( gltf ) { cargarCoche(gltf); } );

        //Parkings
        var pos = [[35,-4],[-4,-27],[12,28],[33,-28],[-11,14],[-12,39],[-41,44],[-49,-27]]; //Posibles posiciones, asumiendo que pudiese haber más de 4.
        pos = pos.sort(function(){return Math.random() - 0.5});	//Para dar aleatoriedad a la posición de los parkings, aunque dentro de las opciones introducidas.
        parks_list = [];	//Lista de parkings
        const parkTexture = textureLoader.load( "parking.png" );
        const park_model = new THREE.Mesh
        (
                new THREE.BoxGeometry( 3, 3, 3 ), 
                new THREE.MeshStandardMaterial
                ({ 
                        color: 0xffffff,
                        map: parkTexture,
                        opacity: 0.5,
                        transparent:true
                })
        );

        fetch('estado_parkings.json')
        .then(response => response.json())
        .then(data => 
        {
                var i = 0;
                for (let parking of data.resources)
                {	//Los datos de cada parking se guardan en un objeto p_obj para mayor comodidad, y cada uno de estos objetos en la lista de parkings.
                        let p_obj = new Object();
                        p_obj.mesh = park_model.clone();
                        p_obj.plazaslib = parking.plazaslib;
                        p_obj.contador = p_obj.plazaslib;
                        p_obj.plazastot = parking.plazastot;
                        p_obj.mesh.position.set(pos[i][0], 3, pos[i][1]);
                        p_obj.nombre = parking.uri.substr(-8); //Se guarda un identificador porque mas tarde se lo introduciremos al texto contador de aparcamiento y lo buscaremos
                                                                                                        //en la escena así

                        //Los textos del titulo y contador de aparcamiento se generan e introducen en la escena con funciones auxiliares
                        getText(parking.nombre, 0x0000ff,pos[i][0]-5, 6, pos[i][1], "");
                        let countcolor = getCountColor(parking.plazaslib, parking.plazastot);
                        getText(parking.plazaslib, countcolor, pos[i][0]-5, 5, pos[i][1], p_obj.nombre);

                        scene.add(p_obj.mesh);
                        parks_list.push(p_obj);
                        i++;
                }
        });

        //Sky (skybox para dar un leve color celeste y neblina)
        var skyTexture = textureLoader.load( "sky.png" );
        var skyBoxGeometry = new THREE.SphereGeometry( 200, 100, 100 );
        var skyBoxMaterial = new THREE.MeshBasicMaterial( { map: skyTexture, side: THREE.DoubleSide } );
        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        scene.fog = new THREE.Fog( 0xABFDFF, 10, 200 );	

        scene.add(skyBox);

}


/**
 * Animacion continua de la escena. Solo contiene los cambios relacionados con
 * posición, escalado, rotación...
 */
function animate()
{		
        requestAnimationFrame( animate );	

        //Variables de la velocidad de giro y teletransporte de la cámara en xz (para el efecto de mapa infinito)
        let rot_speed = -Math.log10(1+carp.speed*0.5), cam_jump =[0,0];

        //Controlar maemáticamente la dirección y rotación del coche
        carp.direction.applyEuler(new THREE.Euler( 0, rot_speed * carp.rot_dir, 0, 'XYZ' ));
        car.rotation.y += rot_speed * carp.rot_dir;

        //Según lo anterior moverlo
        car.position.add(new THREE.Vector3().add(carp.direction).multiplyScalar(carp.speed));

        //Efecto de mapa infinito: si se llega al borde del mapa se mueve el coche al contrario
        if(car.position.x > 50) {car.position.x -= 100; cam_jump[0] = -100; }
        else if(car.position.x < -50) {car.position.x += 100; cam_jump[0] = 100; }

        if(car.position.z > 50) {car.position.z -= 100; cam_jump[1] = -100; }
        else if(car.position.z < -50) {car.position.z += 100; cam_jump[1] = 100; }

        //Si la camara es en primera persona, se mueve con el coche (incluyendo la traslación al borde contrario con cam_jump)
        if(first)
        {
                camera.position.add(new THREE.Vector3().add(carp.direction).multiplyScalar(carp.speed));
                camera.position.x += cam_jump[0];
                camera.position.z += cam_jump[1];
        }

        //Mover las ruedas al son del coche
        for ( let i = 0; i < wheels.length; i ++ ) { wheels[ i ].rotation.x += -carp.speed };	

        render();		
        update();
}

/**
 * Renderización de cada fotograma
 */
function render() 
{
        renderer.render( scene, camera );
}

/**
 * Actualización de objetos y valores necesarios para llevar a cabo la animación e intercatividad.
 */
function update()
{
        //Las flechas up y down aceleran o desaceleran la velocidad. No pulsar ninguna implica simular un freno por rozamiento
        if ( keyboard.pressed("up")) { if(carp.speed < 1) { carp.speed += carp.acc;} }
        else if ( keyboard.pressed("down")) { if(carp.speed > -1) { carp.speed -= carp.acc;} }
        else if (carp.speed != 0)
        {
                if (Math.abs(carp.speed) < 0.01) carp.speed = 0; 
                else carp.speed *= 0.9;
        }

        //Las laterales cambian la dirección de rotación
        if ( keyboard.pressed("left") )	carp.rot_dir = -1;
        else if ( keyboard.pressed("right") ) carp.rot_dir = 1;
        else carp.rot_dir = 0;

        //Bucle que comprueba la distancia a los parkins para saber si estás aparcado
        for (let i = 0; i < parks_list.length; i++)
        {
                let acercado;
                //Las condiciones utilizadas pretenden que solo se refresque el texto a la entrada y a la salida
                //de los parkings, no cada vez debido a que la caché del navegador parece saturarse
                if (parks_list[i].mesh.position.distanceTo(car.position) < 10) acercado = true;
                else acercado = false;

                if (acercado && parks_list[i].contador != parks_list[i].plazaslib - 1)
                {
                        parks_list[i].contador = parks_list[i].plazaslib - 1;
                        refreshText(parks_list[i]);
                }

                if ((!acercado) && parks_list[i].contador != parks_list[i].plazaslib)
                {
                        parks_list[i].contador = parks_list[i].plazaslib;
                        refreshText(parks_list[i]);
                }
        }
}		

/**Funciones auxiliares**/


/**
 * Actualiza el objeto text introducido 
 * @param  objeto mesh texto
 */			
function refreshText(text)
{
        let countcolor = getCountColor(text.contador , text.plazastot);
        scene.remove(scene.getObjectByName(text.nombre));
        getText(text.contador.toString(), countcolor, text.mesh.position.x-5, 5, text.mesh.position.z, text.nombre); 
}

/**
 * Evalua el porcentaje de parking ocupado para devolver el color que lo alerte
 * @param  libres (plazas libres)
 * @param  totales (plazas totales)
 * @return  color de alerta
 */			
function getCountColor(libres, totales)
{
        let color;
        let percent = (libres/totales)*100;
        console.log(percent);
        if(percent > 25)
        {
                if(percent > 51) {color = 0x00ff00;}
                else {color = 0xffff00;}
        }
        else {color = 0xff0000;}
        console.log(color);
        return color;
}


/**
 * Genera e introduce en la escena una mesh de texto a partir de unos parametros
 * @param texto a introducir
 * @param color del texto
 * @param x coordenada
 * @param y coordenada
 * @param z coordenada
 * @param id nombre si es necesario
 */					
function getText(text,color,x,y,z, id)
{
        var res;
        var font_loader = new FontLoader();
        font_loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function ( font ) 
        {
                var textGeometry = new TextGeometry( text, 
                {
                        font: font,
                        size: 1,
                        height: 0.5,
                        curveSegments: 6,
                });

                var textMaterial = new THREE.MeshStandardMaterial
                ( { color: color } );

                var mesh = new THREE.Mesh( textGeometry, textMaterial );
                mesh.name = id;
                mesh.position.set(x,y,z);
                scene.add( mesh );
        });
}

/**
 * Función para el listener a la hora de redimensionar la pantalla
 */						
function onWindowResize() 
{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
}			

/**
 * Carga e introduce en la variable auxiliar y en la escena el coche, iniciando además la animación
 * para que esta no comience hasta que el objeto animado, que es el propio coche, no esté completamente cargado
 * @param gltf modelo en dicho formato
 */			
function cargarCoche(gltf)
{
        //Cargar modelo del coche
        car = gltf.scene.children[ 0 ];

        //Guardar objetos de las ruedas para poder moverlas
        wheels.push( car.getObjectByName( 'wheel_fl' ), car.getObjectByName( 'wheel_fr' ),
                                car.getObjectByName( 'wheel_rl' ), car.getObjectByName( 'wheel_rr' ));				

        //Introducir materiales y texturas al coche
        const bodyMaterial = new THREE.MeshPhysicalMaterial( { color: 0xff0000, metalness: 0.5, roughness: 0.3, clearcoat: 0.05, clearcoatRoughness: 0.05} );
        const detailsMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, metalness: 1.0, roughness: 0.5 } );
        const glassMaterial = new THREE.MeshPhysicalMaterial( { color: 0xffffff, metalness: 0, roughness: 0.1, transmission: 0.9, transparent: true } );
        const shadow = new THREE.TextureLoader().load( 'ferrari_ao.png' );

        car.getObjectByName( 'body' ).material = bodyMaterial;
        car.getObjectByName( 'rim_fl' ).material = detailsMaterial;
        car.getObjectByName( 'rim_fr' ).material = detailsMaterial;
        car.getObjectByName( 'rim_rr' ).material = detailsMaterial;
        car.getObjectByName( 'rim_rl' ).material = detailsMaterial;
        car.getObjectByName( 'trim' ).material = detailsMaterial;
        car.getObjectByName( 'glass' ).material = glassMaterial; 

        //Crear una sombra e introducir en la escena
        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
                new THREE.MeshBasicMaterial( { map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true} ));
        mesh.rotation.x = - Math.PI / 2;
        mesh.renderOrder = 2; 

        car.add( mesh );
        scene.add( car ); 

        //Foco de la camara
        controls.target = car.position;	

        animate();	//Animar
}

//Listener auxiliar para cambiar el tipo de camara y obtener datos de la posición del coche, la cámara...
window.addEventListener('keypress', function(event)
{
        let key = event.key.toUpperCase();
        if ( key == 'P' ) 
        {
                alert("Car position: " + car.position.x + ", " + car.position.z);
                alert("Camera position: " + camera.position.x + ", " + camera.position.y + ", " + camera.position.z);			
                alert("Camera rotation: " + camera.rotation.x + ", " + camera.rotation.y + ", " + camera.rotation.z);			
        }
        if ( key == 'C')
        {
                first = !first;
                if(first) 
                {
                        camera.position.set( car.position.x + 10, car.position.y + 10, car.position.z + 10);
                        scene.fog = new THREE.Fog( 0xABFDFF, 10, 200 );	
                        controls.update();
                }
                else 
                {	//Vista aérea bloqueada
                        camera.rotation.set(-0.382665001698944, -0.022344958442305152, -0.008992992827199427);
                        camera.position.set( -2.3814935771093766, 39.789177180639435, 98.85358265845863 );
                        scene.fog = new THREE.Fog( 0xABFDFF, 10, 300 );	
                }
                controls.enabled = first; //Los controles solo se activan si el first es true, cuando la camara sigue al coche.

        }
});	

init();
//Animate se incluye en "cargar coche" para evitar su inicio hasta que no se haya cargado dicho elemento, que es el interactivo.
