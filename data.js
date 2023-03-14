const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

// Connect to the MongoDB database
mongoose
  .connect("mongodb://127.0.0.1:27017/todolitsDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

//create schema
const itemsSchema = {
  name: String,
};

//create model based o previus schema

const Item = mongoose.model("Item", itemsSchema);

//create item doc

const item1 = new Item({
  name: "Welcome to todolist",
});

const item2 = new Item({
  name: "Hit the + button to add new items",
});

const item3 = new Item({
  name: "hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const  listSchema={
name:String,
items:[itemsSchema]
}

const List = mongoose.model("List", listSchema);



/*Item.insertMany(defaultItems)
  //.then(() => console.log("success"))
  //.catch((err) => console.log(err));*/

app.get("/", function (req, res) {
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("success");
            res.redirect("/");
          })
          .catch((err) => console.log(err));
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch((err) => console.log(err));
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName,
  });

  if(listName==="Today")
  {  item.save();
    //in order to show on page redirect it
    res.redirect("/");

  }else{
    List.findOne({NAME: listName}).then((foundList)=>{
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName);

    })
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName =req.body.listName

  if(listName==="Today")
  {

    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("deleted successfully");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{
      _id: checkedItemId
    }}}).then((err,foundList)=>
    {
      if(!err)
      {
        res.redirect("/" + listName);

      }
    })
  }

});


//express router

app.get("/:customListName" , function(req, res)
{
  const customListName=req.params.customListName;
  List.findOne({ name: customListName }).then((foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save().then(() => {
        console.log("New list created.");
        res.redirect("/" + customListName);
      }).catch((err) => {
        console.log("Error while creating new list: ", err);
      });
    } else {
      console.log("List found.");
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  }).catch((err) => {
    console.log("Error while finding list: ", err);
  });
  

})

/*  const list = new List({
    name:customListName,
    items:defaultItems
  })

  list.save();
})*/

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Today", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
