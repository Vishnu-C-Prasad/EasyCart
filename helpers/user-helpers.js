var db = require('../config/connection');
var collection = require('../config/collection');
var bcrypt = require('bcrypt');
const {ObjectID} = require('mongodb');

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0]);
            })
        });
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('Login success');
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log('Login Failed');
                        resolve({ status: false });
                    }
                });
            } else {
                console.log('Cannot find user');
                resolve({ status: false });
            }
        });
    },
    addToCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            if (userCart) {
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    user: ObjectID(userId)
                }, {
                    $push: {
                        products: ObjectID(productId)
                    }
                }).then((response) => {
                    resolve(response);
                });
            } else {
                const cartObject = {
                    user: ObjectID(userId),
                    products: [ObjectID(productId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObject).then((response) => {
                    resolve(response);
                });
            }
        });
    },
    getCartItems: (userId) => {
        return new Promise(async (resolve, reject) => {
            const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        user: ObjectID(userId)
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { productList: '$products' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$productList']
                                    }
                                }
                            }
                        ],
                        as: 'cartItems'
                    }
                }
            ]).toArray();
            if (cartItems[0]) {
                resolve(cartItems[0].cartItems);
            } else {
                resolve(cartItems);
            }
        });
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            const cartItems = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            if (cartItems) {
                count = cartItems.products.length
            }
            resolve(count);
        });
    }
}