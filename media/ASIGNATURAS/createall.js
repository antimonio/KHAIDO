			var calendar = d3.select("body").append("div").attr("id","calendar");
			calendar.selectAll("div")
			   .data(listDate)
			   .enter()
			   .append("div")
			   .attr("id", function(d) {
					let res;
					if(d != "legend") res = d;
			   		return res;
			   })
			   .attr("class",function(d) {
					let res;
					if(d == "legend") res = "legend";
					else res = "day"; 
			   		return res;
			   })
			   .text( function(d) {
					let res;
					if(d != "legend") res =  d.slice(-2) + "-" + d.slice(5,-3);
					else res = String.fromCharCode(160);
			   		return res;
			   });
			   
			var download = d3.select("body").append("button").text("descargar").style("position","fixed").style("top","0px").on("click",function()
			{
				let saveCalendar = document.getElementById("calendar");
				let saveStyle = document.getElementsByTagName("style")[0];
				let texto = ["<html><head><style>" + saveStyle.innerHTML + "</style></head><body><div id='calendar'>" + saveCalendar.innerHTML + "</div></body></html>"];
				let blob = new Blob(texto, { type: 'text/html' });
				
				let reader = new FileReader();
					reader.onload = function (event) 
					{
						var save = document.createElement('a');
						save.href = event.target.result;
						save.target = '_blank';
						save.download = "micalendario.html" || 'archivo.dat';
						var clicEvent = new MouseEvent('click', 
						{
							'view': window,
								'bubbles': true,
								'cancelable': true
						});
						save.dispatchEvent(clicEvent);
						(window.URL || window.webkitURL).revokeObjectURL(save.href);
					};
					reader.readAsDataURL(blob);				
			
			});
			   
			d3.select("body").selectAll(".day").selectAll("div")
				.data(listHours)
				.enter()
				.append("div")
				.attr("class",function(d){return d[0].replaceAll(":","");})
				.attr("onclick","save(event)")
				.attr("style", function(d){
					return "background-color:" + d3.schemeCategory20[parseInt(this.parentNode.id.slice(5,-3))];});

			d3.select("body").selectAll(".legend").selectAll("div")
				.data(listHours)
				.enter()
				.append("div")
				.attr("class",function(d){return d[0].replaceAll(":","");})
				.text(function(d){return (d[0] + " a " + d[1]).replaceAll("T","");});
				
			var subjects = "emp";	
				
			fetch("asignaturas.json")
			.then(response => {
			   return response.json();
			})
			.then(data => 
			{
				subjects = data;
				for(subject of subjects)
				{
					for(sesion of subject.fechas)
					{
					
						
						var e = document.createElement("div"),
							dest=document.getElementById(sesion.slice(0,-6)).getElementsByClassName(sesion.slice(-6).replaceAll(":",""))[0];
							

							
						e.className = e.innerHTML = subject.siglas;
						e.setAttribute("style","background-color:"+subject.color);
						dest.append(e);
						
						
					}
					var b = document.createElement("INPUT"), b_label = document.createElement("p"), b_div = document.createElement("div");
					b.setAttribute("type","checkbox");
					b.setAttribute("onclick","showsubject(event,'" + subject.siglas + "')");
					b.checked = true;
					b_label.innerHTML = subject.nombre;
					b_label.append(b); b_div.append(b_label);
					document.getElementById("floatbuttons").append(b_div);
				}		
				reloadheight();
				
			});
							
			function save(e)
			{
				listCreated.push(e.target.parentNode.id + e.target.className.slice(0,3)+ ":" + e.target.className.slice(-2));
				console.log(listCreated);
			}		
			
			function showsubject(e,subject)
			{
				if(e.target.checked) d3.select("body").selectAll("."+subject).style("display","block");
				else d3.select("body").selectAll("."+subject).style("display","none");
				reloadheight();
			}
			
			function reloadheight()
			{
				for(hora of listHours) setheight(hora[0].replaceAll(":",""));
			}
			
			function setheight(hour)
			{
				let selector = d3.select("body").selectAll("."+hour), list = selector._groups[0];
				var height= 1.25;
				for (node of list)
					if(node.children.length > 1) 
					{
						let truelength = node.children.length;
						for(child of node.children) {if(child.style.display == "none") truelength--;};
						if (truelength > 1 && height < truelength * 1.25) height = truelength * 1.25;
					}
				selector.style("height",height+"em");
			}