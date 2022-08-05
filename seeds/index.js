
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
    for(let i =0; i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'62e58a9f5aa8099a2d0543b0',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eligendi dolores aperiam sit ab possimus, perspiciatis vero molestias blanditiis, odit odio, debitis mollitia incidunt quis! Facere exercitationem sunt molestiae!",
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dxbvukq5a/image/upload/v1659629749/AllCamp/qs5jr5puojs50febxyj9.jpg',
                  filename: 'AllCamp/qs5jr5puojs50febxyj9',
                },
                {
                  url: 'https://res.cloudinary.com/dxbvukq5a/image/upload/v1659629752/AllCamp/qqza9ctqv1kbxse9gq72.jpg',
                  filename: 'AllCamp/qqza9ctqv1kbxse9gq72',
                },
                {
                  url: 'https://res.cloudinary.com/dxbvukq5a/image/upload/v1659629761/AllCamp/ac9lez9pbpudppwg1crh.jpg',
                  filename: 'AllCamp/ac9lez9pbpudppwg1crh',
                }
              ]
              
        })
        await camp.save();
    }

}
seedDB().then( ()=>{
    mongoose.connection.close();
})