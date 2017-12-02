module.exports = function (app, passport) {
    app.get("/", function (req, res) {
        res.render("homepage.hbs");
    });

    app.get("/login", function (req,res){
      res.render("login_registration.hbs");
    });

    app.post("/login", function (req,res){

    });

    app.get("/:userID", (req, res) => {
        const item_list = null;
        res.render("item_list.hbs", {item_list: item_list});
    });

    const user = "owner";
    app.get("/:userID/:itemID", (req, res) => {
        const item = {name: "iPhone X", status: "In-Possession"};
        //pseudo-code
        if (user === "owner") {
            res.render("recover_item.hbs", {item: item, owner: true});
        } else {
            res.render("recover_item.hbs", {item: item, owner: false});
        }

    });

    app.post("/:userID/:itemID", (req, res) => {
        if (Object.keys(req.body).length !== 0) {
            console.log(req.body.textbox);
        }
    });
};
