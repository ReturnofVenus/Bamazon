var express = require("express");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 7575;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 7575,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

var http = require('http');

//create a server object:
http.createServer(function (req, res) {
  res.write('Hello World!'); //write a response to the client
  res.end(); //end the response
}).listen(7575); //the server object listens on port 8080

function start(){
    inquirer.prompt([{
      type: "list",
      name: "doThing",
      message: "What would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product","End Session"]
    }]).then(function(ans){
       switch(ans.doThing){
        case "View Products for Sale": viewProducts();
        break;
        case "View Low Inventory": viewLowInventory();
        break;
        case "Add to Inventory": addToInventory();
        break;
        case "Add New Product": addNewProduct();
        break;
        case "End Session": console.log('Bye!');
      }
    });
  }
  
  //views all inventory
  function viewProducts(){
    console.log('>>>>>>Viewing Products<<<<<<');
  
    connection.query('SELECT * FROM Products', function(err, res){
    if(err) throw err;
    console.log('----------------------------------------------------------------------------------------------------')
  
    for(var i = 0; i<res.length;i++){
      console.log("ID: " + res[i].ItemID + " | " + "Product: " + res[i].ProductName + " | " + "Department: " + res[i].DepartmentName + " | " + "Price: " + res[i].Price + " | " + "QTY: " + res[i].StockQuantity);
      console.log('--------------------------------------------------------------------------------------------------')
    }
  
    start();
    });
  }
  
  //views inventory lower than 5
  function viewLowInventory(){
    console.log('>>>>>>Viewing Low Inventory<<<<<<');
  
    connection.query('SELECT * FROM Products', function(err, res){
    if(err) throw err;
    console.log('----------------------------------------------------------------------------------------------------')
  
    for(var i = 0; i<res.length;i++){
      if(res[i].StockQuantity <= 5){
      console.log("ID: " + res[i].ItemID + " | " + "Product: " + res[i].ProductName + " | " + "Department: " + res[i].DepartmentName + " | " + "Price: " + res[i].Price + " | " + "QTY: " + res[i].StockQuantity);
      console.log('--------------------------------------------------------------------------------------------------');
      }
    }
  
    start();
    });
  }
  
  //displays prompt to add more of an item to the store and asks how much
  function addToInventory(){
    console.log('>>>>>>Adding to Inventory<<<<<<');
  
    connection.query('SELECT * FROM Products', function(err, res){
    if(err) throw err;
    var itemArray = [];
    //pushes each item into an itemArray
    for(var i=0; i<res.length; i++){
      itemArray.push(res[i].ProductName);
    }
  
    inquirer.prompt([{
      type: "list",
      name: "product",
      choices: itemArray,
      message: "Which item would you like to add inventory?"
    }, {
      type: "input",
      name: "qty",
      message: "How much would you like to add?",
      validate: function(value){
        if(isNaN(value) === false){return true;}
        else{return false;}
      }
      }]).then(function(ans){
        var currentQty;
        for(var i=0; i<res.length; i++){
          if(res[i].ProductName === ans.product){
            currentQty = res[i].StockQuantity;
          }
        }
        connection.query('UPDATE Products SET ? WHERE ?', [
          {StockQuantity: currentQty + parseInt(ans.qty)},
          {ProductName: ans.product}
          ], function(err, res){
            if(err) throw err;
            console.log('The quantity was updated.');
            start();
          });
        })
    });
  }
  
  //allows manager to add a completely new product to store
  function addNewProduct(){
    console.log('>>>>>>Adding New Product<<<<<<');
    var deptNames = [];
  
    //grab name of departments
    connection.query('SELECT * FROM Departments', function(err, res){
      if(err) throw err;
      for(var i = 0; i<res.length; i++){
        deptNames.push(res[i].DepartmentName);
      }
    })
  
    inquirer.prompt([{
      type: "input",
      name: "product",
      message: "Product: ",
      validate: function(value){
        if(value){return true;}
        else{return false;}
      }
    }, {
      type: "list",
      name: "department",
      message: "Department: ",
      choices: deptNames
    }, {
      type: "input",
      name: "price",
      message: "Price: ",
      validate: function(value){
        if(isNaN(value) === false){return true;}
        else{return false;}
      }
    }, {
      type: "input",
      name: "quantity",
      message: "Quantity: ",
      validate: function(value){
        if(isNaN(value) == false){return true;}
        else{return false;}
      }
    }]).then(function(ans){
      connection.query('INSERT INTO Products SET ?',{
        ProductName: ans.product,
        DepartmentName: ans.department,
        Price: ans.price,
        StockQuantity: ans.quantity
      }, function(err, res){
        if(err) throw err;
        console.log('Another item was added to the store.');
      })
      start();
    });
  }
  
  start();