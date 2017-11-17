//include the required modules
var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var webPush = require('web-push');
const vapidKeys = webPush.generateVAPIDKeys();
var router = express.Router();
var mongojs = require('mongojs');
var aad = require('azure-ad-jwt');
var mongoose = require('mongoose');

//Create an instance of express
var app = express();

var NewLimsModel = require('../models/newlimsModel');
var WishList = require('../models/wishlistModel');
var IssuedBooks = require('../models/issuedModel');
var ReturnedBooks= require('../models/returnedModel');

// var db = mongojs('webtechdevops.centralindia.cloudapp.azure.com:51003/lims', ['usersDB', 'issuedBooksDB', 'returnedBooksDB', 'booksDB', 'rolesAndPermissionDB', 'categoriesDB', 'requestedDB', 'booksToBeReturnedDB']);
var db = mongojs('digitalcoe.southeastasia.cloudapp.azure.com:51000/lims3', ['usersDB', 'issuedBooksDB', 'returnedBooksDB', 'booksDB', 'rolesAndPermissionDB', 'categoriesDB', 'requestedDB', 'booksToBeReturnedDB']);

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    next();
});
app.get('/', function (req, res) {
    res.send("lims test route its meee brooo lims3");
});
app.route('/getdata').get(function (req, res, next) {
    NewLimsModel.find()
        .then(function (doc) {
            res.send(doc);
            // console.log(doc);
        });
});

//it creates the user profile for a new user
app.get('/createProfile/:mid/:name/:email', function (req, res) {
    var mid = req.params.mid;
    var name = req.params.name;
    var email = req.params.email;
    console.log(mid);
    console.log(name);
    console.log(email);
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log("JWT is valid");
            var queryString = '{"mId":"' + mid + '"}';
            var testObject = {
                "mId": mid,
                "name": name,
                "role": "mindtreeMind",
                "emailId": email,
                "contactNo": "",
                "issueDetails": [],
                "interestedGenre": [],
                "requestedBookDetails": [],
                "favoriteAuthors": []
            }
            db.usersDB.find(JSON.parse(queryString), function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept,Authorization");
                if (docs.length === 0) {
                    db.usersDB.insert(testObject, function (err, docs) {
                        console.log(docs);
                    });
                    res.send("Successfully added");
                } else
                    res.send("user already present");
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});

//it fetches the user profile
app.get('/getUserProfile/:mid', function (req, res) {
    var mid = req.params.mid;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log("JWT is valid");
            var queryString = '{"mId":"' + mid + '"}';
            db.usersDB.find(JSON.parse(queryString), function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});

//it updates the user profile
app.get('/updateUserProfile/:mid/:genre', function (req, res) {
    var mid = req.params.mid;
    var myGenre;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // // if (req.headers.authorization != null) {
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log("JWT is valid");
            if (req.params.genre === "BLANK") {
                myGenre = [];
            } else {
                myGenre = req.params.genre
            }
            var queryString = '{"mId":"' + mid + '"}';
            db.usersDB.update(JSON.parse(queryString), { $set: { interestedGenre: myGenre } });
            db.usersDB.find(JSON.parse(queryString), function (err, docs) {
                console.log(docs)
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});
//Adding new books
app.post('/addNewBook', function (req, res) {
    
    console.log("In api.........",req.body);
    var myObj = {
      "isbn": req.body.isbn || null,
      "bookId": [],
      "title": req.body.title || null,
      "authors": req.body.author || null,
      "price": 0,
      "publisher": req.body.publisher || null,
      "yearOfPublication": "",
      "edition": "",
      "available": 0,
      "numberOfCopies": req.body.copies || null,
      "genre": req.body.selectedValue || null,
      "description": "",
      "issueDetails": [],
      "reviews": [],
      "avgRating": 0,
      "likes":0,
      "image":req.body.image
    }
    console.log("MyObj......",myObj);
    var data = new NewLimsModel(myObj);
    data.save();
    res.send("In API Successssssssss");
   
});
app.get('/getAllAdminDetails', function (req, res) {
    // console.log(req.headers.authorization);
    // if (req.headers.authorization != null) {
    console.log(req.headers.authorization);
    //var jwtToken = req.headers.authorization.split(" ");
    // if (req.headers.authorization != null) {
    //aad.verify(jwtToken[1], null, function (err, result) {
      //  if (result) {
        //    console.log("JWT is valid");
            db.probableAdmins.find({},{ "mId": 1, "name": 1 }, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});

//app.get('/getAllAdminDetails', function (req, res) {
    // console.log(req.headers.authorization);
    // if (req.headers.authorization != null) {
    //console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // // if (req.headers.authorization != null) {
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            // console.log("JWT is valid");
            // db.ProbableModel.find({ "role": "admin" }, { "mId": 1, "name": 1 }, function (err, docs) {
            //     res.header("Access-Control-Allow-Origin", "*");
            //     res.header("Access-Control-Allow-Headers", "X-Requested-With");
            //     res.send(docs);
            // });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
//});

//transfer admin access
app.get('/transferAccess/:mid/:adminId', function (req, res) {
    var adminId = req.params.adminId;
    var mid = req.params.mid;
    var queryString1 = '{"mId":"' + mid + '"}';
    var queryString2 = '{"mId":"' + adminId + '"}';
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // // if (req.headers.authorization != null) {
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log("JWT is valid");
            // db.usersDB.find({ "role": "admin" }, { "mId": 1,"name":1 }, function (err, docs) {
            //     res.header("Access-Control-Allow-Origin", "*");
            //     res.header("Access-Control-Allow-Headers", "X-Requested-With");
            //     res.send(docs);
            // });
            db.usersDB.update(JSON.parse(queryString1), { $set: { 'role': 'mindtreeMind' } }, function (err, docs) {
                console.log(docs);
            });
            db.usersDB.update(JSON.parse(queryString2), { $set: { 'role': 'admin' } }, function (err, docs) {
                console.log(docs);
                res.send("success");
            });

    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});

app.get('/requestBook/:mid/:isbn', function (req, res) {

    console.log("In Requset BOOOOOOK")
    var isbn = req.params.isbn;
    var mid = req.params.mid;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // // if (req.headers.authorization != null) {
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString = '{"$and":[{"isbn":"' + isbn + '"},{"available":{"$gte":1}}]}';
            var queryString1 = '{"isbn":"' + isbn + '","mId":"' + mid + '"}';
            var queryString2 = '{"mId":"' + mid + '"}';
            db.usersDB.find(JSON.parse(queryString2), { "issueDetails": 1, "requestedBookDetails": 1 }, function (err, docs) {
                console.log(docs);
                console.log("hii", docs[0].issueDetails.length);
                console.log("yee", docs[0].requestedBookDetails.length);
                if ((docs[0].issueDetails.length + docs[0].requestedBookDetails.length) >= 3) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.send("Max");
                }
                else {
                    db.booksDB.find(JSON.parse(queryString), { isbn: 1, bookId: 1, authors: 1, issueDetails: 1, image: 1, title: 1 }, function (err, docs) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        var array = docs;
                        console.log(array.length);
                        console.log(array);
                        if (array.length != 0) {
                            var r = new Date();
                            var newDueDate = r.getFullYear() + '-' + (r.getMonth() + 1) + '-' + r.getDate();
                            var queryString5 = '{"$and":[{"mId":"' + mid + '"},{"issueDetails.bookId":"' + array[0].bookId[0] + '"}]}';
                            var queryString3 = '{"isbn":"' + isbn + '","title":"' + array[0].title + '","author":"' + array[0].authors + '"}';
                            var queryString4 = '{"isbn":"' + isbn + '","mId":"' + mid + '","image":"' + array[0].image + '","title":"' + array[0].title + '","requestedOn":"' + newDueDate + '"}';
                            console.log(queryString4);
                            res.header("Access-Control-Allow-Origin", "*");
                            res.header("Access-Control-Allow-Headers", "X-Requested-With");
                            var flag = true;
                            var flag1 = true;
                            var m;
                            for (m = 0; m < array[0].issueDetails.length; m++) {
                                if (array[0].issueDetails[m].mId === mid) {
                                    flag = false;
                                    flag1 = false;
                                    res.send("already Issued");
                                    break;

                                }
                            }
                            console.log(flag);
                            if (flag === true) {
                                db.requestedDB.find(JSON.parse(queryString1), function (err, docs) {
                                    if (docs.length != 0) {
                                        flag = false;
                                        res.send("Already Requested");
                                    }


                                    else {
                                        db.requestedDB.insert(JSON.parse(queryString4), function (err, docs) {
                                            console.log("Successfully added to requestedDB dataabase");
                                            console.log(docs);
                                        });
                                        db.usersDB.update(JSON.parse(queryString2), { $addToSet: { requestedBookDetails: JSON.parse(queryString3) } }, function (err, docs) {
                                            console.log("success added to user DB");
                                            res.send("Success");
                                        });

                                    }
                                });
                            }
                        }
                        else
                            res.send("failed");
                    });
                }
            });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });

});

//issue book API
app.get('/issueBook/:mid/:isbn/:issueDate/:dueDate', function (req, res) {
    var isbn = req.params.isbn;
    var mid = req.params.mid;
    var issueDate = req.params.issueDate;
    var dueDate = req.params.dueDate;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString = '{"$and":[{"isbn":"' + isbn + '"},{"available":{"$gte":1}}]}';
            var queryString1 = '{"isbn":"' + isbn + '"}';
            var queryString2 = '{"mId":"' + mid + '"}';
            var queryString7 = '{"$and":[{"mId":"' + mid + '"},{"isbn":"' + isbn + '"}]}';
            var queryString8 = '{"requestedBookDetails.isbn":"' + isbn + '"}';
            console.log(queryString2);

            // db.usersDB.find(JSON.parse(queryString2), { "issueDetails": 1 }, function(err, docs) {
            //     console.log(docs);
            //     if (docs[0].issueDetails.length > 2) {
            //         res.header("Access-Control-Allow-Origin", "*");
            //         res.header("Access-Control-Allow-Headers", "X-Requested-With");
            //         res.send("Max");
            //     }
            //     else
            //     {
            db.booksDB.find(JSON.parse(queryString), { isbn: 1, bookId: 1, issueDetails: 1, image: 1, title: 1 }, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                var array = docs;
                console.log(array.length);
                console.log("array", array);
                // console.log(array[0].bookId[0]);

                if (array.length != 0) {
                    var queryString5 = '{"$and":[{"mId":"' + mid + '"},{"issueDetails.bookId":"' + array[0].bookId[0] + '"}]}';
                    var queryString3 = '{"bookId":"' + array[0].bookId[0] + '","issueDate":"' + issueDate + '","dueDate":"' + dueDate + '"}';
                    var queryString4 = '{"bookId":"' + array[0].bookId[0] + '","mId":"' + mid + '","issueDate":"' + issueDate + '","dueDate":"' + dueDate + '","isRenewable":true,"image":"' + array[0].image + '","title":"' + array[0].title + '","returnRequest":"false","notification":"true"}';
                    console.log(queryString4);
                    // res.header("Access-Control-Allow-Origin", "*");
                    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    // var flag=true;
                    // for(var m=0;m<array[0].issueDetails.length;m++)
                    // {
                    //     if(array[0].issueDetails[m].mId===mid)
                    //     {       flag=false;

                    //              res.send("already Issued");
                    //              break;

                    //     }
                    // }
                    // if(flag===true){
                    var queryString6 = '"bookId":"' + array[0].bookId[0] + '"';
                    console.log("BOOOOOOOk", queryString6);
                    var availableCount;
                    db.booksDB.update(JSON.parse(queryString1), { $addToSet: { issueDetails: JSON.parse(queryString4) } });
                    db.booksDB.update(JSON.parse(queryString1), { $inc: { available: -1 } });
                    db.usersDB.update(JSON.parse(queryString2), { $addToSet: { issueDetails: JSON.parse(queryString3) } }, function (err, docs) {
                        console.log("success added to user DB");
                    });
                    db.issuedBooksDB.insert(JSON.parse(queryString4), function (err, docs) {
                        console.log("Successfully added to issuedDb dataabase");
                        console.log(docs);
                    });
                    db.requestedDB.remove(JSON.parse(queryString7), function (err, docs) {
                        console.log("Successfully removed the current request from requestedDB dataabase");
                    });
                    db.usersDB.update(JSON.parse(queryString2), { $pull: { requestedBookDetails: JSON.parse(queryString1) } }, function (err, docs) {
                        console.log(docs);
                    });
                    db.booksDB.find(JSON.parse(queryString1), { "available": 1 }, function (err, docs) {
                        console.log(" after available" + docs[0].available);
                        availableCount = docs[0].available;
                        if (availableCount == 0) {
                            db.requestedDB.remove(JSON.parse(queryString1), function (err, docs) {
                                console.log("Successfully removed all requests from requestedDB dataabase");
                            });
                            db.usersDB.update(JSON.parse(queryString8), { $pull: { requestedBookDetails: JSON.parse(queryString1) } }, function (err, docs) {
                                console.log("Successfully removed all requests from usersDB  dataabase requestedBookDetails array");
                            });
                        }
                    })
                    //db.booksDB.update(JSON.parse(queryString1), { $pop: { bookId: -1 } })


                    db.booksDB.update(JSON.parse(queryString1), { $pull: { bookId: array[0].bookId[0] } }, function (err, docs) {
                        res.send("success");
                    });
                    // }
                }
                else
                    res.send("failed");
            });
    //     }
    //     // });

    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});


//fetch current available books
app.get('/availableBooks/:isbn', function (req, res) {
    var isbn = req.params.isbn;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString1 = '{"isbn":"' + isbn + '"}';
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            db.booksDB.find(JSON.parse(queryString1), { "available": 1 }, function (err, docs) {
                console.log(" before available" + docs[0].available);
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});

app.get('/returnRequest/:mid/:bookId', function (req, res) {
    var bookId = req.params.bookId;
    var mid = req.params.mid;
    var isbn = bookId.slice(0, 13);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString1 = '{"bookId":"' + bookId + '"}';
            var queryString2 = '{"mId":"' + mid + '"}';
            var queryString3 = '{"$set":{"issueDetails.0.returnRequest":"true"}}';
            var queryString4 = '{"isbn":"' + isbn + '"}';
            var queryString5 = '{"$and":[{"isbn":"' + isbn + '"},{"issueDetails.bookId":"' + bookId + '"}]}';

            // var queryString = '{"bookId":"' + bookId + '","mId":"' + mid + '","returnedOn":"' + newDueDate + '"}';
            db.booksDB.find(JSON.parse(queryString4), { isbn: 1, authors: 1, image: 1, title: 1, issueDetails: 1 }, function (err, docs) {
                var array = docs;
                console.log(array.length);
                console.log(array);
                var issuedDate;
                var dueDate;
                for (var k = 0; k < array[0].issueDetails.length; k++) {
                    if (mid == array[0].issueDetails[k].mId) {
                        issueDate = array[0].issueDetails[k].issueDate;
                        dueDate = array[0].issueDetails[k].dueDate;
                    }
                }
                var queryString6 = '{"bookId":"' + bookId + '","mId":"' + mid + '","authors":"' + array[0].authors + '","image":"' + array[0].image + '","title":"' + array[0].title + '","issuedDate":"' + issueDate + '","dueDate":"' + dueDate + '"}';
                db.booksToBeReturnedDB.insert(JSON.parse(queryString6), function (err, docs) {
                    console.log("Successfully added to the return request database");
                });
            });
            db.booksDB.update(JSON.parse(queryString5), JSON.parse(queryString3), function (err, docs) {
                console.log("success changed the returnRequest flag in users DB");
                res.send("success");
            });
            // db.returnedBooksDB.insert(JSON.parse(queryString), function (err, docs) {
            //     // console.log("Successfully added to the database");
            // });
            // db.usersDB.update(JSON.parse(queryString2), { $pull: { "issueDetails": JSON.parse(queryString1) } }, function (err, docs) {
            //     console.log(docs);
            //     //res.send("Successfully returned");
            // });
            // var queryString3 = '{"isbn":"' + isbn + '"}';
            // db.booksDB.find(JSON.parse(queryString3), { "available": 1 }, function (err, docs) {
            //     console.log(" before available" + docs[0].available);
            // });
            // db.booksDB.update(JSON.parse(queryString3), { $inc: { available: 1 } });
            // db.booksDB.update(JSON.parse(queryString3), { $addToSet: { bookId: bookId } });
            // db.booksDB.find(JSON.parse(queryString3), { "available": 1 }, function (err, docs) {
            //     console.log(" after available" + docs[0].available);
            // });
            // db.booksDB.update(JSON.parse(queryString3), { $pull: { issueDetails: JSON.parse(queryString2) } }, function (err, docs) {
            //     // console.log(docs);
            //     res.send(docs);
            // });

    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});
// Return book API
app.get('/return/:mid/:bookId', function (req, res) {
    var bookId = req.params.bookId;
    var mid = req.params.mid;
    var isbn = bookId.slice(0, 13);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString1 = '{"bookId":"' + bookId + '"}';
            var queryString2 = '{"mId":"' + mid + '"}';
            var d = new Date();
            var newDueDate = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
            var queryString4 = '{"$and":[{"mId":"' + mid + '"},{"bookId":"' + bookId + '"}]}';

            db.issuedBooksDB.remove(JSON.parse(queryString4), function (err, docs) {
                console.log("Successfully remove from issuedBooksDB dataabase");
                console.log(docs);
            });
            db.booksToBeReturnedDB.remove(JSON.parse(queryString4), function (err, docs) {
                console.log("Successfully removed from the return request database");
            });
            var queryString3 = '{"isbn":"' + isbn + '"}';

            db.booksDB.find(JSON.parse(queryString3), { "available": 1, "image": 1, "title": 1 }, function (err, docs) {
                console.log(" before available" + docs[0].available);
                var array = docs;
                var queryString = '{"bookId":"' + bookId + '","mId":"' + mid + '","returnedOn":"' + newDueDate + '","image":"' + array[0].image + '","title":"' + array[0].title + '"}';
                db.returnedBooksDB.insert(JSON.parse(queryString), function (err, docs) {
                    console.log("Successfully added to the returned books database");
                });
            });
            db.usersDB.update(JSON.parse(queryString2), { $pull: { "issueDetails": JSON.parse(queryString1) } }, function (err, docs) {
                console.log(docs);
                //res.send("Successfully returned");
            });
            db.booksDB.update(JSON.parse(queryString3), { $inc: { available: 1 } });
            db.booksDB.update(JSON.parse(queryString3), { $addToSet: { bookId: bookId } });
            db.booksDB.find(JSON.parse(queryString3), { "available": 1 }, function (err, docs) {
                console.log(" after available" + docs[0].available);
            })
            db.booksDB.update(JSON.parse(queryString3), { $pull: { issueDetails: JSON.parse(queryString2) } }, function (err, docs) {
                // console.log(docs);

                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});
// renew book api
app.get('/renewBook/:bookId/:mid', function (req, res) {
    var bookId = req.params.bookId;
    var mid = req.params.mid;
    var isbn = bookId.slice(0, 13);
    // var queryString1 = '{"bookId":"' + bookId + '"}';
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString2 = '{"mId":"' + mid + '"}';

            var queryString1 = '{"$and":[{"mId":"' + mid + '"},{"issueDetails.bookId":"' + bookId + '"}]}';
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");

            db.usersDB.find(JSON.parse(queryString2), { issueDetails: 1 }, function (err, docs) {
                // console.log(bookId);
                // console.log(docs[0].issueDetails.length);
                var i;
                for (i = 0; i < docs[0].issueDetails.length; i++) {
                    var x = docs[0].issueDetails[i].bookId;
                    if (x === bookId) {
                        console.log(docs[0].issueDetails[i].bookId);
                        break;
                    }
                }
                var d = docs[0].issueDetails[i].dueDate;
                console.log(d);
                var v;
                var dueDate = new Date("" + d);
                console.log("hiee" + dueDate);
                // var r = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, dueDate.getDate() + 10);
                // var newDueDate = r.getFullYear() + '-' + r.getMonth() + '-' + r.getDate();
                // console.log(dueDate);
                // console.log(newDueDate);
                    var someDate = new Date(dueDate);
            someDate.setDate(someDate.getDate() + 10); //number  of days to add, e.x. 15 days
            var dateFormated = someDate.toISOString().substr(0, 10);
            var newDueDate = dateFormated.toString();
            console.log(newDueDate);
                // var queryString3 = '{"bookId":"' + array[0].bookId[0] + '","issueDate":"' + issueDate + '","dueDate":"' + dueDate + '"}';
                // var queryString4 = '{"bookId":"' + array[0].bookId[0] + '","mId":"' + mid + '","issueDate":"' + issueDate + '","dueDate":"' + dueDate + '","isRenewable":true}';
                //var queryString3 = '{"$set":{"dueDate":"' + newDueDate + '"}}';
                var queryString3 = '{"$set":{"issueDetails.0.dueDate":"' + newDueDate + '"}}';
                // var queryString5 = '{"issueDetails.bookId":"' + bookId + '"}';
                var queryString5 = '{"$and":[{"issueDetails.bookId":"' + bookId + '"},{"mId":"' + mid + '"}]}';
                var queryString6 = '{"$and":[{"isbn":"' + isbn + '"},{"issueDetails.mId":"' + mid + '"}]}';
                var u;
                var x;
                db.usersDB.update(JSON.parse(queryString5), JSON.parse(queryString3), function (err, docs) {
                    // console.log(docs);
                    // console.log(docs[0].issueDetails[0].dueDate);
                });
                db.usersDB.find(JSON.parse(queryString5), { "issueDetails": 1 }, function (err, docs) {
                    console.log(docs);
                    // console.log(docs[0].issueDetails[0].dueDate);
                });
                var queryStringRenewSet = '{"$set":{"issueDetails.0.isRenewable":false}}';
                db.booksDB.update(JSON.parse(queryString6), JSON.parse(queryStringRenewSet), function (err, docs) {
                    console.log(docs);
                });



                db.booksDB.update(JSON.parse(queryString6), JSON.parse(queryString3), function (err, docs) {
                    console.log("hello");
                    console.log(docs);
                    res.send(newDueDate);
                    //console.log(docs[0].issueDetails[0].dueDate);
                });

                // db.booksDB.findAndModify({
                //     query: JSON.parse(queryString5),
                //     update: JSON.parse(queryString3)
                // }, function(err, docs) {
                //     console.log("hiee");
                //     console.log(docs);
                // });

            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });

});

//api for fetching all issued books history for a particular user required in user page
app.get('/getMyIssuedHistory/:mid/:date', function (req, res) {
    var mid = req.params.mid;
    var date = req.params.date;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString = '{"$and":[{"mId":"' + mid + '"},{"issueDate":"' + date + '"}]}';
            // var queryString = '{"mId":"' + mid + '"}';
            db.issuedBooksDB.find(JSON.parse(queryString), function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                console.log("history......", docs)
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});
//api for fetching all requested books history for all users
app.get('/getAllRequestBooksHistory', function (req, res) {
console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
        // var queryString = '{"$and":[{"mId":"' + mid + '"},{"issueDate":"' + date + '"}]}';
        // var queryString = '{"mId":"' + mid + '"}';
        db.requestedDB.find({}, function (err, docs) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.send(docs);
        });
//     } else {
//         console.log("JWT is invalid: " + err);
//         res.send("403 : ACCESS FORBIDDEN");
//     }
// });
});
//api for removind current requestbooks history for the user
app.get('/declineRequest/:mid/:isbn', function (req, res) {
    var mid = req.params.mid;
    var isbn = req.params.isbn;
    var queryString1 = '{"isbn":"' + isbn + '"}';
    var queryString2 = '{"mId":"' + mid + '"}';
    var queryString7 = '{"$and":[{"mId":"' + mid + '"},{"isbn":"' + isbn + '"}]}';
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
        db.requestedDB.remove(JSON.parse(queryString7), function (err, docs) {
            console.log("Successfully removed the current request from requestedDB dataabase");
        });
        db.usersDB.update(JSON.parse(queryString2), { $pull: { requestedBookDetails: JSON.parse(queryString1) } }, function (err, docs) {
            console.log(docs);
            res.send("success");
        });
//     } else {
//             console.log("JWT is invalid: " + err);
//         res.send("403 : ACCESS FORBIDDEN");
//     }
// });
});
//api for fetching all return requested books history for all users
app.get('/getAllReturnRequestBooksHistory', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
        // var queryString = '{"$and":[{"mId":"' + mid + '"},{"issueDate":"' + date + '"}]}';
        // var queryString = '{"mId":"' + mid + '"}';
        db.booksToBeReturnedDB.find({}, function (err, docs) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.send(docs);
        });
//     } else {
//          console.log("JWT is invalid: " + err);
//         res.send("403 : ACCESS FORBIDDEN");
//     }
// });
});
//api for fetching all to be returned books history of all users
app.get('/getAllToBeReturnedBooksHistory', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
        // var queryString = '{"$and":[{"mId":"' + mid + '"},{"issueDate":"' + date + '"}]}';
        // var queryString = '{"mId":"' + mid + '"}';
        db.booksToBeReturnedDB.find({}, function (err, docs) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.send(docs);
        });
//     } else {
//         console.log("JWT is invalid: " + err);
//         res.send("403 : ACCESS FORBIDDEN");
//     }
// });
});
//api for fetching all issued books history for a particular user required in user page
app.get('/getMyReturnedHistory/:mid/:date', function (req, res) {
    var mid = req.params.mid;
    var date = req.params.date;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString = '{"$and":[{"mId":"' + mid + '"},{"returnedOn":"' + date + '"}]}';
            // var queryString = '{"mId":"' + mid + '"}';
            console.log(queryString);
            db.returnedBooksDB.find(JSON.parse(queryString), function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                console.log(docs);
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});
//api for fetching all issued books history required in admin page
app.get('/getAllIssuedBooksHistory/', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            db.issuedBooksDB.find({}, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});
//api for fetching all returned books history required in admin page
app.get('/getAllReturnedBooksHistory/', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            db.returnedBooksDB.find({}, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});



//Search book API
app.get('/getBook/:type/:text', function (req, res) {
    var text = req.params.text;
    var type = req.params.type;
    console.log(req.headers.authorization);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            //writing query string for search based on pattern
            if (text == 'BLANK') {
                db.booksDB.find({}, function (err, docs) {
                    res.send(docs); //sending the response back to application
                });
            } else {
                var queryString = '{"' + type + '":{"$regex":"' + text + '","$options":"i"}}';
                db.booksDB.find(JSON.parse(queryString), function (err, docs) {
                    res.send(docs); //sending the response back to application
                });
            }

    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});
//Get my issued assets api for mobile
app.get('/getmyMobileAssetBookIds/:mid', function (req, res) {
    var mid = req.params.mid;
    console.log(mid);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log("JWT is valid");
            var data = '{"mId":"' + mid + '"}';
            console.log(data);
            db.usersDB.find(JSON.parse(data), { 'issueDetails.bookId': 1,'requestedBookDetails': 1 }, function (err, docs) {
                console.log("success");
                console.log(docs);
                // console.log(docs[0].issueDetails);
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});
//Get my issued assets api for web
app.get('/getmyWebAssetBookIds/:uId', function (req, res) {
    var mid = req.params.uId;
    console.log(mid);
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var data = '{"mId":"' + mid + '"}';
            db.userDB.find(JSON.parse(data), { 'issueDetails.bookId': 1 }, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                if (docs.length === 0) {
                    res.send(err);
                } else
                    res.send(docs[0].issueDetails);

                // for(var i=0;i<docs[0].issueDetails.length;i++){
                // console.lo   g(docs[0].issueDetails[i].bookId,"\n");
                // }
            });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});

app.get('/getmyAsset/:bId/:mid', function (req, res) {
    var bid = req.params.bId;
    var mid = req.params.mid
    console.log("in myassets");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log("JWT is valid");
            var data = '{"isbn":"' + bid + '"}';
            db.booksDB.find(JSON.parse(data), {}, function (err, docs) {
                console.log("*****************************MY ASSET" + docs);
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});
//Add boonew book API
app.post('/addNewBook', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            db.booksDB.insert(JSON.parse(req.body.test));
            db.booksDB.find(function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                console.log(docs);
            });
            res.end("posted");
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});


//Add new copy API
app.post('/addNewCopy', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            // db.booksDB.insert(JSON.parse(req.body.test));
            var isbn = req.body.isbn;
            var bookId = req.body.bookId;
            var queryString = '{"isbn":"' + isbn + '"}';
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            var queryString1 = '{"$addToSet":{"bookId":"' + bookId + '"}}';
            var queryString2 = '{"$inc":{"numberOfCopies":1}}';
            db.booksDB.update(JSON.parse(queryString), JSON.parse(queryString1), function (err, docs) {
                console.log(docs);
            });
            db.booksDB.update(JSON.parse(queryString), JSON.parse(queryString2), function (err, docs) {
                console.log(docs);
            });
            res.end("posted");
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});



// //give total issued books by user
// app.get('/totalIssuedBooks/:mid', function(req, res) {
// var mid=req.params

// });
/**Web-api*** */
app.get('/getAllBooks', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            db.booksDB.find(function (err, docs) {
                //console.log(docs);
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});
// app.get('/getAllBooks', function (req, res) {
    
//             db.booksDB.find(function (err, docs) {
//                 //console.log(docs);
//                 res.header("Access-Control-Allow-Origin", "*");
//                 res.header("Access-Control-Allow-Headers", "X-Requested-With");
//                 res.send(docs);
//             });
//         });

app.get('/getMyFavGenre/:uId', function (req, res) {
    var mid = req.params.uId;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log("recom" + mid);
            var data = '{"mId":"' + mid + '"}';
            db.usersDB.find(JSON.parse(data), { 'interestedGenre': 1 }, function (err, docs) {
                // for(var i=0;i<docs[0].issueDetails.length;i++){
                // console.log(docs[0].issueDetails[i].bookId,"\n");
                // }
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                console.log("genre" + docs[0].interestedGenre);
                res.send(docs[0].interestedGenre);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});



app.get('/getCategoryWiseBooks/:selectedCategory', function (req, res) {
    var category = req.params.selectedCategory;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            console.log(category);
            var data = '{"genre":"' + category + '"}';
            db.booksDB.find(JSON.parse(data), {}, function (err, docs) {
                console.log("category books" + docs[0]);
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});


app.get('/getMyHistory/:mid', function (req, res) {
    var mid = req.params.mid;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString2 = '{"mId":"' + mid + '"}';
            console.log(mid);
            console.log(queryString2);
            db.usersDB.find(JSON.parse(queryString2), { issueDetails: 1 }, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});


app.get('/rating/:mid/:isbn/:value', function (req, res) {
    console.log("inside app.js");
    var mid = req.params.mid;
    var name;
    var avgRating = 0;
    var arrLength;
    var isbn = req.params.isbn;
    var value = req.params.value;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString1 = '{"isbn":"' + isbn + '"}';
            var queryString3 = '{ "mId": "' + mid + '" }';
            var queryString4 = '{"$addToSet":{"reviews":{"mId":"' + mid + '","name":"' + name + '","rating":"' + value + '"}}}';

            db.usersDB.find(JSON.parse(queryString3), { "name": 1 }, function (err, docs) {

                // console.log(docs);

                name = docs[0].name;
                console.log(name);
            });
            db.booksDB.find(JSON.parse(queryString1), { "reviews": 1 }, function (err, docs) {

                console.log("data", docs);

                arrLength = docs[0].reviews.length;
                console.log(arrLength);
                for (var i = 0; i < arrLength; i++) {
                    console.log(docs[0].reviews[i].rating);
                    avgRating = parseInt(avgRating) + parseInt(docs[0].reviews[i].rating);
                }
                avgRating = parseInt(avgRating) + parseInt(value);
                console.log(avgRating);
                avgRating = avgRating / parseFloat(arrLength + 1);
                console.log(avgRating);
                var queryString6 = '{"$set":{"avgRating":"' + avgRating + '"}}';
                db.booksDB.update(JSON.parse(queryString1), JSON.parse(queryString6), function (err, docs) {
                    //console.log("hii");
                    console.log(docs);
                });

            });
            db.booksDB.update(JSON.parse(queryString1), JSON.parse(queryString4), function (err, docs) {
                //console.log("hii");
                console.log(docs);
            });
            db.booksDB.find(JSON.parse(queryString1), { "avgRating": 1 }, function (err, docs) {
                // if (err) throw err;
                console.log(docs);
                // console.log(docs[0].reviews[0].rating);
                // console.log(docs[0].reviews[1].rating);
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});
//return admin mids
app.get('/getAdminId', function (req, res) {
    console.log("hieee");
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
        // if (result) {
            db.usersDB.find({ "role": "admin" }, { "mId": 1 }, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});



//Search book API
app.get('/getBook/:type/:text', function (req, res) {
    var text = req.params.text;
    var type = req.params.type;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString = '{"' + type + '":{"$regex":"' + text + '","$options":"i"}}';
            db.booksDB.find(JSON.parse(queryString), function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     } else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});
//get all categories
app.get('/getCategories', function (req, res) {
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            db.categoriesDB.find({}, function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs); //sending the response back to application
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }
    // });
});
app.get('/getBookForDetailView/:isbn', function (req, res) {
    var isbn = req.params.isbn;
    console.log("ad");
    console.log(isbn);
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString = '{"isbn":"' + isbn + '"}';
            db.booksDB.find(JSON.parse(queryString), function (err, docs) {
                console.log("Details" + docs[0].title);
                res.header("Access-Control-Allow-Origin", "*");
                11
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(docs);
            });
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});

//like gets added to book and also who liked
app.get('/liked/:mid/:isbn', function (req, res) {
    var mid = req.params.mid;
    var isbn = req.params.isbn;
    console.log(req.headers.authorization);
    // var jwtToken = req.headers.authorization.split(" ");
    // aad.verify(jwtToken[1], null, function (err, result) {
    //     if (result) {
            var queryString = '{"isbn" :"' + isbn + '"}';
            var queryString1 = '{"$set":{"likes":"' + likes + '"}}';
            var likes;
            db.booksDB.find(JSON.parse(queryString), function (err, docs) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                likes = docs.likes;

            });
            likes += 1;
            res.send(likes);
    //     }
    //     else {
    //         console.log("JWT is invalid: " + err);
    //         res.send("403 : ACCESS FORBIDDEN");
    //     }

    // });
});

app.get('/newBooks',function(req,res){
    var d = new Date();
    var newDate=d.setDate(d.getDate() - 1);
    db.booksDB.find({"createdAt" : { $gte : new Date(newDate) }},function (err, docs) {
        //console.log(docs);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send(docs);
    });
})

//>>>>>>>>>  NEW APIS LIMS 3.0 <<<<<<<<<<<<<
app.route('/getrecommendation').get(function (req, res, next) {
    NewLimsModel.find({ numberOfCopies: { $eq: 3 } }, { bookId: 1 })
        .then(function (doc) {
            res.send(doc);
            // console.log(doc);
        });
});

app.route('/addtowishlist/:mid/:isbn').get(function (req, res, next) {

    var isbn = req.params.isbn;
    //console.log(isbn);
    var book = [];
    var length;
    WishList.find({ mId: { $eq: req.params.mid } })
        .then(function (doc) {
            //console.log(doc[0].wishList.length);
            book = doc;
            var flag = 0;
            for (var i = 0; i < book[0].wishList.length; i++) {
                console.log('in for', i);
                if (req.params.isbn === book[0].wishList[i]) {
                    console.log('in if');
                    flag = 1;
                }
            }
            if (flag == 0) {
                WishList.findOneAndUpdate({ mId: { $eq: req.params.mid } }, { $push: { wishList: req.params.isbn } }, console.log('------*****'), function (err, result) { });
                res.send(book);
            } else {
                //res.send('Already present');
                res.json('Already present');
                //WishList.update({ mId: { $eq: req.params.mid } }, { $pull: { wishList: req.params.isbn } }, function(err, result) {});
            }
        });
});

app.route('/getisbndetails/:isbn').get(function (req, res, next) {
    NewLimsModel.find({ isbn: { $eq: req.params.isbn } })
        .then(function (doc) {
            res.send(doc);
        });
});

app.route('/removewishlist/:mid/:isbn').get(function (req, res, next) {

    var isbn = req.params.isbn;
    //console.log(isbn);
    var book = [];
    WishList.update({ mId: { $eq: req.params.mid } }, { $pull: { wishList: req.params.isbn } })
        .then(function (doc) {
            res.send(doc);
            // console.log('----->in Remove Wishlist',doc);
        });
});

app.route('/getwishlist/:mid').get(function (req, res, next) {
    WishList.find({ mId: { $eq: req.params.mid } }, { wishList: 1 })
        .then(function (doc) {
            var book = [];
            var i = 0;
            var length = doc[0].wishList.length;
            if (length == 0) {
                res.send(book);
                console.log('in if length', length);
            }
            for (let isbn of doc[0].wishList) {
                console.log('hello', isbn);
                NewLimsModel.find({ isbn: { $eq: isbn } })
                    .then(function (doc) {
                        book[i] = doc;
                        i++;
                        if (i == length) {
                            res.send(book);
                        }
                    });
            }
        });
});

app.route('/recommend/:mId').get(function (req, res, next) {
    ReturnedBooks.find({ mId: { $eq: req.params.mId } })
        .then(function (doc) {
            let l = doc.length;
            NewLimsModel.find({ title: { $eq: doc[l - 1].title } })
                .then(function (doc) {
                    NewLimsModel.find({ genre: { $eq: doc[0].genre } })
                        .then(function (doc) {
                            res.send(doc);
                        });
                });
        });
});

app.route('/getNotifications/:mid').get(function(req, res, next) {
    IssuedBooks.find({ mId: { $eq: req.params.mid } })
        .then(function(doc) {
            res.send(doc);
        });
}); 

app.route('/checkPresence/:isbn').get(function(req, res, next) {
    NewLimsModel.find({ isbn: { $eq: req.params.isbn } })
        .then(function(doc) {
            res.send(doc);
        });
}); 
module.exports = app;



