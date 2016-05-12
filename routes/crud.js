'use strict';

var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Marca 			= require('../models/Marca'),
Departamento 	= require('../models/Departamento'),
Usuario 		= require('../models/Usuario'),
Horario 		= require('../models/Horario'),
Justificaciones = require('../models/Justificaciones'),
Solicitudes 	= require('../models/Solicitudes'),
Cierre 			= require('../models/Cierre'),
util 			= require('../util/util'),
emailSIGUCA 	= 'siguca@greencore.co.cr';

//--------------------------------------------------------------------
//	Métodos Justificaciones          
//	---------------------------------------------------------------------*/
exports.addJust = function(justificacion, cb){
	var epochTime = moment().unix();
	var newjustificacion = Justificaciones({
		usuario: justificacion.id,
		fechaCreada: epochTime,
		detalle: justificacion.detalle,
		comentarioSupervisor: ""
	});

	if(justificacion.motivoJust == 'otro')
		newjustificacion.motivo = justificacion.motivoOtroJust;
	else
		newjustificacion.motivo = justificacion.motivoJust;
	if(justificacion.estado)
		newjustificacion.estado = justificacion.estado;
	Justificaciones.find(
	{
		usuario: newjustificacion.usuario, 
		fechaCreada: newjustificacion.fechaCreada,
		motivo:newjustificacion.motivo
	}, 
	function (err, just){
		if(just.length == 0){
			newjustificacion.save(function (err, user) {
				if (err) console.log(err);
				return cb();
			});//save
		}
	});//verificar
};

exports.loadJust = function(id, cb){
	Justificaciones.findById(id, function (err, just) { 
		if(just.estado == 'Pendiente'){
			Justificaciones.findById(id, function (err, justificacion) { 
				if (err) return cb(err);
				cb(justificacion);
			}); 
		} else if(just.estado == 'Incompleto'){
			Justificaciones.findById(id, function (err, justificacion) { 
				if (err) return cb(err);
				cb(justificacion);
			}); 
		}else cb({motivo:'seleccionar',detalle:''});
	}); 
}

exports.updateJust = function(justificacion, cb){
	var epochTime = moment().unix();

	var motivo = '';
	if(justificacion.motivoJust == 'otro'){
		motivo = justificacion.motivoOtroJust;
	} else{
		motivo = justificacion.motivoJust;
	} 

	var justificacionActualizada = {
		fechaCreada: epochTime,
		motivo: motivo,
		detalle: justificacion.detalle,
		estado: "Pendiente"
	};

	Justificaciones.findById(justificacion.id).populate('usuario').exec(function (err, just) { 
		console.log(just);
		Justificaciones.findByIdAndUpdate(justificacion.id, justificacionActualizada, function (err, justActualizada) { 
			if (!err && just.estado!="Incompleto") {
				Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : just.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) { 
					if (err) return cb(err);

					var transporter = nodemailer.createTransport();

					for (var i = 0; i < supervisor.length; i++) {
						transporter.sendMail({
							from: emailSIGUCA,
							to: supervisor[i].email,
							subject: 'Modificación de una justificación en SIGUCA',
							text: " El usuario " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
							+ " ha modificado la siguiente justificación: "
							+ " \r\n Motivo: " + just.motivo
							+ " \r\n Detalle: " + just.detalle
							+ "\r\n\r\n A continuación se muestra la justificación modificada" 
							+ " \r\n Motivo: " + justActualizada.motivo
							+ " \r\n Detalle: " + justActualizada.detalle
						});
					}
				});
			}
			return cb(err);
		});

});

}

exports.deleteJust = function(id, cb){
	Justificaciones.findByIdAndRemove(id).populate('usuario').exec(function (err, just) { 
		if (err) return cb(err,'');
		var fecha = "";
		if(just.fechaCreada)
			fecha = moment(just.fechaCreada);

		var transporter = nodemailer.createTransport();

		transporter.sendMail({
			from: emailSIGUCA,
			to: just.usuario.email,
			subject: 'Se ha eliminado una justificación en SIGUCA',
			text: " Estimado(a) " + just.usuario.nombre + " " + just.usuario.apellido1 + " " + just.usuario.apellido2
			+ " \r\n Su supervisor ha eliminado una de las justificaciones presentadas, en la cuál se indicabá lo siguiente: " 
			+ " \r\n Fecha: " + fecha
			+ " \r\n Motivo: " + just.motivo
			+ " \r\n Detalle: " + just.detalle
		});

		return cb(err, 'Se elimino');
	});
}

	/*--------------------------------------------------------------------
		Métodos Solicitudes Extras   
		---------------------------------------------------------------------*/
		exports.addExtra = function(extra, cb){
			var epochTime = moment().unix(),
			epochInicio = moment(extra.epochInicio,"DD/MM/YYYY HH:mm").unix(),
			epochTermino = moment(extra.epochTermino,"DD/MM/YYYY HH:mm").unix(),
			cantHoras = epochTermino - epochInicio;

			var newSolicitud = Solicitudes({
				fechaCreada: epochTime,
				tipoSolicitudes: "Extras",
				diaInicio: extra.epochInicio,
				diaFinal: extra.epochTermino,
				epochInicio: epochInicio,
				epochTermino: epochTermino,
				cantidadHoras: cantHoras,
				cliente: extra.cliente,
				motivo: extra.motivo,
				usuario: extra.id,
				comentarioSupervisor: ""
			});

			Solicitudes.find({usuario: newSolicitud.usuario, fechaCreada: newSolicitud.fechaCreada}, function (err, soli){
				if(soli.length == 0){
					newSolicitud.save(function (err, user) {
						if (err) console.log(err);
						else return cb();
				});//save
				}
		});//verificar
		}

		exports.updateExtra = function(extra, cb){
			var epochTime = moment().unix(),
			epochInicio = moment(extra.epochInicio,"YYYY/MM/DD HH:mm").unix(),
			epochTermino = moment(extra.epochTermino,"YYYY/MM/DD HH:mm").unix(),
			cantHoras = epochTermino - epochInicio;

			var solicitudActualizada = {
				fechaCreada: epochTime,
				diaInicio: extra.epochInicio,
				diaFinal: extra.epochTermino,
				epochInicio: epochInicio,
				epochTermino: epochTermino,
				cantidadHoras: cantHoras,
				cliente: extra.cliente,
				motivo: extra.motivo
			};

			Solicitudes.findById(extra.id).exec(function (err, soli) { 
				Solicitudes.findByIdAndUpdate(extra.id, solicitudActualizada).populate('usuario').exec(function (err, solicitud) { 
					if (!err) {
						Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : solicitud.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) { 
							if (err) return cb(err);

							var transporter = nodemailer.createTransport();

							for (var i = 0; i < supervisor.length; i++) {
								transporter.sendMail({
									from: emailSIGUCA,
									to: supervisor[i].email,
									subject: 'Modificación de una solicitud de hora extraordiaria en SIGUCA',
									text: " El usuario " + solicitud.usuario.nombre + " " + solicitud.usuario.apellido1 + " " + solicitud.usuario.apellido2
									+ " ha modificado la siguiente solicitud de hora extraordiaria: "
									+ "\r\n Día de Inicio: " + soli.diaInicio 
									+ "\r\n Día de termino: " + soli.diaFinal 
									+ "\r\n Motivo: " + soli.motivo
									+ "\r\n Detalle: " + soli.detalle
									+ "\r\n\r\n A continuación se muestra la solicitud de hora extraordiaria modificada "
									+ "\r\n Día de Inicio: " + solicitudActualizada.diaInicio 
									+ "\r\n Día de termino: " + solicitudActualizada.diaFinal 
									+ "\r\n Motivo: " + solicitudActualizada.motivo
									+ "\r\n Detalle: " + solicitudActualizada.detalle
								});
							}
						});
}
return cb(err);
});
});
}

	/*--------------------------------------------------------------------
		Métodos Solicitudes de Permisos   
		---------------------------------------------------------------------*/
		exports.addPermiso = function(permiso, cb){
			var epochTime = moment().unix(); 

			var newSolicitud = Solicitudes({
				fechaCreada: epochTime,
				tipoSolicitudes: "Permisos",
				diaInicio: permiso.diaInicio,
				diaFinal: permiso.diaFinal,
				cantidadDias: permiso.cantidadDias,
				detalle: permiso.detalle,
				usuario: permiso.usuario.id,
				comentarioSupervisor: ""
			});
			if(permiso.motivo == 'otro')
				newSolicitud.motivo = permiso.motivoOtro;
			else
				newSolicitud.motivo = permiso.motivo;
			Solicitudes.find({usuario: newSolicitud.usuario, fechaCreada: newSolicitud.fechaCreada}).populate('usuario').exec(function (err, solicitud){
				if(solicitud.length == 0){
					newSolicitud.save(function (err, soli) {
						Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : permiso.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) { 
							if (err) console.log(err);

							var transporter = nodemailer.createTransport();
							for (var i = 0; i < supervisor.length; i++) {

								transporter.sendMail({
									from: emailSIGUCA,
									to: supervisor[i].email,
									subject: 'Nueva solicitud de permiso anticipado en SIGUCA',
									text: " El usuario " + permiso.usuario.nombre + " " + permiso.usuario.apellido1 + " " + permiso.usuario.apellido2 + " ha enviado el siguiente permiso anticipado: " 
									+ "\r\n Día de Inicio: " + soli.diaInicio 
									+ "\r\n Día de termino: " + soli.diaFinal 
									+ "\r\n Motivo: " + soli.motivo
									+ "\r\n Detalle: " + soli.detalle
								});
							}
							return cb();            
					});//supervisores
				});//save
				}
		});//verificar
}

exports.updatePermiso = function(permiso, cb){
	var epochTime = moment().unix();

	var solicitudActualizada = {
		fechaCreada: epochTime,
		diaInicio: permiso.diaInicio,
		diaFinal: permiso.diaFinal,
		cantidadDias: permiso.cantidadDias,
		detalle: permiso.detalle
	};
	if(permiso.motivo == 'otro')
		solicitudActualizada.motivo = permiso.motivoOtro;
	else
		solicitudActualizada.motivo = permiso.motivo;

	Solicitudes.findById(permiso.id).exec(function (err, soli) { 
		Solicitudes.findByIdAndUpdate(permiso.id, solicitudActualizada).populate('usuario').exec(function (err, solicitud) { 
			if(!err) {
				Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : solicitud.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) { 
					if (!err) {
						var transporter = nodemailer.createTransport();
						for (var i = 0; i < supervisor.length; i++) {
							transporter.sendMail({
								from: emailSIGUCA,
								to: supervisor[i].email,
								subject: 'Modificación de una solicitud de permiso anticipado en SIGUCA',
								text: " El usuario " + solicitud.usuario.nombre + " " + solicitud.usuario.apellido1 + " " + solicitud.usuario.apellido2 
								+ " ha modificado el siguiente permiso anticipado: " 
								+ "\r\n Día de Inicio: " + soli.diaInicio 
								+ "\r\n Día de termino: " + soli.diaFinal 
								+ "\r\n Motivo: " + soli.motivo
								+ "\r\n Detalle: " + soli.detalle
								+ "\r\n\r\n A continuación se muestra el permiso anticipado modificado " 
								+ "\r\n Día de Inicio: " + solicitudActualizada.diaInicio 
								+ "\r\n Día de termino: " + solicitudActualizada.diaFinal 
								+ "\r\n Motivo: " + solicitudActualizada.motivo
								+ "\r\n Detalle: " + solicitudActualizada.detalle
							});
						}
					}
				});
}
return cb();
});
});
}

	/*--------------------------------------------------------------------
		Métodos Solicitudes    
		---------------------------------------------------------------------*/
		exports.loadSoli = function(id, cb){
			Solicitudes.findById(id, function (err, soli) { 
				if(soli.estado == 'Pendiente'){
					Solicitudes.findById(id, function (err, solicitud) { 
						if (err) return cb(err);
						cb(solicitud);
					}); 
				} else cb({motivo:'seleccionar',detalle:''});
			}); 
		}

		exports.deleteSoli = function(id, cb){
			Solicitudes.findByIdAndRemove(id).populate('usuario').exec(function (err, soli) { 
				if (err) return cb(err,'');
				var fecha = "";
				if(soli.fechaCreada)
					fecha = moment(soli.fechaCreada);

				var transporter = nodemailer.createTransport();
				
				if(soli.tipoSolicitudes == 'Extras'){
					transporter.sendMail({
						from: emailSIGUCA,
						to: soli.usuario.email,
						subject: 'Se ha eliminado una solicitud de hora extraordiaria en SIGUCA',
						text: " Estimado(a) " + soli.usuario.nombre + " " + soli.usuario.apellido1 + " " + soli.usuario.apellido2
						+ " \r\n Su supervisor ha eliminado una de las solicitudes de hora extraordiaria presentadas, en la cuál se indicabá lo siguiente: " 
						+ " \r\n Fecha de creación: " + fecha
						+ " \r\n Día Inicio: " + soli.diaInicio
						+ " \r\n Hora Inicio: " + soli.horaInicio
						+ " \r\n Hora Final: " + soli.horaFinal
						+ " \r\n Cantidad de horas: " + soli.cantidadHoras
						+ " \r\n Cliente: " + soli.cliente
						+ " \r\n Motivo: " + soli.motivo
						+ " \r\n Estado: " + soli.estado
						+ " \r\n Comentario supervisor: " + soli.comentarioSupervisor
					});
				} else {
					transporter.sendMail({
						from: emailSIGUCA,
						to: soli.usuario.email,
						subject: 'Se ha eliminado una solicitud de permiso anticipado en SIGUCA',
						text: " Estimado(a) " + soli.usuario.nombre + " " + soli.usuario.apellido1 + " " + soli.usuario.apellido2
						+ " \r\n Su supervisor ha eliminado una de las solicitudes de permiso anticipado presentadas, en la cuál se indicabá lo siguiente: " 
						+ " \r\n Fecha de creación: " + fecha
						+ " \r\n Día Inicio: " + soli.diaInicio
						+ " \r\n Día Final: " + soli.diaFinal
						+ " \r\n Cantidad de días: " + soli.cantidadDias
						+ " \r\n Motivo: " + soli.motivo
						+ " \r\n Detalle: " + soli.detalle
						+ " \r\n Estado: " + soli.estado
						+ " \r\n Comentario supervisor: " + soli.comentarioSupervisor
					});
				}
				return cb(err,'Se elimino');
			});
}

	/*--------------------------------------------------------------------
		Gestionar Eventos
		---------------------------------------------------------------------*/
		exports.gestionarSoli = function(solicitud, cb){
			Solicitudes.findByIdAndUpdate(solicitud.id, 
				{estado: solicitud.estado, comentarioSupervisor: 
					solicitud.comentarioSupervisor}).populate('usuario').exec(function (err, soli) { 
						if (err) return cb(err, '');
						var transporter = nodemailer.createTransport();
				//console.log(soli);
				var a = new Date(soli.fechaCreada * 1000);
				var date = ""+a.getDate()+"/"+a.getMonth()+"/"+a.getFullYear();
				var solitext = "\r\n\r\nFecha de creación:"+date+"\n"
				+ "Motivo:"+soli.motivo+"\n"
				+ "Detalle:"+soli.detalle+"\r\n\r\n";
				transporter.sendMail({
					from: emailSIGUCA,
					to: soli.usuario.email,
					subject: 'Respuesta a solicitud en SIGUCA',
					text: " Estimado(a) " + soli.usuario.nombre 
					+ ",\r\n\r\nPor este medio se le notifica que "
					+"la siguiente solicitud ha sido respondida:"
					+ solitext
					+ "Le informamos que la justificación fue " + solicitud.estado 
					+ " por el supervisor "
					+ ", con el siguiente comentario"
					+ "\r\n\r\n " + solicitud.comentarioSupervisor
					+ "\r\n\r\n Saludos cordiales."
				});
				return cb(err, 'Se elimino');

			});
				}

				exports.gestionarJust = function(justificacion, cb){
					Justificaciones.findByIdAndUpdate(
						justificacion.id, 
						{
							estado: justificacion.estado, 
							comentarioSupervisor: justificacion.comentarioSupervisor
						}
						).populate('usuario').exec(function (err, just) { 
							if (err) return cb(err, '');
							var transporter = nodemailer.createTransport();
							var a = new Date(just.fechaCreada * 1000);
							var date = ""+a.getDate()+"/"+a.getMonth()+"/"+a.getFullYear();

							var justtext = "\r\n\r\nFecha de creación:"+date+"\n"
							+ "Motivo:"+just.motivo+"\n"
							+ "Detalle:"+just.detalle+"\r\n\r\n";

							transporter.sendMail({
								from: emailSIGUCA,
								to: just.usuario.email,
								subject: 'Respuesta a justificación en SIGUCA',
								text: " Estimado(a) " + just.usuario.nombre 
								+ ",\r\n\r\nPor este medio se le notifica que "
								+"la siguiente justificación ha sido respondida:"
								+ justtext
								+ "Le informamos que la justificación fue " + justificacion.estado 
								+ " por el supervisor "
								+ ", con el siguiente comentario"
								+ "\r\n\r\n " + justificacion.comentarioSupervisor
								+ "\r\n\r\n Saludos cordiales."
							});
							return cb(err, 'Se elimino');
						});
}

	/*--------------------------------------------------------------------
		Métodos Horarios
		---------------------------------------------------------------------*/
		exports.addHorario = function(horario, cb) {
			var horarioN = Horario(horario);
			horarioN.save(function (err, horario){
				return cb();
			});
		};

		exports.listHorario = function(cb){
			Horario.find().exec(function (err, horarios) {
				return cb(err, horarios);
			});
		}

		exports.loadHorario = function(id, cb){
			Horario.findById(id, function (err, horarios) {
				return cb(err, horarios);
			})
		}

		exports.updateHorario = function(data, cb){
			Horario.findByIdAndUpdate(data.id, data.horario, function (err, horarios) {
				return cb(err, horarios);
			});
		}

		exports.deleteHorario = function(id, cb){
			Usuario.find({"horario": id, "estado": "Activo"}).exec(function (err, usuario) {
				if(usuario.length === 0){
					Horario.findByIdAndRemove(id, function (err, horarios) {
						return cb(err, 'Se elimino');
					});
				} else{
					return cb(err, 'false');
				}
			});
		}

	function cierre (id) {
		Marca.findById(id).populate('usuario').exec(function (err, marca) {
			if(marca.tipoMarca == 'Entrada'){
				var newCierre =  new Cierre({
					usuario: marca.usuario.id, 
					epoch: marca.epoch, 
					departamento: marca.usuario.departamentos[0].departamento, 
					tipo: 'Personal',
					etapa: 0
				});
				newCierre.save();console.log(newCierre)
			} else {
				Cierre.findOne({usuario: marca.usuario.id, tipo: 'Personal', etapa: 0},function (err, cierre) {
					if(!err && cierre) {
						Horario.findById({_id: marca.usuario.horario}).exec(function (err, horario) {
							Justificaciones.find({usuario: marca.usuario.id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(function (err, just) {
								Solicitudes.find({usuario: marca.usuario.id, fechaCreada: {'$gte': cierre.epoch}}).count().exec(function (err, soli) {
									Cierre.find({usuario: marca.usuario.id, tipo: 'Personal', etapa: 1}).sort({_id: -1}).limit(1).exec(function (err, cierreAnterior) {
										if (!err) {		                
											var rangoJornada = horario.rangoJornada,
											split = rangoJornada.split(':'),
											sJornada = (parseInt(split[0]) * 3600 + parseInt(split[1]) * 60)*1000,
											estado = 0,
											horasSemanales = 0,
											esLunes =  moment(cierre.epoch); 
											if(sJornada > marca.epoch - cierre.epoch){
												estado += 1;   
									}//if
									if(esLunes.day() != 1){
										horasSemanales += marca.epoch - cierre.epoch;
									}
									var cierrePersonal = {
										marcas : estado,
										solicitudes : soli,
										justificaciones : just,
										estado : estado + just + soli,
										etapa : 1,
										horasSemanales : horasSemanales,
										horasDiarias : marca.epoch - cierre.epoch,
									}
									console.log(cierrePersonal)
									Cierre.findByIdAndUpdate(cierre.id, cierrePersonal, function (err, cierre) {
										Cierre.findOne({departamento: marca.usuario.departamentos[0].departamento, tipo: 'General', etapa: 0},function (err, general) {
											console.log(general);
											if(!err && general){ console.log('Encontro cierre anterior')
												var cierreGeneral = {
													estado: general.estado + estado + general.justificaciones + just + general.solicitudes + soli,
													justificaciones: general.justificaciones + just,
													solicitudes: general.solicitudes + soli,
													marcas: general.marcas + estado,
												}; console.log(cierreGeneral)
												Cierre.findByIdAndUpdate(general.id, cierreGeneral, function (err, cierreGen) {	})
											} else if (!err && !general) {
												var newCierre = Cierre({
													estado: estado + just + soli,
													epoch: marca.epoch,
													departamento: marca.usuario.departamentos[0].departamento,
													justificaciones: just,
													solicitudes: soli,
													marcas: estado,
													tipo: 'General',
													etapa: 0
												});
												newCierre.save(function (err, user) {
													if (err) console.log(err);
													else console.log("éxito al guardar");
						                           			 });//cierre
											} 
										})
});
}
});
});
});
});
				} //else return cb();
			})
}
})
}


/*--------------------------------------------------------------------
	Métodos Departamento
	---------------------------------------------------------------------*/
	exports.addDepa = function(departamento, cb){
		var newDepartamento = Departamento(departamento);
		newDepartamento.save(function() {
			return cb();
		})
	}

	exports.listDepa = function(cb){
		Departamento.find().exec(function (err, departamentos) {
			return cb(err, departamentos);
		});
	}

	exports.loadDepa = function(id, cb){
		Departamento.findById(id, function (err, departamento) {
			if (err) return cb(err);
			else return cb(departamento);
		});
	}

	exports.updateDepa = function(data, cb){
		Departamento.findByIdAndUpdate(data.id, data.departamento, function (err, departamento) {
			return cb();
		});
	}

	exports.deleteDepa = function(id, cb){
		Usuario.find({"departamentos.departamento": id, "estado": "Activo"}).exec(function (err, usuario) {
			if(usuario.length === 0){
				Departamento.findByIdAndRemove(id, function (err, departamento) {
					cb('Se elimino');
				});
			} else{
				cb('false');
			}
		});
	}

/*--------------------------------------------------------------------
	Métodos Pendiente
	---------------------------------------------------------------------*/
	/*exports.addPendiente = function(pendiente, cb){
		var newPendiente = Pendiente(pendiente);
		newPendiente.save(function (err, pendiente) {
			if (err) console.log(err);
			return cb(pendiente);
		})
	}*/