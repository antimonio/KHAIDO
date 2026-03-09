
<style>
    input, textarea{
    font-size:9px;
  }
</style>

<script>
    var formData = new FormData();
    var row;
    
    function start(){ row = event.target;}
    function dragover()
    {
      var e = event;
      e.preventDefault();

      let children= Array.from(e.target.parentNode.parentNode.children);
      if(children.indexOf(e.target.parentNode)>children.indexOf(row)) e.target.parentNode.after(row);
      else e.target.parentNode.before(row);
    }

    function duplicateNodes(nodeToClone)
    {
        NodeList.prototype.forEach = Array.prototype.forEach;
        var parentClone = nodeToClone.cloneNode(true);
        var children = parentClone.childNodes;
        
        children.forEach( function(item)
        { 
            if(item.firstChild !== null) 
            {
                let it = item.children[0];
                it.value = "";
                if(it.type = "hidden") { it.type = "text"; it.size = 10; }
            } 
            
        });
        
        return parentClone;
    }
    
    function addRow(btn, above)
    {
        let row = btn.parentNode.parentNode, new_row = duplicateNodes(row);
        
        let image_input = document.createElement('input'), img_td = document.createElement('td');
        image_input.type = 'file';
        image_input.accept = 'image/webp';
        image_input.setAttribute("onchange","storeImage(this)");

        
        img_td.append(image_input);
        new_row.append(img_td);

        if(above) row.parentNode.insertBefore(new_row, row);
        else row.parentNode.insertBefore(new_row, row.nextSibling);
    }
    
    function deleteRow(btn) 
    {
      var row = btn.parentNode.parentNode;
      row.parentNode.removeChild(row);
    }
    
    
    function storeImage(containerInput)
    {
        let file =  containerInput.files[0];
        let blob = file.slice(0, file.size, 'image/webp'); 
        let name = containerInput.parentNode.parentNode.children[0].children[0].value + ".webp";
        alert(name + " es el nombre de la imagen que se va a subir...");
        let newFile = new File([blob], name, {type: 'image/webp'});
        formData.append(name, newFile);
        containerInput.disabled = true;
    }
    
    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }
    
    function refreshAll()
    {
        var table = document.getElementById("edittable");
        var table_content = [];
        
        for (var i = 0, row; row = table.rows[i]; i++) 
        {
           table_content[i] = [];
           for (var j = 0, col; col = row.cells[j]; j++) 
           {
               if(j < 7)
               {
                    let subject = col.children[0];
                    if(subject !== undefined)
                    {
                        if(subject.type != "file") table_content[i][j] = subject.value;
                        else
                        {
                            const reader = new FileReader();
                            
                        }
                    }
                    else table_content[i][j] = col.innerHTML;
                    table_content[i][j] = decodeHtml(table_content[i][j]).replace(/(\r\n|\n|\r)/gm, "");
               }

           }  
        }
        let csvContent = table_content.map(e => e.join(";")).join("\n");
        formData.append('write', csvContent);
        
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange=function(){ if(xhr.readyState==4  && xhr.status==200) document.body.innerHTML = xhr.responseText; };
        
        xhr.open("post", "editorCSV.php/", true);
        xhr.send(formData);
        formData = new FormData();

    }
</script>

<?php
if(isset($_POST["write"])) file_put_contents("../media/media.csv", $_POST["write"]);

foreach($_FILES as $file) 
{
  $targetPath = "../media/previews/" . basename($file["name"]);
  move_uploaded_file($file["tmp_name"], $targetPath);
}

$header = NULL;
$data = array();
if ($handle = fopen("../media/media.csv", 'r'))
{
    ?> 
        <button onclick="refreshAll()">actualizar</button>
        <table id="edittable"> 
    <?php
    while ($row = fgetcsv($handle, 1000, ';'))
    {

        if(!$header) 
        {
            $header = $row;
            ?>
            <thead> <tr> 
                <?php for($i = 0; $i < 7; ++$i) { ?>    
                    <td><?php echo $header[$i] ?></td>
                <?php } ?>
                <td></td><td></td><td></td>
            </tr> </thead>
            <tbody>
            <?php
        }
        else
        {
            $data = array_combine($header, $row);
            
            ?>
            
                <tr draggable='true' ondragstart='start()' ondragover='dragover()'> 
                    <td> <input class="media" type='hidden' value='<?php echo $data['MEDIA']?>'> </td>
                    <td> <textarea cols='35' rows='3'><?php echo $data['TITULO'] ?> </textarea> </td>
                    <td> <input type='text' size='5' value='<?php echo $data['TIPO'] ?>'> </td>
                    <td> <textarea cols='60' rows='10'><?php echo $data['DESCRIPCION']?></textarea></td>
                    <td> <textarea cols='15' rows='5'><?php echo $data['LINK']?></textarea></td>
                    <td> <textarea cols='15' rows='5'><?php echo $data['PARAMETERS']?></textarea></td>
                    <td> <textarea cols='15' rows='4'><?php echo $data['TAGS']?></textarea></td>
                    <td> <button onclick='deleteRow(this)'> Eliminar </button></td>
                    <td> <button onclick='addRow(this,true)'> Insertar encima </button></td>
                    <td> <button onclick='addRow(this,false)'> Insertar debajo </button></td>
                </tr> 
            <?php
        }
    } 
    ?> </tbody></table> <?php
    fclose($handle);
}
