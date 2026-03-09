

/**
 * loadDefaults() es utilizada para generar y actualizar una serie de valores 
 * (podriamos decir que están por defecto) cuyo uso se repite a lo largo 
 * de la programacion del juego o es más conveniente unificar en un solo lugar
 * para configurarlas. En orden:
 * -Los nombres por defecto de los jugadores si el user no introduce nada
 * -Posiciones de las cajas de texto e iniciales de las raquetas
 * -Angulo inicial de la bola (35 grados en una direccion aleatoria)
 * -Tamaño de las palas y velocidad por defecto si el user no introduce nada
 * -Posicion central inicial de la bola.
 * -Retardo antes de lanzar la bola
 * -Velocidad de las raquetas (o jugador)
 */
function loadDefaults()
{
    var defaults = new Object();
    defaults.player1_name = "player_one";
    defaults.player2_name = "player_two";
    defaults.player_y = canvas.height * 0.5;  
    defaults.player_text_y = canvas.height * 0.075;
    defaults.player1_x = canvas.width * 0.1;  
    defaults.player1_text_x = canvas.width * 0.25;
    defaults.player2_x = canvas.width * 0.9;  
    defaults.player2_text_x = canvas.width * 0.75;
    defaults.ball_x_angle = Math.cos(0.611)* (Math.random() < 0.5 ? -1 : 1);
    defaults.ball_y_angle = Math.sin(0.611)* (Math.random() < 0.5 ? -1 : 1);
    defaults.size = canvas.height/100;
    defaults.speed = 10;
    defaults.ball_x = (canvas.width/2) -2;
    defaults.ball_y = (canvas.height/2) -2;
    defaults.init_wait = 33;
    defaults.player_speed = 8;
    
    return defaults;
}


/**
 * makeCongig() funciona como constructor para el objeto Game, que será usado en
 * el código para:
 * -Obtener la velocidad actual de la pelota (speed)
 * -Obtener el tamaño actual de las raquetas (size)
 * @param speed
 * @param size 
 */
function makeConfig(speed, size)
{
    var game = new Object();
    game.speed = speed;
    game.size = size;
    
    return game;
}


/**
 * makePlayer() funciona como constructor para el objeto Player, que incluye
 * todas las características del jugador 1 o 2:
 *      nombre, puntuación, posición de su cuadro de texto, posición de su pala,
 *          su estado de movimiento y su dirección de movimiento actual (positiva o negativa)
 * @param name
 * @param text_x
 * @param x
 */
function makePlayer(name, text_x, x)
{
    var player = new Object();
    player.name = name;
    player.score = 0;
    player.text_x = text_x;
    player.text_y = defaults.player_text_y;
    player.x = x;
    player.y = defaults.player_y;
    player.isMoving = false;
    player.dir = 0;

    
    return player;
}

/**
 * adaptView() adapta más adecuadamente el tamaño del texto y el canvas al viweport,
 *  esto siempre que el juego no haya comenzado, pues podría provocar bugs u obligar al programador
 *  a pedir un reinicio del juego
 */
function adaptView() 
{
    if (!isgameinit)
    {
        if(window.innerHeight > window.innerWidth) 
        {
            document.body.style.fontSize = "2vw";
            canvas.width = window.innerWidth*0.5;   //Para que no se pase de tamaño en pantallas muy panorámicas
            canvas.height = canvas.width * 9/16;
        }
        else
        {
            document.body.style.fontSize = "2vh";
            canvas.height = window.innerHeight*0.5;    //Para que no se pase de tamaño en pantallas muy panorámicas
            canvas.width = canvas.height * 16/9;
        }
        
        ctx.clearRect(0,0,canvas.width,canvas.height);   
        defaults = loadDefaults();
    } 
}

/**
 * startgame() inicia el juego, cambiando el estado de isgameinit y el botón de
 * iniciar (por eso coge como parametro el formulario)
 * si el juego estaba ya iniciado, funciona como reload, limpiando la variable
 * de intervalo
 * @param form
 */
function startgame(form) 
{ 
    if(!isgameinit)
    {
        form.lastElementChild.style.backgroundImage = "url('refresh.png')";   
        isgameinit = true;
    }
    else
        clearInterval(intervalID);
    
    initAnimation(); 
} 

/**
 * initAnimation() recarga los elementos de defaults poe si ha habido algun cambio,
 * prepara a los jugadores, game y pelota con sus respectivos datos, asi como inicia
 * el intervalo
 */
function initAnimation() 
{ 
    defaults = loadDefaults();

    var player1name = document.getElementById("player1").value || defaults.player1_name;
    var player2name = document.getElementById("player2").value || defaults.player2_name;
    var size = parseInt(document.getElementById("racket_size").value) * defaults.size  || 20 * defaults.size;
    var speed = parseInt(document.getElementById("game_speed").value) || defaults.speed;

    player1 = makePlayer(player1name, defaults.player1_text_x, defaults.player1_x);    
    player2 = makePlayer(player2name, defaults.player2_text_x, defaults.player2_x);     
    game = makeConfig(speed,size);
    ball = new Object();
    ball.x = defaults.ball_x;
    ball.y = defaults.ball_y;
    ball.x_angle = defaults.ball_x_angle;
    ball.y_angle = defaults.ball_y_angle;
    ball.initial_pause = defaults.init_wait;
    
    intervalID = setInterval(drawcanvas, 33); 
}

/**
 * ballcolider() comprueba la colision entre un determinado jugador introducido como
 * parametro y la pelota. Para ello es necesario saber hacia donde va la pelota, lo
 * cual es calculado en moveball(), función que accede a esta para calcular el movimiento
 * incluyendo el caso de colisión
 * @param player
 * @param newx
 */
function ballcollider(player,newx)
{
    var collision = false;
    //Si la bola esta en la y en el rango de posiciones de player
    if(ball.y > player.y && ball.y < player.y + game.size)
    {
        //Si la bola traspasa horizontalmente al jugador hacia la izquierda o la derecha
        if((ball.x_angle > 0 && ball.x < player.x && newx >= player.x)
                || (ball.x_angle < 0 && ball.x > player.x && newx <= player.x)) collision = true;
    }
    return collision;
}

/**
 * moveball() calcula el movimiento de la pelota en el instante 
 * incluyendo todos los casos de colisión
 */
function moveball()
{
    if (ball.initial_pause > 0)
        ball.initial_pause--;
    else
    {
        var newx = ball.x + ball.x_angle * game.speed;
        var newy = ball.y + ball.y_angle * game.speed;

        //Colisionar con las paredes laterales o con los jugadores
        if ((newx > canvas.width*2/3 && ballcollider(player2,newx)) 
                || newx < canvas.width*1/3 && ballcollider(player1,newx))
        {
            ball.x_angle = -ball.x_angle;
            newx = ball.x + ball.x_angle * game.speed;
        }
        
        if (newx < 0)
        {
            newx = defaults.ball_x;
            newy = defaults.ball_y;
            ball.x_angle *= -1;
            ball.y_angle *= 1;
            ball.initial_pause = defaults.init_wait;         
            player2.score ++;
        }
        else if (newx > canvas.width)
        {
            newx = defaults.ball_x;
            newy = defaults.ball_y;
            ball.x_angle *= -1;
            ball.y_angle *= 1;
            ball.initial_pause = defaults.init_wait;    
            player1.score ++;
        }

        if (newy <= canvas.height/9 || newy > canvas.height)
        {
            ball.y_angle = -ball.y_angle;
            newy = ball.y + ball.y_angle * game.speed;
        }

        ball.x = newx;
        ball.y = newy;        
    }

}

/**
 * on_player_move(e) es la funcion listener para saber si se está pulsando
 * alguna tecla de movimiento para los jugadores y activar sus respectivas
 * variables de movimiento y dirección de la forma adecuada
 * @param e
 */
function on_player_move(e)
{
    switch(e.key)
    {
        case "ArrowUp":        //flecha arriba
            player2.isMoving = true;
            player2.dir = -1;
            break;
        case "ArrowDown":        //flecha abajo
            player2.isMoving = true;
            player2.dir = 1;
            break;
        case "w": case "W":        //w
            player1.isMoving = true;
            player1.dir = -1;
            break;
        case "s": case "S":        //s
            player1.isMoving = true;
            player1.dir = 1;
            break;
        default:
            break;
    }
}

/**
 * on_player_move(e) es la funcion listener para saber si se ha dejado de pulsar
 * alguna tecla de movimiento para los jugadores y en ese caso desactivar el estado
 * de movimiento de los mismos
 * @param e
 */
function off_player_move(e)
{
    switch(e.key)
    {
        case "ArrowUp":        //flecha arriba
            player2.isMoving = false;
            break;
        case "ArrowDown":        //flecha abajo
            player2.isMoving = false;
            break;
        case "w": case "W":         //w
            player1.isMoving = false;
            break;
        case "s": case "S":       //s
            player1.isMoving = false;
            break;
        default:
            break;
    }
}

/**
 * moverjugador(player) es la funcion encargada de cambiar los parametros de un
 * determinado jugador en cada instante, en caso de que se le esté moviendo su pala
 * @param player
 */
function moverjugador(player)
{
    if(player.isMoving)
    {
        var newy = player.y + player.dir * defaults.player_speed;      
        if (newy + game.size < canvas.height && newy > canvas.height/9) player.y = newy;
    }       

}

/**
 * dibujarjugador(player) es la funcion que aglomera los paths de dibujado
 * de un jugador determinado
 * @param player
 */
function dibujarjugador(player)
{
    //Pala
    ctx.beginPath();
        ctx.moveTo(player.x,player.y);
        ctx.lineTo(player.x,player.y + game.size);
        ctx.lineWidth = 5;
        ctx.stroke();
    ctx.closePath();   
    
    //Datos
    ctx.beginPath();
        ctx.fillText(player.name + ": " + player.score, player.text_x, player.text_y);
    ctx.closePath();       
}

/**
 * dibujarbola() es la funcion que aglomera los paths de dibujado
 * de la pelota. Tanto este como la de los jugadores se limitan a utilizar sus parámetros
 * ya calculados para dibujar en cada instante
 */
function dibujarbola()
{
    ctx.beginPath();
        ctx.arc(ball.x,ball.y,canvas.width/150,0,Math.PI*2,true);
        ctx.fill();
    ctx.closePath();    
}

/**
 * drawcanvas() aglomera todos los actos de dibujado en cada instante
 */
function drawcanvas()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    moverjugador(player1);
    moverjugador(player2);
    moveball();
    
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.font="1em Lucida Console";
    ctx.textAlign="center";
    
    dibujarjugador(player1);
    dibujarjugador(player2);
    dibujarbola();
}