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
    ]
});

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