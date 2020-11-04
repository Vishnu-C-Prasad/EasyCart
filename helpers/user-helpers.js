var db = require('../config/connection');
var collection = require('../config/collection');
var bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
var Razorpay = require('razorpay');
const { resolve } = require('path');
var instance = new Razorpay({
    key_id: 'rzp_test_TJAQ6gBYztR2QQ',
    key_secret: 'hbCi42pheI8nY536mv7SX1Sp',
});

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
            if (totalAmount[0]) {
                resolve(totalAmount[0].total);
            } else {
                resolve();
            }
        });
    },
    addToWishList: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            const wishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectID(userId) });
            if (wishList) {
                productExist = wishList.products.findIndex(product => product.item == productId);

                if (productExist != -1) {
                    resolve();
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
                        user: ObjectID(userId)
                    }, {
                        $push: {
                            products: { item: ObjectID(productId) }
                        }
                    }).then((response) => {
                        resolve(response);
                    });
                }
            } else {
                const cartObject = {
                    user: ObjectID(userId),
                    products: [{ item: ObjectID(productId) }]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartObject).then((response) => {
                    resolve(response);
                });
            }
        });
    },
    getWishList: (userId) => {
        return new Promise(async (resolve, reject) => {
            const wishList = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: {
                        user: ObjectID(userId)
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { productList: '$products.item' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$productList']
                                    }
                                }
                            }
                        ],
                        as: 'productDetails'
                    }
                }
            ]).toArray();
            resolve(wishList[0].productDetails);
        });
    },
    removeFromWishList: (userId, { productId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({
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
    addNewAddress: (userId, data) => {
        return new Promise((resolve, reject) => {
            data._id = new ObjectID();
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $push: {
                    addresses: data
                }
            }).then((response) => {
                const user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) });
                resolve(user)
            });
        });
    },
    getAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) });

            const address = user.addresses.filter((address) => {
                return address._id == addressId
            })

            resolve(address[0]);
        });
    },
    getCartItemsList: (userId) => {
        return new Promise(async (resolve, reject) => {
            const cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) });
            resolve(cart.products);
        });
    },
    placeOrder: (userId, address, paymentMethod, products, totalAmount, productCount) => {
        return new Promise((resolve, reject) => {
            let status = {
                pending: false,
                placed: false,
                shipped: false,
                delivered: false,
                cancelled: false
            }

            if (paymentMethod === 'COD') {
                status.placed = true;
            } else {
                status.pending = true;
            }

            let orderObject = {
                userId: ObjectID(userId),
                deliveryAddress: address,
                paymentMethod: paymentMethod,
                products: products,
                productCount: productCount,
                totalAmount: totalAmount,
                status: status,
                date: new Date(),
                placedOn: new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObject).then((response) => {
                db.get().collection(collection.CART_COLLECTION).removeOne({ user: ObjectID(userId) });
                resolve(response.ops[0]._id);
            });
        });
    },
    getOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            const orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectID(orderId) });
            const productDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectID(orderId)
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
            resolve({ orderDetails, productDetails });
        });
    },
    getAllOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            const orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectID(userId)
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { productList: '$products.item' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$productList']
                                    }
                                }
                            }
                        ],
                        as: 'productDetails'
                    }
                }
            ]).sort({ placedOn: -1 }).toArray();
            resolve(orders);
        });
    },
    cancelRequest: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: ObjectID(orderId)
            }, {
                $set: {
                    'status.pending': false,
                    'status.placed': false,
                    'status.shipped': false,
                    'status.delivered': false,
                    'status.cancelled': false,
                    'status.cancelRequest': true,
                    date: new Date()
                }
            }).then((response) => {
                resolve(response);
            });
        });
    },
    generateRazorpay: (orderId, totalAmount) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: totalAmount * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId.toString()
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(order);
                    resolve(order)
                }
            });
        });
    },
    verifyPayment: (paymentDetails) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');

            let hmac = crypto.createHmac('sha256', 'hbCi42pheI8nY536mv7SX1Sp');
            hmac.update(paymentDetails['payment[razorpay_order_id]'] + '|' + paymentDetails['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex');

            if (hmac === paymentDetails['payment[razorpay_signature]']) {
                resolve();
            } else {
                reject();
            }
        });
    },
    changeOrderStatus: (orderId) => {
        console.log("Order" ,orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: ObjectID(orderId)
            }, {
                $set: {
                    'status.pending': false,
                    'status.placed': true,
                    'status.shipped': false,
                    'status.delivered': false,
                    'status.cancelled': false,
                    'status.cancelRequest': false,
                    paymentMethod: 'onlinepayment',
                    date: new Date()
                }
            }).then((response) => {
                resolve(response);
            });
        });
    },
    editPersonalInfo: (data, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $set: data
            }).then(() => {
                const user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) });
                resolve(user);
            });
        });
    },
    changePassword: ({ currentPassword, newPassword, confirmPassword }, password, userId) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(currentPassword, password).then(async (status) => {
                if (status) {
                    if (newPassword === confirmPassword) {
                        newPassword = await bcrypt.hash(newPassword, 10);
                        db.get().collection(collection.USER_COLLECTION).updateOne({
                            _id: ObjectID(userId)
                        }, {
                            $set: {
                                password: newPassword
                            }
                        }).then((response) => {
                            resolve({ status: true, successMessage: 'Password changed successfully' });
                        })
                    } else {
                        resolve({ status: false, errMessage: "Entered password dosen't match" });
                    }
                } else {
                    resolve({ status: false, errMessage: 'Current password is incorrect' });
                }
            });
        });
    },
    deleteAddress: ({ addressId }, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $pull: {
                    addresses: {
                        _id: ObjectID(addressId)
                    }
                }
            }).then(() => {
                const user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) });
                resolve(user);
            });
        });
    },
    editAddress: (address, userId) => {
        address._id = ObjectID(address._id);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $pull: {
                    addresses: {
                        _id: ObjectID(address._id)
                    }
                }
            }).then(() => {
                db.get().collection(collection.USER_COLLECTION).updateOne({
                    _id: ObjectID(userId)
                }, {
                    $push: {
                        addresses: address
                    }
                }).then(() => {
                    const user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) });
                    resolve(user);
                });
            });
        });
    },
    updateProfilePicture: (userId, profilePictureStatus) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $set: {
                    profilePicture: profilePictureStatus
                }
            }).then((response) => {
                const user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) });
                resolve(user);
            });
        });
    },
    searchProduct: ({ searchQuery }) => {
        return new Promise(async (resolve, reject) => {
            searchInName = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                name: {
                    $regex: new RegExp(searchQuery, 'i')
                }
            }).toArray();
            searchInCategory = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                category: {
                    $regex: new RegExp(searchQuery, 'i')
                }
            }).toArray();
            resolve([...searchInName, ...searchInCategory]);
        });
    }
}