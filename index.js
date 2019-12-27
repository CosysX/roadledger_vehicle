var paymentModule = require('iota-payment')
var app = require('express')()
var cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();

app.use(cors())

app.get("/", (req, res) => {
    paymentModule.getBalance()
        .then(balance => {
            console.log(balance)
            res.send({
                name: process.env.NAME,
                message: 'hello world!', 
                balance: balance
            });
        })
        .catch(err => {
        console.log(err)
        })
});

var options = {
    websockets: true,
    api: true
    // ...
}

let server = paymentModule.createServer(app, options)


//Create an event handler which is called, when a payment was successfull
var onPaymentSuccess = function (payment) {

    var url = process.env.PROVIDER_URL;
    var headers = {
        "Content-Type": "application/json"
    }
    var data = {
        "name": "akita_lego_robot",
        "description": "Pay for energy"
    }
    fetch(url, { method: 'POST', headers: headers, body: data})
    .then((res) => {
        return res.json()
    })
    .then((json) => {
        console.log(json);
        // Do something with the returned data.
        console.log('payment success!', payment);
        let payoutObject = {
            //required
            address: 'HW99PKRDWBUCCWLEQDONQXW9AXQHZAABYEKWSEFYAUIQWWCLVHAUJEQAZJACAGPZBZSQJIOUXRYYEXWZCXXOAJMZVY', 
            value: 1, 
            //optional
            message: 'Example message',
            tag: 'TRYTETAG',
            //indexes for input addresses, only in special cases required
            // starIndex: 0,
            // endIndex: 1
        }
        paymentModule.payout.send(payoutObject)
        .then(result => {
            console.log("result", result)
        })
        .catch(err => {
            console.log(err)
        })
    });
   

}

paymentModule.on('payoutSent', onPaymentSuccess);

// Start server with iota-payment module on '/custom'
server.listen(5000, function () {
    console.log(`Server started on http://localhost:5000 `)
})

