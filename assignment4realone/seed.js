const mongoose=require('mongoose');
const Product=require('./models/Product');
require('dotenv').config();

const products=[
    { 
  name: "Chocolate Croissant", 
  price: 4.99, 
  category: "Pastries", 
  rating: 4.5, 
  stock: 30 
},
{ 
  name: "Cappuccino",
  price: 3.99,
  category: "Beverages",
  rating: 4.2,
  stock: 50
},
{
  name: "Blueberry Muffin",
  price: 2.99,
  category: "Pastries",
  rating: 4.0,
  stock: 25
},
{
  name: "Espresso",
    price: 2.49,
    category: "Beverages",
    rating: 4.8,
    stock: 40
},
{name : "banana bread",
    price:3.57,
    category:"pastries",
    rating:4.3,
    stock:20
},
{
    name:"Latte",
    price:4.25,
    category:"Beverages",
    rating:4.6,
    stock:35
},
{
    name:"Cinnamon Roll",
    price:3.75,
    category:"Pastries",
    rating:4.4,
    stock:15
},
{
    name:"Americano",
    price:2.99,
    category:"Beverages",
    rating:4.1,
    stock:45
},
{
    name:"Croissant",
    price:3.50, 
    category:"Pastries",
    rating:4.0,
    stock:20
},
{
    name:"Mocha",
    price:4.75,
    category:"Beverages",   
    rating:4.7,
    stock:30
},
{   
    name:"Apple Danish",
    price:3.25,
    category:"Pastries",
    rating:4.2,
    stock:10    
},
{
    name:"Flat White",
    price:4.00,
    category:"Beverages",
    rating:4.5,
    stock:25
},
{
    name:"Lemon Tart",
    price:3.99,
    category:"Pastries",
    rating:4.3,
    stock:12       

},
{
    name:"Iced Coffee",
    price:3.50,
    category:"Beverages",
    rating:4.0,
    stock:20
},
{
    name:"Chocolate Chip Cookie",
    price:2.50,
    category:"Pastries",
    rating:4.6,
    stock:40
},
{
    name:"Macchiato",
    price:3.75,
    category:"Beverages",
    rating:4.4,
    stock:30    
},
{
    name:"Raspberry Scone",
    price:3.25,
    category:"Pastries",
    rating:4.1,
    stock:18
},
{
    name:"coffee cake",
    price:3.50,
    category:"pastries",
    rating:4.2,
    stock:22
},
{
    name:"Pumpkin Spice Latte",
    price:2.99,
    category:"Beverages",
    rating:4.1,
    stock:45
},
{
    name:"Hot Chocolate",
    price:4.75,
    category:"Beverages",   
    rating:4.7,
    stock:30
},
{
    name:"Apple pie",
    price:3.99,
    category:"Pastries",
    rating:4.3,
    stock:15
}   
]

const seedDB=async()=>{
try{
        await mongoose.connect(process.env.MONGO_URI)
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('DB seeded');
    mongoose.disconnect(); 
}
catch(err){
    console.log(err.message);
}
}
seedDB();