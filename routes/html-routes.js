module.exports = function (app) {

    // Home Page
    app.get('/', function (req, res) {
        res.json("It works I think")
    })
}