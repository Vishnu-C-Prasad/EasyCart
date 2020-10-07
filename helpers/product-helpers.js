var db = require('../config/connection');
var collection = require('../config/collection');
const { response } = require('express');
var ObjectID = require('mongodb').ObjectID;

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.ops[0]._id);
        });
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    },
    getProduct: (productID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectID(productID) }).then((product) => {
                resolve(product);
            });
        });
    },
    updateProduct: (productID, productDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
                _id: new ObjectID(productID)
            }, {
                $set: {
                    name: productDetails.name,
                    category: productDetails.category,
                    description: productDetails.description,
                    price: productDetails.price
                }
            }).then((response) => {
                resolve(response);
            });
        });
    },
    deleteProduct: (productID) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: new ObjectID(productID) }).then((response) => {
                resolve(response);
            });
        });
    }
}