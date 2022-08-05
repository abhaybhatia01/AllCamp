
const mongoose=require('mongoose');
const cities = require('./cities')
const {places,descriptors} = require('./seedHelpers')
const Campground= require('../models/campground');



mongoose.connect('mongodb://localhost:27017/myapp',{
     useNewUrlParser:true,
     //useCreateIndex:true,
     useUnifiedTopology:true
});

mongoose.connection.on("error",console.error.bind(console, "connection error:"));
mongoose.connection.once('open',()=>{
    console.log("database connected");
})
const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i =0; i<300;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'62e58a9f5aa8099a2d0543b0',
            //my user id
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eligendi dolores aperiam sit ab possimus, perspiciatis vero molestias blanditiis, odit odio, debitis mollitia incidunt quis! Facere exercitationem sunt molestiae!",
            price,
            geometry : { 
              type : "Point",
              coordinates: [ 
                cities[random1000].longitude,
                 cities[random1000].latitude
                 ] 
            },
            images: [ 
              {
                 url : "https://res.cloudinary.com/dxbvukq5a/image/upload/v1659695266/AllCamp/oz04pkbfklu8qoecqixd.jpg", 
                 filename : "AllCamp/oz04pkbfklu8qoecqixd"
                }, 
                { 
                  url : "https://res.cloudinary.com/dxbvukq5a/image/upload/v1659695268/AllCamp/mda24keo2mrxszbdkcge.jpg", 
                  filename : "AllCamp/mda24keo2mrxszbdkcge"
                 }, 
                 { 
                  url : "https://res.cloudinary.com/dxbvukq5a/image/upload/v1659695272/AllCamp/vd6lmk5ixwkxeeurksfs.jpg", 
                  "filename" : "AllCamp/vd6lmk5ixwkxeeurksfs" 
                } 
              ],
              
        })
        await camp.save();
    }

}
seedDB().then( ()=>{
    mongoose.connection.close();
})