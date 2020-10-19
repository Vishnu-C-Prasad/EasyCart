var db = require('../config/connection');
var collection = require('../config/collection');
var bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');

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
        let productObject = {
            item: ObjectID(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            if (userCart) {
                productExist = userCart.products.findIndex(product => product.item == productId);

                if (productExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        user: ObjectID(userId),
                        'products.item': ObjectID(productId)
                    }, {
                        $inc: {
                            'products.$.quantity': 1
                        }
                    }).then((response) => {
                        resolve(response);
                    });
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        user: ObjectID(userId)
                    }, {
                        $push: {
                            products: productObject
                        }
                    }).then((response) => {
                        resolve(response);
                    });
                }
            } else {
                const cartObject = {
                    user: ObjectID(userId),
                    products: [productObject]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObject).then((response) => {
                    resolve(response);
                });
            }
        });
    },
    removeFromCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            productIndex = userCart.products.findIndex(product => product.item == productId);

            db.get().collection(collection.CART_COLLECTION).updateOne({
                user: ObjectID(userId),
                'products.item': ObjectID(productId)
            }, {
                $pull: {
                    products: { item: ObjectID(productId) }
                }
            }).then((response) => {
                resolve(response);
            });
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
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray();
            resolve(cartItems);
        });
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            const cartItems = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            if (cartItems) {
                cartItems.products.forEach((product) => {
                    count += product.quantity
                });
            }
            resolve(count);
        });
    },
    changeProductQuantity: ({ cart, product, count, quantity }) => {
        quantity = parseInt(quantity);
        count = parseInt(count);

        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    _id: ObjectID(cart)
                }, {
                    $pull: {
                        products: { item: ObjectID(product) }
                    }
                }).then((response) => {
                    resolve({ removeProduct: true });
                });
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    _id: ObjectID(cart),
                    'products.item': ObjectID(product)
                }, {
                    $inc: {
                        'products.$.quantity': count
                    }
                }).then((response) => {
                    resolve(response);
                });
            }
        });
    },
    removeFromCart: ({ cart, product }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({
                _id: ObjectID(cart)
            }, {
                $pull: {
                    products: { item: ObjectID(product) }
                }
            }).then((response) => {
                resolve({ removeProduct: true });
            });
        });
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            const totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        user: ObjectID(userId)
                    }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: ['$quantity', '$product.price']
                            }
                        }
                    }
                }
            ]).toArray();
            if(totalAmount[0]) {
                resolve(totalAmount[0].total);
            } else {
                resolve();
            }
        });
    }
}