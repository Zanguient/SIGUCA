.col-xs-8
  h3 #{usuario.nombre} #{usuario.apellido1}
  br
  div.marcaResponsive
    .col-xs-4
      h3  Marca Mediante el Sistema
      div#contBotones
        div          
         button.marcaResponsive.btn.btn-success(name='marcar', onclick= "changeElemt('marca')", data-toggle="modal" data-target="#addMarcaResponsive" value=usuario._id) Realizar Marca
    div.marcasTable
      div
      h3 Registro de Marcas
      div
        label Hora oficial 
          span.clock
        label Tiempo trabajado 
          span.clockHorasTrab
      br
      div
        table#tablaMarcas.footable
          thead
            tr
              th(data-sort-ignore="true") Tipo
              th(data-sort-ignore="true" data-type="numeric" ) Hora
          tbody.marcasDetalle
            each marca, i in marcas
              case marca.tipoMarca
                when "Entrada"
                  tr
                    td Entrada
                    td(data-value=marca.epoch) #{marca.fecha}
                when "Salida a Receso"
                  tr
                    td Salida a Receso
                    td(data-value=marca.epoch) #{marca.fecha}
                when "Entrada de Receso"
                  tr
                    td Entrada de Receso
                    td(data-value=marca.epoch) #{marca.fecha}
                when "Salida al Almuerzo"
                  tr
                    td Salida al Almuerzo
                    td(data-value=marca.epoch) #{marca.fecha}
                when "Entrada de Almuerzo"
                  tr
                    td Entrada del Almuerzo
                    td(data-value=marca.epoch) #{marca.fecha}
                when "Salida"
                  tr
                    td Salida
                    td(data-value=marca.epoch) #{marca.fecha}
                      
  div#calSupervisor
    button#previous.btn.btn-default
      i.icon.icon-chevron-left
    button#next.btn.btn-default 
      i.icon.icon-chevron-right
    div#cal

  .marca
    div.marcasTable
      h3 Registro de Marcas
      div
        label Hora oficial 
          span.clock
        label Tiempo trabajado 
          span.clockHorasTrab
      br
      div
        table#tablaMarcas.footable
          thead
            tr
              th(data-sort-ignore="true") Tipo
              th(data-sort-ignore="true") Hora
          tbody.marcasDetalle
            each marca, i in marcas
              case marca.tipoMarca
                when "Entrada"
                  tr
                    td Entrada
                    td #{marca.fecha}
                when "Salida a Receso"
                  tr
                    td Salida a Receso
                    td #{marca.fecha}
                when "Entrada de Receso"
                  tr
                    td Entrada de Receso
                    td #{marca.fecha}
                when "Salida al Almuerzo"
                  tr
                    td Salida al Almuerzo
                    td #{marca.fecha}
                when "Entrada de Almuerzo"
                  tr
                    td Entrada del Almuerzo
                    td #{marca.fecha}
                when "Salida"
                  tr
                    td Salida
                    td #{marca.fecha}

  br
  .col-xs-4
    div.justTable
      div
      h3 Justificaciones pendientes de detalle
      div
        table#tablaJust.footable
          thead
            tr
              th(data-sort-ignore="true") Motivo
              th(data-sort-ignore="true" data-type="numeric" ) Fecha
          tbody.justDetalle
            each just, i in justificaciones
              tr(data-toggle="modal" data-target="#updateJustificacion" data-value=just._id)
                td #{just.motivo}
                td() #{just.fecha.dia}, #{just.fecha.diaNum} de #{just.fecha.mes} #{just.fecha.año} 
.col-xs-4
  .marca
    h3  Marca Mediante el Sistema
    div#contBotones
      div           
       button#btn-marca.btn.btn-success(name='marcar', onclick= "changeElemt('marca')", data-toggle="modal" data-target="#addMarca" value=usuario._id) Realizar Marca

  h3 Filtros   
  div.filter
       div.filter
            if(usuario.tipo == 'Supervisor')
              label#departamento(for='departamento') 
              .btn-group
                 .btn-group
                select.form-control#selectFiltro.selectpicker(data-style="btn-success", type="text", name="idSupervisor") 
                    optgroup(label="Departamentos")
                      option(value= "Supervisor,todos," + todos) Todos los departamentos
                      each item, i in departamentos
                        option(value= "Supervisor," + item.departamento.id) #{item.departamento.nombre}
                    optgroup(label="Personales")
                      option#supervisor(value= "Empleado,todos," + usuario.id) Mi gráfico
                      option(value= "Empleado,justificaciones," + usuario.id) Justificaciones
                      option(value= "Empleado,solicitudes," + usuario.id) Solicitudes
                      option(value= "Empleado,marcas," + usuario.id) Tardías o Ausencias
            else
              .btn-group
                 .btn-group
                select.form-control#selectFiltro.selectpicker(data-style="btn-success",type="text", name="idSupervisor") 
                    option(value= "Empleado,todos," + usuario.id) Mi gráfico
                    option(value= "Empleado,justificaciones," + usuario.id) Justificaciones
                    option(value= "Empleado,solicitudes," + usuario.id) Solicitudes
                    option(value= "Empleado,marcas," + usuario.id) Tardías o Ausencias

  if(usuario.tipo == 'Supervisor')
    h3 Pendientes de revisar 
    ul.list-group
      li.list-group-item
        a(href='/gestionarEventos')
          span.badge #{solicitudes}
          |   Solicitudes
      li.list-group-item
        a(href='/gestionarEventos')
          span.badge #{justificaciones} 
          |   Justificaciones

  h3 Acciones 
  ul.list-group
    li.list-group-item
      a(data-toggle="modal" data-target="#horaExtra")
        | Solicitud de hora extraordinaria
    li.list-group-item
      a(data-toggle="modal" data-target="#permiso")
        | Solicitud de permiso anticipado
    li.list-group-item
      a(data-toggle="modal" data-target="#addJustificacion")
        | Justificaciones

#addMarca.modal.fade(tabindex='-1', role='dialog', aria-labelledby='myModalLabel', aria-hidden='true')
    .modal-dialog
        .modal-content
          .modal-header
            button.close(type='button', data-dismiss='modal', aria-hidden='true') ×
            h3#myModalLabel.modal-title Marcar Mediante Sistema
          .modal-body
            form(role='form', method="POST", action="/marca")#login-form.well.span4
              table.table
                tr
                  modal.group     
                     label-info( name= codTarjeta) #{usuario.tipo} #{usuario.nombre} #{usuario.apellido1}
                tr
                  modal.group 
                    td
                      button.btn.btn-success.btn-(style="width: 150px;" type='submit', value = 'Entrada', name = 'marca') Entrada
                    td
                      button.btn.btn-success.btn-(style="width: 150px;" type='submit', value = 'Salida', name = 'marca') Salida
                tr
                  modal.group 
                    td
                      button.btn.btn-warning.btn-(style="width: 150px;" type='submit', value = 'Salida a Receso', name = 'marca') Salida a Receso 
                    td
                      button.btn.btn-warning.btn-(style="width: 150px;" type='submit', value = 'Entrada de Receso', name = 'marca') Entrada de Receso
                tr
                  modal.group 
                    td
                      button.btn.btn-primary.btn-(style="width: 150px;" type='submit', value = 'Salida al Almuerzo', name = 'marca') Salida al Almuerzo
                    td
                      button.btn.btn-primary.btn-(style="width: 150px;" type='submit', value = 'Entrada de Almuerzo', name = 'marca') Entrada del Almuerzo
              .form-group
                label()
                  button.btn.btn-danger(type='button', data-dismiss='modal') Cancelar

#addMarcaResponsive.modal.fade(tabindex='-1', role='dialog', aria-labelledby='myModalLabel', aria-hidden='true')
    .modal-dialog
        .modal-content
          .modal-header
            button.close(type='button', data-dismiss='modal', aria-hidden='true') ×
            h3#myModalLabel.modal-title Marcar Mediante Sistema
          .modal-body
            form(role='form', method="POST", action="/marca")#login-form.well.span4
              table.table
                tr
                  modal.group     
                     label-info( name= codTarjeta) #{usuario.tipo} #{usuario.nombre} #{usuario.apellido1}
                tr
                  modal.group 
                    td
                      button.btn.btn-success.btn-(style="width: 100%" type='submit', value = 'Entrada', name = 'marca') Entrada
                tr
                  modal.group 
                    td
                      button.btn.btn-warning.btn-(style="width: 100%" type='submit', value = 'Salida a Receso', name = 'marca') Salida a Receso 
                tr
                  modal.group 
                    td
                      button.btn.btn-warning.btn-(style="width: 100%" type='submit', value = 'Entrada de Receso', name = 'marca') Entrada de Receso
                tr
                  modal.group 
                    td
                      button.btn.btn-primary.btn-(style="width: 100%" type='submit', value = 'Salida al Almuerzo', name = 'marca') Salida al Almuerzo
                tr
                  modal.group 
                    td
                      button.btn.btn-primary.btn-(style="width: 100%" type='submit', value = 'Entrada de Almuerzo', name = 'marca') Entrada del Almuerzo

                tr
                  modal.group 
                    td
                      button.btn.btn-success.btn-(style="width: 100%" type='submit', value = 'Salida', name = 'marca') Salida
              .form-group
                label()
                  button.btn.btn-danger(type='button', data-dismiss='modal') Cancelar

#horaExtra.modal.fade(tabindex='-1', role='dialog', aria-labelledby='myModalLabel', aria-hidden='true')
    .modal-dialog
        .modal-content
          .modal-header
            button.close(type='button', data-dismiss='modal', aria-hidden='true') ×
            h4#myModalLabel.modal-title Solicitar hora extraordinaria
          .modal-body
            form(role='form', method="POST", action="/solicitud_extra")#login-form.well.span4
              .form-group
                label(for='fecha') Inicio:
                  div.input-group
                    input#date_timepicker_start.form-control(type='text', name='epochInicio', placeholder='Fecha y hora de inicio' required )
                    span.input-group-addon
                      i.icon-time
                label(for='fecha') Termino:
                  div.input-group
                    input#date_timepicker_end.form-control(type='text', name='epochTermino', placeholder='Fecha y hora final' required )
                    span.input-group-addon
                      i.icon-time
              .form-group
                label(for='cliente') Cliente:
                  input.input-small.form-control(type="text", name='cliente' required )
                label(for='motivo') Motivo:
                  textarea#motivo.form-control(rows="4" cols="50" name='motivo' required )
                
                                             
              button.btn.btn-success(type='submit') Enviar
              button.btn.btn-default(type='button', data-dismiss='modal') Cancelar

 
#permiso.modal.fade(tabindex='-1', role='dialog', aria-labelledby='myModalLabel', aria-hidden='true' )
    .modal-dialog
        .modal-content
          .modal-header
            button.close(type='button', data-dismiss='modal', aria-hidden='true') ×
            h4#myModalLabel.modal-title Solicitar permiso anticipado
          .modal-body
            form.formSoli(role='form', method="POST")#login-form.well.span4
              .form-group
                label(for='diaInicio') Día Inicial:
                  div.input-group
                    input#diaInicio.form-control(type='text', name='diaInicio', placeholder='Fecha Inicial' required)
                    span.input-group-addon
                      i.icon-calendar
                label(for='diaFinal') Día Final:
                  div.input-group
                    input#diaFinal.form-control(type= 'text', placeholder='Fecha Final', name= 'diaFinal' required)
                    span.input-group-addon
                      i.icon-calendar
                label(for='cantidadDias')  Días:
                  input#cantidadDias.form-control(type= 'text', placeholder='3', name= 'cantidadDias' required)
              .form-group
                label(for='motivo') Motivo:
                  select#selectMotivo.form-control(type= 'text', name= 'motivo' style='float:left' required)
                    option(value='seleccionar') Seleccione una opción
                    option(value='Vacaciones') Vacaciones
                    option(value='Permiso Médico') Permiso Médico
                    option(value='Permiso Estudio') Permiso de Estudio
                    option(value='Familiar') Familiar
                    option(value='otro') Otro
                label(for='motivoOtro') Otro:
                  input#motivoOtro.form-control(type= 'text', placeholder='Otro', name= 'motivoOtro' style='float:left' disabled)
              .form-group
                label(for='detalle') Detalle:
                  textarea#detalle.form-control(rows="4" cols="50" name='detalle' required)
                                                                   
              button#btn-permiso.btn.btn-success Enviar
              button.btn.btn-default(type='button', data-dismiss='modal') Cancelar

         
#addJustificacion.modal.fade(tabindex='-1', role='dialog', aria-labelledby='myModalLabel', aria-hidden='true')
  .modal-dialog
    .modal-content
      .modal-header
        button.close(type='button', data-dismiss='modal', aria-hidden='true') ×
        h4#myModalLabel.modal-title Justificación
      .modal-body
        form.formJust(role='form', method="POST")#login-form.well.span4
          .form-group
            label(for='motivoJust') Motivo:
              select#selectMotivoJust.form-control(type= 'text', name= 'motivoJust' style='float:left' required)
                option(value='seleccionar') Seleccione una opción
                option(value='Tardía') Tardía
                option(value='Omisión de Marca') Omisión de Marca
                option(value='Ausencia') Ausencia
                option(value='otro') Otro
            label(for='motivoOtroJust') Otro:
              input#motivoOtroJust.form-control(type= 'text', placeholder='Otro', name= 'motivoOtroJust' style='float:left' disabled)
          .form-group
              label(for='detalles') Detalles:
              textarea#detalles.form-control(rows="4" cols="50" name='detalle' required)
                 
          button#btn-just.btn.btn-success(type='submit') Enviar
          button.btn.btn-default(type='button', data-dismiss='modal') Cancelar

#updateJustificacion.modal.fade(tabindex='-1', role='dialog', aria-labelledby='myModalLabel', aria-hidden='true')
  .modal-dialog
    .modal-content
      .modal-header
        button.close(type='button', data-dismiss='modal', aria-hidden='true') ×
        h4#myModalLabel.modal-title Justificación
      .modal-body
        form.formJust#login-form.well.span4
          .form-group
            label(for='motivoOtroJust') Motivo:
              label#motivoOtroJust.form-control(style='float:left')
          .form-group
              label(for='detalles') Detalles:
              textarea#detalles.form-control(rows="4" cols="50" required)
                 
          button#btn-just.btn.btn-success(type='submit') Enviar
          button.btn.btn-default(type='button', data-dismiss='modal') Cancelar