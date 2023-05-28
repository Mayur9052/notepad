const express = require("express");
const app = express();
const mysql = require("mysql");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const port = 9088
const path = require("path");

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'main_notepad'
})

app.use(express.static("public"));
app.use("/css", express.static(path.resolve(__dirname + "public/css")));
app.use("/image", express.static(__dirname + "public/image"))

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/Home", (req, res) => {
    let h1 = "select * from categories";
    connection.query(h1, (err, dis) => {
        if (err) throw err;
        res.render("Home", { cat_details: dis })
    });
})

app.get("/Details", (req, res) => {
    let h1 = "select * from note order by name asc";
    let h2 = "select * from categories";

    connection.query(h1, (err, result) => {
        connection.query(h2, (err, result1) => {
            if (err) throw err;
            res.render("Details", { details: result, cat_details_main: result1 })
        })
    });
})

// Home page Insert operation

app.post("/Home", (req, res) => {
    var name = req.body.name;
    var description = req.body.description;
    var cat_events = req.body.cat_events;
    let d = new Date();
    var date = d.toLocaleDateString();
    var time = d.toLocaleTimeString();
    var main_date_time = date + "--" + time;

    let h1 = "Insert into note(name, categories, description, Date) values (?, ?, ?, ?)";

    connection.query(h1, [name, cat_events, description, main_date_time], (err, result) => {
        if (err) throw err;
        res.redirect("/Details");
    })
})

// All Details 

app.post("/Details", (req, res) => {
    var add_cat = req.body.add_cat;
    let h2 = "Insert into categories(cat_name) values (?)";

    connection.query(h2, [add_cat], (err, dis) => {
        if (err) throw err;
        res.redirect("/Details");
    })
})

app.post("/Details/:id", (req, res) => {
    let id = req.params.id;
    let d = new Date();
    var date = d.toLocaleDateString();
    var time = d.toLocaleTimeString();
    var main_date_time = date + "--" + time;
    let h1 = "Insert into checked_note(name, categories, description, Date) select name, categories, description, date from note where id = ?";
    let h2 = "Delete from note where id = ?"
    connection.query(h1, id, (err, result) => {
        if (err) throw err;
        connection.query(h2, id, (err, result1) => {
            if (err) throw err;
            console.log(result1);
        })
        res.redirect("/Details")
    })
})

// categories divided Details 

app.get("/Cat_Details", (req, res) => {
    res.render("Cat_Details");
})

app.get("/Cat_Details/:categories", (req, res) => {
    let categories = req.params.categories;
    let h1 = "select * from note where categories = ? order by name asc";
    let h2 = "select * from categories";

    connection.query(h1, categories, (err, result) => {
        connection.query(h2, categories, (err, result1) => {
            if (err) throw err;
            res.render("Cat_Details", { demo_cat: result, cat_demo_details:result1})
        })
    })
})

app.get("/Edit_Details/:id", (req, res) => {
    let id = req.params.id;
    let h1 = "select * from note where id = ?";
    let h2 = "select * from categories";

    connection.query(h1, id, (err, result) => {
        connection.query(h2, id, (err, result1) => {
            if (err) throw err;
            res.render("Edit_Details", { edit_details_note: result, cat_details: result1 });
        })
    })
})

app.post("/Edit_Details/:id", (req, res) => {
    let id = req.params.id;
    let { name, description } = req.body;
    let h1 = "Update note set name = ?, description = ? ,Date = ? where id = ?";

    let d = new Date();
    var date = d.toLocaleDateString();
    var time = d.toLocaleTimeString();
    var main_date_time = date + "--" + time;

    connection.query(h1, [name, description, main_date_time, id], (err, result) => {
        if (err) throw err;
        res.redirect("/Details");
    })
})

// checked details

app.get("/checked", (req, res) => {
    let h1 = "select * from checked_note";
    connection.query(h1, (err, result) => {
        if (err) throw err;
        res.render("checked", { checked_details: result })
    });
})

// Unchecked details 

app.post("/checked/:id", (req, res) => {
    let id = req.params.id;
    let h1 = "Insert into note(name, categories, description, Date) select name, categories, description, date from checked_note where id = ?";
    let h2 = "Delete from checked_note where id = ?"
    connection.query(h1, id, (err, result) => {
        if (err) throw err;
        connection.query(h2, id, (err, result1) => {
            if (err) throw err;
            console.log(result1);
        })
        res.redirect("/checked");
    })
})

app.listen(port, (err) => {
    if (err) throw err;
    console.log("listening on port " + port);
})
