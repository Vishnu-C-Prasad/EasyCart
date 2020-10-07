var db = require('../config/connection');
var collection = require('../config/collection');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectID;

module.exports = {
    addSlide: (carouselItems, callback) => {
        db.get().collection(collection.SLIDE_COLLECTION).insertOne(carouselItems).then((data) => {
            callback(data.ops[0]._id);
        });
    },
    getAllSlides: () => {
        return new Promise(async (resolve, reject) => {
            const carouselItems = await db.get().collection(collection.SLIDE_COLLECTION).find().toArray();
            resolve(carouselItems);
        });
    },
    getSlide: (slideId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SLIDE_COLLECTION).findOne({ _id: new ObjectID(slideId) }).then((slide) => {
                resolve(slide);
            });
        });
    },
    updateSlide: (slideId, slideDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SLIDE_COLLECTION).updateOne({
                _id: new ObjectID(slideId)
            }, {
                $set: {
                    class: slideDetails.class,
                    name: slideDetails.name,
                    description: slideDetails.description,
                    price: slideDetails.price
                }
            }).then((response) => {
                resolve(response);
            });
        });
    },
    deleteSlide: (slideId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SLIDE_COLLECTION).removeOne({ _id: new ObjectID(slideId) }).then(async (response) => {
                const slides = await db.get().collection(collection.SLIDE_COLLECTION).find().toArray();
                if (slides[0]) {
                    if (slides[0].class === 'active') {
                        resolve(response);
                    } else {
                        db.get().collection(collection.SLIDE_COLLECTION).updateOne({
                            _id: new ObjectID(slides[0]._id)
                        }, {
                            $set: {
                                class: 'active'
                            }
                        }).then(() => {
                            resolve(response);
                        });
                    }
                } else {
                    resolve(response);
                }
            });
        });
    }
}