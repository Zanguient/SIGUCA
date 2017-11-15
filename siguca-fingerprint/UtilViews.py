#!/usr/bin/env python 
# -*- coding: utf-8 -*- 

#Importaciones
from Tkinter import *
from UtilImg import UtilImg
from UtilFingerprint import UtilFingerprint
from UtilBD import UtilBD
import time
import urllib
import socket

#Clase dedicada a administrar las distintas vistas del sistema
class UtilViews:
    
    server_ip="10.42.22.175"
    app_port="3000"

    '''
        Se inicializan metodos generales para administrar las vistas
    '''

    def __init__(self):
        self.instUtilFingerprint = UtilFingerprint()
        self.instUtilBD = UtilBD()
        self.initRoot()

    #Inicializa las propiedades generales
    def initRoot(self):
        self.root = Tk()
        self.root.attributes("-fullscreen", True)
#        self.root.config(background = "black", cursor="none", width=300, height=300)
        self.root.config(background = "black", width=300, height=300)

    #Inicializa un nuevo frae
    def initFrame(self):
        self.frame = Frame(self.root, background = "black", width=900, height=500)
        self.frame.place(x=0,y=0)
 
    
    '''
        Acciones de los botones
    '''
    #Ingresa al sistema para realizar marcas o a la parte administrativa
    def ingresar(self, action):
        if action == "admin":
            self.frame.destroy()
            self.viewSession()
        else:
            #Obtiene una huella
            self.frame.destroy()
            self.viewGetFingerprint()

    #Escucha fingerprint para marcar
    def accionBuscaFinger(self):
        result = self.instUtilFingerprint.search()
        self.frame.destroy()
        if result == -1:
            self.viewMessage("No matches found.", "red")
            self.viewPrincipal()
        else:
            #Valida con BD
            self.user = self.instUtilBD.findCodUser(result)
            if self.user != None:
                self.viewMessage("welcome " + self.user["nombre"] + " " + self.user["apellido1"], "light green") 

                #Cambia idioma a ingles
                tipoTem = self.user["tipo"]
                listTipo = list()
                for x in range(0,len(tipoTem)):
                    if tipoTem[x] == "Empleado":
                        listTipo.append("Employee")
                    elif tipoTem[x]  == "Administrador":
                        listTipo.append("Administrator")
                    elif tipoTem[x]   == "Supervisor":
                        listTipo.append("Supervisor")
                    elif tipoTem[x] == "Profesor":
                        listTipo.append("Teacher")
                    elif tipoTem[x] == "Usuario sin acceso web":
                        listTipo.append("User without web access")

                #Valida si tiene mas de un rol
                if (len(self.user["tipo"]) == 1):
                    self.tipoUsuario = (self.user["tipo"])[0]
                    self.viewMark()
                else:
                    self.viewObtieneTipoUsuario(listTipo)
            else:
                self.viewMessage("No matches found.", "red")
                self.viewPrincipal()

    #Escucha fingerprint para actualizar
    def accionBuscaFingerActualizar(self):
        result = self.instUtilFingerprint.search()
        self.frame.destroy()
        if result >= 0:
            self.viewMessage("ERROR! the fingerprint has been registered before.", "red")
            self.viewAdmin()
        else:
           self.viewSaveFingerprint()
    
    #Compara las huellas, si coinciden actualiza en dispositivo y en la BD
    def accionActualizaHuella(self):
        print "accion actualizar"
        result = self.instUtilFingerprint.save()
        
        if result == "not match":
            self.viewMessage("ERROR! The prints do not match.", "red")
        else:
            #Actualiza en la BD la nueva pos de la huella
            self.instUtilBD.updateCode(self.userTem["_id"], result)
            
            #Si el usuario tenía una huella registrada, se elimina
            if int(self.userTem["codTarjeta"]) != -1:
                self.instUtilFingerprint.delete(int(self.userTem["codTarjeta"]))
            self.viewMessage("Made successfully.", "green")

        self.frame.destroy()
        self.viewAdmin()

    #Obtiene el rol seleccionado en la lista de roles del usuario
    def obtieneTipoSeleccionado(self, listBox):
        listSeleccionado = listBox.curselection()
        tipo = ""
        for tem in listSeleccionado:
            tipo = listBox.get(tem)

        if tipo == "Employee":
            self.tipoUsuario = "Empleado"
        elif tipo == "Administrator":
            self.tipoUsuario = "Administrador"
        elif tipo == "Supervisor":
            self.tipoUsuario = "Supervisor"
        elif tipo == "Teacher":
            self.tipoUsuario = "Profesor"
        elif tipo == "User without web access":
            self.tipoUsuario = "Usuario sin acceso web"

        self.frame.destroy()
        self.viewMark()

    #Realiza la marca seleccionada por el usuario
    def actionMark(self, markAction):
        self.frame.destroy()
        if markAction != "cancel":
            #markAction, self.tipoUsuario, self.user["codTarjeta"]
            self.markAction(markAction, self.tipoUsuario, self.user["codTarjeta"])
        self.viewPrincipal()

    #Realiza la accion del logueo
    def actionSession(self, user, password):
        result = self.instUtilBD.verifySession(user, password)
        
        self.frame.destroy()
        if result == "faildUser":
            self.viewMessage("The user is incorrect.", "orange")
            self.viewSession()
        elif result == "faildPassword":
            self.viewMessage("Password is incorrect.", "orange")
            self.viewSession()
        elif result == "faildPermission":
            self.viewMessage("Access denied... Please contact the system administrator.", "red")
            self.viewSession()
        else:
            self.viewAdmin()

    #Realiza las acciones de la seccion administrativa
    def actionAdmin(self, actionAdmin):
        self.frame.destroy()
        if actionAdmin == "cancel":
            self.viewPrincipal()
        elif actionAdmin == "delete":
            self.listUserTem = self.instUtilBD.listUserFinger()
        elif actionAdmin == "update":
            self.listUserTem = self.instUtilBD.listUser()

        #Se crea array solo con los valores que se desean mostrar
        listNameUser = list()
        for userTem in self.listUserTem:
            listNameUser.append(userTem["nombre"] + " " + userTem["apellido1"])
        self.viewGetUser(listNameUser, actionAdmin)

    #Obtiene el usuario seleccionado
    def getUserSelect(self, listBox, action):
        posSelected = listBox.curselection()
        posUser = posSelected[0] 
        self.userTem = self.listUserTem[posUser]

        self.frame.destroy()
        if action == "delete":
            self.instUtilFingerprint.delete(self.userTem["codTarjeta"])
            self.viewMessage("Made successfully.", "green")
            self.instUtilBD.updateCode(self.userTem["_id"], -1)
            self.viewAdmin()

        elif action ==  "update":
            self.viewGetFingerprintUpdate()    

    #Vuelve al menú principal de la sección adminsitrativa
    def cancelAdmin(self):
        self.frame.destroy()
        self.viewAdmin()
 
    '''
        Funciones logicas
    '''
    #Obtiene ipv4
    def getIpv4(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        s.connect(('<broadcast>', 0))
        return s.getsockname()[0]

    #Realiza la marca
    def markAction(self, markNum, typeUser, cod):
        ip = self.getIpv4()
        f = urllib.urlopen('http://'+self.server_ip+':'+self.app_port+'/rfidReader?pwd1=ooKa6ieC&pwd2=of20obai&codTarjeta='+str(cod)+'&tipoMarca='+str(markNum)+'&tipo='+str(typeUser)+"&ipv4="+ip)
        data = f.read()
        self.viewMessage(data, "light green") 

    '''
       Se construyen las vistas a utilizar
    '''
 
    #---------- Vista principal -----------
    def viewPrincipal(self):
        print "Vista principal"
        #Se inicializa la vistaupdateTimeText(self):   
        self.initFrame()
 
        #Muestra la imagen
        self.photo = UtilImg().getImageURL("siguca.gif",self.frame)
        self.lblImg2 = Label(self.frame,image=self.photo,bd=0).place(x=-150, y=50)

        #Boton para continuar
        btnIngresar = Button(self.frame, text="Start", command=lambda: self.ingresar("mark"), fg="white", activeforeground="#ffffff", activebackground="#00aa00", bg="green",width=17, height=2, bd=2, font="Helveltica 15 bold").place(x=470, y=200)
        
        #Boton para ingresar al modulo administrativo
        btnConf = Button(self.frame, text="Admin login", command=lambda: self.ingresar("admin"), fg="#bbbbbb", activeforeground="white", activebackground="green", bg="#222222",width=14, height=2, bd=1, font="Helveltica 12 bold").place(x=505, y=270)

        self.root.mainloop()#Muestra la ventana

    #------- Vista MostrarMensaje ---------
    def viewMessage(self, message, color):  
        root2 = Tk()
        root2.attributes("-fullscreen", True)
#        root2.config(background = "black", cursor="none", width=300, height=300)
        root2.config(background = "black", width=300, height=300)
        Label(root2, text=message, wraplength=650,  fg = color, bg = "black", font = "Helvetica 20 bold", height=70, width=100).pack()
        root2.after(3000, lambda: root2.destroy())

    #------- Vista Solicitar Fingerprint para marcar ---------
    def viewGetFingerprint(self):
        print "Vista obtiene finger print"
        self.initFrame()

        #Muestra la imagen
        self.photo = UtilImg().getImageURL("dedo.png",self.frame)
        self.lblImg2 = Label(self.frame,image=self.photo,bd=0).place(x=300, y=50)

        lblTitle = Label(self.frame,text="Place your finger on the sensor.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 20 bold").place(x=180,y=400)
        self.root.update()
        self.root.after(0, lambda: self.accionBuscaFinger())

    #------- Vista Solicitar Fingerprint para actualizar ---------
    def viewGetFingerprintUpdate(self):
        print "Vista obtiene finger print para actualizar"
        self.initFrame()

         #Muestra la imagen
        self.photo = UtilImg().getImageURL("dedo.png",self.frame)
        self.lblImg2 = Label(self.frame,image=self.photo,bd=0).place(x=300, y=50)

        lblTitle = Label(self.frame,text="Place your finger on the sensor.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 20 bold").place(x=175,y=400)
        self.root.update()
        self.root.after(0, lambda: self.accionBuscaFingerActualizar())

    # Obtiene una nueva huella, la compara con la anterior,
    # en caso de coincidir la almacena
    def viewSaveFingerprint(self):
        print "Vista, verifica huella y la actualiza"
        self.initFrame()

        #Muestra la imagen
        self.photo = UtilImg().getImageURL("dedo.png",self.frame)
        self.lblImg2 = Label(self.frame,image=self.photo,bd=0).place(x=300, y=50)

        lblTitle = Label(self.frame,text="Put your finger back on the sensor.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 20 bold").place(x=155,y=400)
        self.root.update()
        self.root.after(0, lambda: self.accionActualizaHuella())

    #------- Vista Solicitar Tipo de usuario ---------
    def viewObtieneTipoUsuario(self, listTipo):
        self.initFrame()
        lblTitle = Label(self.frame,text="Select a type of user.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 30 bold").place(x=150,y=2)
        #Muestra los roles del usuario al cual le pertenece el llavin 
        listBox = Listbox(self.frame,bd="1",fg="#888888", bg="#000000", font="Helveltica 30 bold",selectbackground="#999999",selectforeground="#ffffff",height=13,selectborderwidth=1, activestyle=NONE, justify="center")
        listBox.place(x=10,y=100)
        listBox.insert(0,*listTipo)
        listBox.bind("<<ListboxSelect>>", lambda event: self.obtieneTipoSeleccionado(listBox))

    #------- Optiene la marca del usuario ---------
    def viewMark(self): 
        #Se crea el entorno grafico  para realizar las marcas
        self.initFrame()
    
        button = Button(self.frame,text="    Punch in       ", command = lambda: self.actionMark(1),fg="white",activeforeground="white",activebackground="#446644",bg="green",width=30,height=3,bd=2,font="Helveltica 17 bold")
    
        button1 = Button(self.frame,text="   Punch out      ", command =lambda:  self.actionMark(6),fg="white",activeforeground="white",activebackground="#446644",bg="green",width=30,height=3,bd=2,font="Helveltica 17 bold")
    
        button2 = Button(self.frame,text="     Break in     ", command =lambda:  self.actionMark(2),fg="white",activeforeground="white",activebackground="#cac251",bg="orange",width=30,height=3,bd=2,font="Helveltica 17 bold")
        
        button3 = Button(self.frame,text="     Break out    ", command =lambda:  self.actionMark(3),fg="white",activeforeground="white",activebackground="#cac251",bg="orange",width=30,height=3,bd=2,font="Helveltica 17 bold")
        
        button4 = Button(self.frame,text="   Out to lunch   ", command =lambda:  self.actionMark(4),fg="white",activeforeground="white",activebackground="#4444ff",bg="blue",width=30,height=3,bd=2,font="Helveltica 17 bold")
        
        button5 = Button(self.frame,text="   In from lunch  ", command =lambda: self.actionMark(5), fg="white",activeforeground="white",activebackground="#4444ff",bg="blue",width=30,height=3,bd=2,font="Helveltica 17 bold")

        button6 = Button(self.frame,text="Cancel",command=lambda: self.actionMark("cancel"),fg="white",activeforeground="white",activebackground="red",bg="#ff4444",width=65,height=3,bd=2,font="Helveltica 17 bold")
    
        button.grid(row=2,column=1)
        button1.grid(row=2,column=2)
        button2.grid(row=3,column=1)
        button3.grid(row=3,column=2)
        button4.grid(row=4,column=1)
        button5.grid(row=4,column=2)
        button6.grid(row=5,column=1, columnspan=10)

    #------- Vista para para Iniciar sesion ---------
    def viewSession(self):
        self.initFrame()
        lblTitle = Label(self.frame,text="Please enter your credentials.", bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 25 bold").place(x=200,y=2)
        lblFromUser = Label(self.frame,text="User",bd="2", bg= "#000000", fg="#55aa55", font="Helveltica 15 bold").place(x=10,y=70)

        txtUser = Entry(self.frame,fg="#888888", bg="#333333", font="Helveltica 20 bold",selectbackground="#999999",selectforeground="#ffffff",selectborderwidth=1, justify="center")
        txtUser.place(x=10,y=100)

        lblFromUser = Label(self.frame,text="Passwoord",bd="2", bg= "#000000", fg="#55aa55", font="Helveltica 15 bold").place(x=10,y=150)

        txtPassword = Entry(self.frame, show="*", fg="#888888", bg="#333333", font="Helveltica 20 bold",selectborderwidth=1, justify="center")
        txtPassword.place(x=10,y=180)

        buttonAccess = Button(self.frame,text="Enter",command= lambda: self.actionSession(txtUser.get(),txtPassword.get()),fg="white",activeforeground="white",activebackground="#008800",bg="#336633",width=15,height=2,bd=1,font="Helveltica 16 bold").place(x=380,y=100)
    
        buttonCancel = Button(self.frame,text="Cancel",command= lambda: self.actionAdmin("cancel"),fg="white",activeforeground="white",activebackground="#880000",bg="#663333",width=15,height=2,bd=1,font="Helveltica 16 bold").place(x=380,y=170)

    #------- Vista para administrar el fingerprint ---------
    def viewAdmin(self):
        self.initFrame()
        lblTitle = Label(self.frame,text="Please select one of the following actions.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 20 bold").place(x=150,y=50)
        
        #Actualizar huella dactilar
        buttonUpdate = Button(self.frame,text="Update fingerprint",command= lambda: self.actionAdmin("update"),fg="white",activeforeground="white",activebackground="#333333",bg="#444444",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=80,y=100)

        #Eliminar huella dactilar        
        buttonDelete = Button(self.frame,text="Delete fingerprint",command= lambda: self.actionAdmin("delete"),fg="white",activeforeground="white",activebackground="#333333",bg="#444444",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=280,y=100)
        
        #Cancelar        
        buttonCancel = Button(self.frame,text="Exit",command= lambda: self.actionAdmin("cancel"),fg="white",activeforeground="white",activebackground="#880000",bg="#773333",width=15,height=1,bd=1,font="Helveltica 15 bold").place(x=480,y=100)

    #------- Vista Solicitar el usuario a modificar ---------
    def viewGetUser(self, listUser, action):
        self.initFrame()
        
        lblTitle = Label(self.frame,text="Please select an user.",bd="2",bg= "#000000", fg="#55aa55", font="Helveltica 25 bold").place(x=150,y=30)
        
        #Muestra los roles del usuario al cual le pertenece el llavin
        scroll = Scrollbar(self.frame,width=50, bg="orange")
        scroll.place(x=400,y=100)

        listBox = Listbox(self.frame, yscrollcommand=scroll.set, bd="1",fg="#888888", bg="#000000", font="Helveltica 25 bold",selectbackground="#559955",selectforeground="#ffffff",height=8, width=20, selectborderwidth=1, activestyle=NONE)
    
        scroll.config(command=listBox.yview)
        listBox.place(x=10,y=100)
        listBox.insert(0,*listUser)
        listBox.bind("<<ListboxSelect>>", lambda event: self.getUserSelect(listBox, action))

        #Boton para cancelar
        buttonCancel = Button(self.frame,text="Cancel",command= lambda: self.cancelAdmin(),fg="white",activeforeground="white",activebackground="#880000",bg="#773333",width=15,height=2,bd=3,font="Helveltica 17 bold").place(x=500,y=200)
