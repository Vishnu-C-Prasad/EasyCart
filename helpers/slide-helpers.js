var db = require('../config/connection');
var collection = require('../config/collection');
var ObjectID = require('mongodb').ObjectID;

module.exports = {
    addSlide: (carouselItems, callback) => {
        db.get().collection(collection.SLIDE_COLLECTION).insertOne(carouselItems).then((data) => {
            callback(data.ops[0]._id);
        });
    },
    getSlide: () => {
        return new Promise(async (resolve, reject) => {
            const carouselItems = await db.get().collection(collection.SLIDE_COLLECTION).find().toArray();
            resolve(carouselItems);
        });
    },
    updateSlide: (data) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.SLIDE_COLLECTION).updateOne({
                _id: new ObjectID(data._id)
            }, {
                $set: {
                    name: data.name,
                    description: data.description,
                    price: data.price
                }
            }).then((data) => {
                resolve(data);
            });
        });
    },
    deleteSlide: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SLIDE_COLLECTION).deleteOne({ _id: new ObjectID(id) }).then(async (data) => {
                const carouselItems = await db.get().collection(collection.SLIDE_COLLECTION).find().toArray();
                if (carouselItems[0]){
                    if (carouselItems[0].class === 'active') {
                        resolve(data);
                    } else {
                        db.get().collection(collection.SLIDE_COLLECTION).updateOne({
                            _id: new ObjectID(carouselItems[0]._id)
                        }, {
                            $set: {
                                class: 'active'
                            }
                        });
                        resolve(data);
                    }
                } else {
                    resolve(data);
                }
            });
        });
    }
}