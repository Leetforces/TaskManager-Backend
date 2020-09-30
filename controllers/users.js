// Init code
const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const token_key = process.env.TOKEN_KEY;
const User = require("./../models/users");
const moment = require("moment");
const verifyToken = require("./../middleware/verifyToken");


// Middleware Setup
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//default route
router.all('/',(req,res)=>{
    return res.json({
        status: true,
        message: "User Controller Default Route",
    })
});

// register new user route
router.post('/register', [
    //check empty fields
    check("firstName").not().isEmpty().trim().escape(),// escape changes special symbol in html ententies
    check("lastName").not().isEmpty().trim().escape(),
    check("password").not().isEmpty().trim().escape(),

    //check email
    check("email").isEmail().normalizeEmail(),  // normalizeEmail is used in data sanitisation in expres-validator

], (req, res) => {

    // check form data validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({
            status: false,
            message: "Form Data Validation Error.",
            error: errors.array(),
        });

    }

    // user password hahing
    const hashPassword = bcrypt.hashSync(req.body.password, 10);

    // save user data into mongodb database
    const temp = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashPassword
    });
    temp.save((error, result) => {
        // check error
        if (error) {
            return res.json({
                status: false,
                message: "User Register Failed",
                error: error,
            });
        }

        //OK
        return res.json({
            status: true,
            message: "User Register Success..",
            result: Result,
        });
    });
});

// login user route
router.post("/login", [
    //check empty fields
    check("password").not().isEmpty().trim().escape(),

    //check email
    check("email").isEmail().normalizeEmail(),  // normalizeEmail
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({
            status: false,
            message: "Form Data Validation Error.",
            error: errors.array(),
        });

    }

    User.findOne({ email: req.body.email }, (error, result) => {
        // check db error
        if (error) {
            return res.json({
                status: false,
                message: "Db Read fail.",
                error: error,
            })
        }
        //check result is empty
        if (!result) {
            return res.json({
                status: false,
                message: "User don\'t exits.",
            });

        }
        // user password match
        const isPasswordMatch = bcrypt.compareSync(req.body.password, result.password);
        if (!isPasswordMatch) {
            return res.json({
                status: false,
                message: "Password not match."
            });
        }

        //generate json web token
        const token = jwt.sign({
            id: result._id,
            email: result.email
        }, token_key, {
            expiresIn: 3600
        });

        //final data input
        return res.json({
            status: true,
            message: "User exits.",
            token: token,
            result: result
        });

    });
});

// verify token route
router.post('/verifyToken', (req, res) => {
    // read token from HTTP header
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.json({
            status: false,
            message: 'Token not provided'
        });
    }

    //token verify
    jwt.verify(token, token_key, (error, decoded) => {
        // check error
        if (error) {
            return res.json({
                status: false,
                message: "Fail to verify token.",
            });
        }

        //OK
        // return res.json({
        //     status: true,
        //     message: "Token Verified.",
        //     result: decoded
        // });

        // check user id in database
        User.findById(decoded.id, {
            password: 0, createdAt: 0, updatedAt: 0
        }, (error, result) => {
            // check error
            if (error) {
                return res.json({
                    status: false,
                    message: "Fail to read user data in database ",
                    error: error
                });
            }
            // check result is empty
            if (!result) {
                return res.json({
                    status: false,
                    message: "User don\'t exists. Invalid ID",
                });
            }

            // output the final result
            return res.json({
                status: true,
                message: "Token Valid.",
                result: result
            })
        })
    });
});


// UPDATA USER ROUTE

router.put("/update", verifyToken, [
    //check empty fields
    check("firstName").not().isEmpty().trim().escape(),// escape changes special symbol in html ententies
    check("lastName").not().isEmpty().trim().escape(),
    //check email
    check("email").isEmail().normalizeEmail(),  // normalizeEmail is used in data sanitisation in expres-validat
], (req, res) => {
    // check form data validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({
            status: false,
            message: "Form Data Validation Error.",
            error: errors.array(),
        });

    }

    // update 
    User.findOneAndUpdate({ email: req.body.email }, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        updatedAt: moment().format('DD/MM/YYYY') + ';' + moment().format('hh/mm/ss'),
    }, (error, result) => {
        if (error) {
            return res.json({
                status: false,
                message: "Fail to update user data.",
                error: error
            });
        }

        // OK
        return res.json({
            status: true,
            message: "User updated successfully.",
            result: result
        });

    });

});

// change password route
router.put("/changePassword", verifyToken, [
    //check empty fields

    check("oldPassword").not().isEmpty().trim().escape(),
    check("newPassword").not().isEmpty().trim().escape(),


], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({
            status: false,
            message: "form data validation error.",
            error: errors.array(),
        });
    }

    // update user password in database
    User.findById(req.userID, (error, result) =>
     {
        if (error) {
            res.json({
                status: false,
                message: "Fail to read user data",
                error: error
            });
        }

        // Ok
        const isPasswordMatch = bcrypt.compareSync(req.body.oldPassword, result.password);
        if (!isPasswordMatch) {
            return res.json({
                status: false,
                message: "Old password not match.",
            });
        }

        // if password match
        const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);
        User.findByIdAndUpdate(req.userID, { password: newPasswordHash }, (error, result) => {
            if (error) {
                return res.json({
                    status: false,
                    message: "Database Update Fail.",
                    error: error
                });
            }

            // password updated
            return res.json({
                status: true,
                message: "user password updated successfully",
                result: result
            });
        });
    });

});



// export router
module.exports = router;