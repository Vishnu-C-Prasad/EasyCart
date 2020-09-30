var db = require('../config/connection');
var collection = require('../config/collection');
var ObjectID =require('mongodb').ObjectID;

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.ops[0]._id);
        });
    },
    getProduct: () => {
        return new Promise( async (resolve, reject) => {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    },
    updateProduct: (data) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
                _id: new ObjectID(data._id)
            }, {
                $set: {
                    name: data.name,
                    category: data.category,
                    description: data.description,
                    price: data.price
                }
            }).then((data) => {
                resolve(data);
            });
        });
    },
    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new ObjectID(id) }).then(async (data) => {
                    resolve(data);
            });
        });
    }
}