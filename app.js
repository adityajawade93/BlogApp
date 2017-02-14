var express              = require("express"),
    app                  = express(),
    bodyParser           = require("body-parser"),
    methodOverride       = require("method-override"),
    expressSanitizer     = require("express-sanitizer"),
    mongoose             = require("mongoose");
    
//config    
mongoose.connect("mongodb://localhost/restful-blog-app");    
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//defining blogSchema and creating Blog model
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now()}
});

var Blog = mongoose.model("Blog", blogSchema);

//routes

//root Route
app.get("/", function(req, res) {
    res.redirect("/blogs"); 
});

//INDEX - shows all the blogs in the database
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err)
            console.log(err);
        else
            res.render("index", {blogs: blogs});
    })
});

//NEW Route shows us the form for new blog
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//CREATE post route to /blogs where new form submits
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err)
            res.render("new");
        else
            res.redirect("/blogs");
    });
});


//SHOW route shows all info about a particular object
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err)
            res.redirect("/blogs");
        else
            res.render("show", {blog: foundBlog});
    });
});


//EDIT route 
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err)
            res.redirect("/blogs");
        else
            res.render("edit", {blog: foundBlog});
    });
});

//UPDATE route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err)
            res.redirect("/blogs");
        else
            res.redirect("/blogs/" + req.params.id);
    });
});

//DELETE route to delete a blog post
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err)
            res.redirect("/blogs");
        else
            res.redirect("/blogs");
    });
});

//server start
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("blog app is live");
});