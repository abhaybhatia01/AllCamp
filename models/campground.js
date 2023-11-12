const mongoose = require('mongoose');
const Review = require('./review')
const User = require('./user')

const ImageSchema = new mongoose.Schema({
    url:String,
    filename:String,
})

ImageSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload','/upload/w_150')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema =new mongoose.Schema({
    title:String,
    images:[ImageSchema],
    price:Number,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    description:String,
    location:String,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId ,
            ref:'Review'
        }
    ],

},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `
    <div class="custom-popup"> 
        <a href="/campgrounds/${this._id}"> 
            <img defer class="img-fluid" src=${this.images[0].url}>
            <strong> ${this.title} </strong>
        </a>
    <p style="font-size:10px; line-height: 0.7rem;">${this.description.substring(0,100)}...</p></div>`
 })

CampgroundSchema.post("findOneAndDelete", async function (doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports= mongoose.model('Campground',CampgroundSchema);