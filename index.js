const mysql = require("mysql");
const bodyParser = require('body-parser'); 
const express = require('express');
var session = require("express-session");
const app = express();
app.use(session({
  secret: 'secret'
}));

/* to set view engine  */
app.set('view engine', 'ejs');


/* to serve css file in ejs  */
app.use('/public', express.static('public'));


app.use(bodyParser.urlencoded({ extented: true }));
app.use(bodyParser.json()); 







/* connecting database   */

const conn = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "",
    database: "db_1"
  }
);

// checking that database is connected or not 
conn.connect((error) => {
  if (error) {
    console.warn(error);
  }
  else console.log("connected");
});



/* creating get for main page  */
app.get('/', (request, response) => {

  /* to render it on local host  */
  response.render('main');

});



/* creating post route for admin signup */
app.post("/SignUp", (request, response) => {

  const Name = request.body.Name;
  const Email = request.body.Email;
  const Password = request.body.Password;

  const sql = `INSERT INTO ADMIN (Name,Email,Password) VALUES('${Name}','${Email}','${Password}' )`;
  conn.query(sql, (error, result) => {

    if (error) {
      console.warn(error);
    }
    else {
      response.render('admin_login'); 

    }


  });

});


app.get("/SignUp", (request, response) => {
  response.render('login');

});


/* get route for admin_login */
app.get("/login", (request, response) => {
  response.render('admin_login');

});   

/* to show employee record */
app.get("/show", (request, response) => {

  const sql = `SELECT *FROM Employee`;
  conn.query(sql, (error, res) => {
    if (error) console.warn(error);
    response.render('displayTable', { users: res });

  });


});

/* post route for admin login  */
app.post("/login", (request, response) => {

  const Email = request.body.Email;
  const Password = request.body.Password;
  const sql = `SELECT *FROM ADMIN WHERE Email = '${Email}' AND Password = '${Password}' `;
  conn.query(sql, (error, result) => {
    if (error) console.warn(error);
    else if (result.length > 0) {
      request.session.loggedin = true;
      request.session.email = Email;

      response.render('welcome', { users: result }); // sending response  
    }
    else {
      response.send("<h1> Invalid Credintials </h1>");
      console.log(result.length);
    }

  }
  );

});


/* route for loggedIn admin */

app.get("/welcome", (request, response) => {
  response.render('welcome');

});


/* destroyimng session when clicked on  logout */
app.get("/logout", (request, response) => {
  request.session.destroy((error) => {
    response.redirect("/login");
  });
});

/* route for updateEmployee details  */
app.get("/updateEmployee", (request, response) => {

  // To check weather Admin is loggedin 
  if (request.session.loggedin) {

    const sql = `SELECT *FROM Employee`;
    conn.query(sql, (error, res) => {
      if (error) console.warn(error);
      response.render('updateEmployee', { users: res });

    });
  }

  // if admin is not logged in admin login page is rendered 
  else {
    response.render('admin_login');
  }

});





/* Route to insert data in Employee table   */
app.post("/insertEmployee", (request, response) => {

  const Name = request.body.Name;
  const Email = request.body.Email;
  const Location = request.body.Location;
  const Project = request.body.Project;
  const Skills = request.body.Skills;
  const Phone = request.body.Phone;
  const Manager = request.body.Manager;
  const Band = request.body.Band;
  const sql = `INSERT INTO Employee VALUES('${Name}' , '${Email}','123','${Project}','${Skills}','${Phone}','${Manager}','${Band}','${Location}' )`;
  conn.query(sql, (error, result) => {

    if (error) console.warn(error);
    else response.send("<h2> Inserted sucessfully </h2>");

  });



});

/* route to delete employee details */
app.get("/deleteEmployee", (request, result) => {
  if (request.session.loggedin) {

    const sql = `SELECT *FROM Employee`;
    conn.query(sql, (error, resp) => {
      if (error) console.warn(error);
      else {
        result.render('showEmployee', { users: resp });

      }
    });
  }
}
);


// delete data from employee table
app.get("/delete/:target_", (req, response) => {
  var target_ = req.params.target_;
  console.log(`delete from Employees where Phone= '${target_}'`);
  var sql = `delete from Employee where Phone= ${target_}`;
  conn.query(sql, (err, result) => {
    if (err) console.log(err);
    const sql = `SELECT *FROM Employee`;
    conn.query(sql, (error, res) => {
      if (error) console.warn(error);
      response.render('showEmployee', { users: res });

    });
  });

});


app.post("/update", (request, response) => {
  const Name = request.body.Name;
  const Phone = request.body.Phone;
  const Manager = request.body.Manager;
  const Project = request.body.Project;
  const Band = request.body.Band;
  const sql = `UPDATE Employee SET Manager = '${Manager}' , 
      Project = '${Project}' , 
      Band = ${Band} 
       WHERE Phone = ${Phone} AND Name = '${Name}' `;
  conn.query(sql, (error) => {

    if (error) console.warn(error);
    else {

      conn.query(`SELECT *FROM Employee`, (err, res) => {

        response.render('displayTable', { users: res });
      });

    }

  });
});



/* Employee operations ....     */

// for login page of Employee 
app.get("/employee_login", (request, response) => {
  response.render('employee_login');
});

// route to Logging In of Employee 
app.post("/signUpEmployee", (request, response) => {
  const Email = request.body.Email;
  const Password = request.body.Password;
  const sql = `Select *FROM EMPLOYEE WHERE Email = '${Email}' AND Password = '${Password}' `;
  conn.query(sql, (error, result) => {

    if (error) console.warn(err);

    else if (result.length > 0) {
      request.session.Password = Password ;
      request.session.Email = Email ;
      
      const sql = `SELECT *FROM Employee WHERE Email = '${Email}' AND Password = '${Password}'` ; 
      conn.query(sql , (err , res)=>{
        if(err) console.warn(err) ;
       else response.render("employee_main" , {users:res}) ;
       

      }) ; 
      

    }
    else {
      response.send("<h1> Invalid Credintials </h1>");
      console.log(result.length);
    }

  });
});

/* to change employee password  */

app.get("/changePassword", (request, response) => {
  const Email = request.session.Email; 
  const Password = request.session.Password; ; 
  const sql = `SELECT * FROM Employee WHERE Email = '${Email}' AND Password = '${Password}'` ;
  conn.query(sql , (error , result)=>{
    if(error) console.log(error) ;
    else response.render('changePassword' , {users:result}) ;

  }) ; 
   
});

/* to change the password  */

app.post("/change_employee_password" , (request,response)=>{

  const sql = `Update Employee SET Password = ${request.body.Password}
   Where Email = '${request.session.Email}' AND Password = '${request.session.Password}'`;
   conn.query(sql , (error , result)=>{
     if(error) console.log(error);
     else{
       request.session.destroy((err)=>{
         console.warn(err);
         response.redirect('employee_login') ;

       });
     }

   });


}); 
/* to go on employee dashboard */
app.get("/employee_dashboard", (request, response) => {
  conn.query(`select *from Employee WHERE Email='${request.session.Email}'
  AND Password = '${request.session.Password}'`,(error , result)=>{
    if(error) console.warn(error);
    else response.render('employee_main',{users:result}) ; 

  }) ;
  
});
/* search employee  */
app.get('searchEmployee' , (request,response)=>{


}) ; 
/* logout */

app.get("/employee_logout", (request, response) => {
  request.session.destroy((error) => {
    if(error) console.warn(error) ; 
    response.render('employee_login');
  });
});

/* to see the employee table */
app.get("/searchEmployee", (request, response) => {

    conn.query(`SELECT *FROM EMPLOYEE WHERE Email = '${request.session.Email}'`
    , (error , result)=>
    {
      if(error) console.warn(error);
      else{
        response.render("searchEmployees" , {users:result});
      }  

    });
    
});

/* search employee by Name */
app.post("/search_by_name" , (request,response)=>{
  const Name = request.body.Name ;
  conn.query(`SELECT *FROM Employee WHERE NAME='${Name}'`,
  (error,result)=>{
    if(error) console.log(error) ;
    else{
      response.render('show_employ_side',{users:result}) ; 
    } 
  }) ;  
});

/* search employee by project  */
app.post("/search_by_project" , (request,response)=>{

  const Project = request.body.Project ;
  conn.query(`SELECT *FROM Employee WHERE Project='${Project}'`,
  (error,result)=>{
    if(error) console.log(error) ;
    else{
      response.render('show_employ_side',{users:result}) ; 
    } 

  }) ;   

});

/* search by designation search_by_designation */
app.post("/search_by_designation" , (request,response)=>{
  const Designation = request.body.Designation ;
  conn.query(`SELECT *FROM Employee WHERE Band = '${Designation}'`,
  (error,result)=>{
    if(error) console.log(error) ;
    else{
      response.render('show_employ_side',{users:result}) ; 
    } 
  }) ;   
});

/* search employee by city  */
app.post('/search_by_address' , (request,response)=>{

  const Location = request.body. Location ;
  conn.query(`SELECT *FROM Employee WHERE  Location='${Location}'`,
  (error,result)=>{
    if(error) console.log(error) ;
    else{
      response.render('show_employ_side',{users:result}) ; 
    } 

  }) ;   

});




/* To see the manager details */
app.get('/Manager_details' , (request,response)=>{
  conn.query(`select *from Admin`,(error , result)=>{
    if(error) console.warn(error) ;   
    response.render('Manager_details',{users:result});
  }); 
}); 
/* Edit Employee details */
app.get('/edit_employee_details' , (request,response)=>{ 
    
    conn.query(`SELECT *FROM Employee Where
     Password = '${request.session.Password}' AND 
     Email = '${request.session.Email}'`, (error , result)=>{
       if( error ) console.warn(error) ;
       else{
        response.render('edit_employee_details',{users:result});

       }

     }) ;
   
  
}); 

/* Edit employee skill */
app.post('/updateSkills' , (request,response)=>{

  conn.query(`UPDATE Employee SET Skills = '${request.body.skill}'
  WHERE Email = '${request.session.Email}' AND Password = '${request.session.Password}'` , (error , result)=>{
    if(error) console.warn(error);
    else{
      conn.query(`SELECT *FROM Employee WHERE Email = '${request.session.Email}' AND Password = '${request.session.Password}'`,(error , result)=>{
        response.render('edit_employee_details',{users:result}); 

      }); 
     
    }
  }) ; 

}) ;

/* Edit Employee Phone Number */
app.post('/change_employee_phone' , (request,response)=>{

  conn.query(`UPDATE Employee SET Phone = '${request.body.Phone}'
  WHERE Email = '${request.session.Email}' AND Password = '${request.session.Password}'` , (error , result)=>{
    if(error) console.warn(error);
    else{
      conn.query(`SELECT *FROM Employee WHERE Email = '${request.session.Email}' AND Password = '${request.session.Password}'`,(error , result)=>{
        response.render('edit_employee_details',{users:result}); 

      }); 
     
    }
  }) ; 

}) ;

/* Edit Employee Location  */

app.post('/change_employee_location' , (request,response)=>{

  conn.query(`UPDATE Employee SET Location = '${request.body.Location}'
  WHERE Email = '${request.session.Email}' AND Password = '${request.session.Password}'` , (error , result)=>{
    if(error) console.warn(error);
    else{
      conn.query(`SELECT *FROM Employee WHERE Email = '${request.session.Email}' AND Password = '${request.session.Password}'`,(error , result)=>{
        response.render('edit_employee_details',{users:result}); 

      }); 
     
    }
  }) ; 

}) ;



/* to set port   */
var server = app.listen(3000, () => {
  console.log("go to port 3000")
});