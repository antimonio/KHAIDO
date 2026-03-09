<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
ini_set( 'display_errors', 1 );
error_reporting( E_ALL );

if(isset($_POST['submit']))
{
    echo "<p>If Opened</p>";
    $name = $_POST['name'] . " " . $_POST['name2'];
    $subject = $_POST['subject'];
    $from = $_POST['from'];
    $message = $_POST['message'];
    $tlf = $_POST['tlf'];
    $to = "ajatwork00@gmail.com";
    $headers = 'From: info@khaido.site';
    $txt = "Has recibido un correo de ".$name." (".$tlf.",".$from.") \n\n".$message;
    echo "<p>Data ok</p>";
    //echo "<p> Headers and everything exposed:".$name.$from.$tlf.$to.$subject.$txt.$headers."</p>";
    if(mail ($to, $subject, $txt, $headers))
    {
        echo '<p>Your message has been sent!</p>';
        header("Location:index.html");
    }
    else echo '<p>Algo salió mal con su envío, le recomendamos que recargue la página para intentar reenviarlo, ¡a veces el servidor se satura!</p>';
}
