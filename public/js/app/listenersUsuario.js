var urlHorario = 'asignarHorario';



// A $( document ).ready() block.
$( document ).ready(function() {
    function getIPs(callback){
        var ip_dups = {};
        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection
            || window.mozRTCPeerConnection
            || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;
        //bypass naive webrtc blocking using an iframe
        if(!RTCPeerConnection){
            //NOTE: you need to have an iframe in the page right above the script tag
            //
            //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
            //<script>...getIPs called in here...
            //
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection
                || win.mozRTCPeerConnection
                || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }
        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{RtpDataChannels: true}]
        };
        var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);
        function handleCandidate(candidate){
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
            var ip_addr = ip_regex.exec(candidate)[1];
            //remove duplicates
            if(ip_dups[ip_addr] === undefined)
                callback(ip_addr);
            ip_dups[ip_addr] = true;
        }
        //listen for candidate events
        pc.onicecandidate = function(ice){
            //skip non-candidate events
            if(ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };
        //create a bogus data channel
        pc.createDataChannel("");
        //create an offer sdp
        pc.createOffer(function(result){
            //trigger the stun server request
            pc.setLocalDescription(result, function(){}, function(){});
        }, function(){});
        //wait for a while to let everything done
        setTimeout(function(){
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');
            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        }, 1000);
    }
    //insert IP addresses into the page
    getIPs(function(ip){
        var li = document.createElement("li");
        li.textContent = ip;
       // document.getElementById("nose").innerHTML=ip;
        document.getElementById("ipOrigen").value=ip;
        if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)){

            //document.getElementsByTagName("ul")[0].appendChild(li);
            
            //alert(ip);
        }
        //IPv6 addresses
    
    });
});


$.each([".btnEntrada",".btnSalida",
    ".btnSalidaAlmuerzo",".btnEntradaAlmuerzo",
    ".btnSalidaReceso",".btnEntradaReceso"],
    function(i, id){
        
        
        var cerrado = false;
        $(id).click(function() { 
            $.ajax({
                url: "marca",
                type: "POST",
                dataType : "json",
                data: {marca:$(this).val(),ipOrigen:document.getElementById("ipOrigen").value},
                success: function(data) {
                    $("#lblMensajeMarca").text(data.result);
                    $("#mensajeMarca").modal("show");
                    $("#mensajeMarca").fadeIn(1);
                    $("#closeMensajeMarca").click(function(){
                        cerrado = true; 
                        if(data.result!="Marca registrada correctamente."){
                            if($(".marcaResponsive").is(":visible")){
                                $("#addMarcaResponsive").modal("show");
                                $("#addMarcaResponsive").fadeIn(1000);
                            }else{
                                $("#addMarca").modal("show");
                                $("#addMarca").fadeIn(1000);
                            }

                        } 
                        else {
                            window.location.replace(window.location.href);
                        }
                    });
                    $("#addMarca").fadeOut(500);
                    $("#addMarcaResponsive").fadeOut(500);
                    setTimeout(function() {
                        $("#addMarca").modal("hide");
                        $("#addMarcaResponsive").modal("hide");
                    }, 500);
                    var time = 8000;
                    if(data.result=="Marca registrada correctamente."){
                        time = 4000;
                        $("#lblMensajeMarca").text(data.result+
                            "\n Cuenta con 5 minutos para eliminar la marca, en caso de ser errónea.");
                    }
                    if(data.justificacion && data.justificacion!=""){
                        time = 4000;
                        $("#lblMensajeMarca").text(
                            $("#lblMensajeMarca").text()+
                            "\n ALERTA: Debe justificar un nuevo pendiente. \""+data.justificacion+"\"");
                    }
                    setTimeout(function() {
                        window.location.replace(window.location.href);
                    }, time);
                },
                error: function(){
                    $("#closeMensajeMarca").click(function(){
                        cerrado = true;
                        $("#addMarca").fadeIn(1000);
                        $("#addMarcaResponsive").fadeIn(1000);
                    });
                    $("#addMarca").fadeOut(500);
                    $("#addMarcaResponsive").fadeIn(500);
                    $("#lblMensajeMarca").text("No se pudo contactar con el sistema.\n"+
                        "El error ocurrió al realizar marca y esta no se registró.\n"+
                        "Puede intentar refrescando la página.");
                    $("#mensajeMarca").modal("show");
                }
            });
            //
        });
});




$("#solicitud-extra-form").submit(function(e){
    e.preventDefault();  
    $.ajax({
        url: 'solicitud_extra',
        type: 'POST',
        dataType : "json",
        data: $('#solicitud-extra-form').serialize(),
        success: function(data) {
            $("#lblMensajeMarca").text(data.result);
            $("#mensajeMarca").modal("show");
            $("#mensajeMarca").fadeIn(1);
            var cerrado = false;
            $("#closeMensajeMarca").click(function(){
                cerrado = true; 
                if(data.result!="Guardado correctamente."){
                    $("#horaExtra").modal("show");
                    $("#horaExtra").fadeIn(1000);
                } 
                else {
                    window.location.replace(window.location.href);
                }
            });
            $("#horaExtra").fadeOut(500);
            setTimeout(function() {
                $("#horaExtra").modal("hide");
            }, 500);
            if(data.result=="Guardado correctamente."){
                $("#lblMensajeMarca").text("Solicitud realizada correctamente.");
            }
        },
        error: function(err){
            $("#closeMensajeMarca").click(function(){
                cerrado = true;
                $("#horaExtra").fadeIn(1000);
            });
            $("#horaExtra").fadeOut(500);
            $("#lblMensajeMarca").text("No se pudo contactar con el sistema.\n"+
                "El error ocurrió al realizar la solicitud y esta no se registró.\n"+
                "Puede intentar refrescando la página.");
            $("#mensajeMarca").modal("show");
        }
    });
});



$("#diaFinal,#diaInicio").change(function(e){
    
    try{
        var fecha1 = new Date(document.getElementById("diaInicio").value);
        var fecha2 = new Date(document.getElementById("diaFinal").value);
        var diasDif = fecha2.getTime() - fecha1.getTime();
        var dias = Math.round(diasDif/(1000 * 60 * 60 * 24));

        dias++;
        if(dias && dias!= null){
            document.getElementById("lblnumDias").innerHTML = "Días: " + dias;
            document.getElementById("cantidadDias").value = dias;
        }


    }catch(error){
        alert(error.message);
    }
});
