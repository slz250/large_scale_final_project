module.exports = function (app, passport) {
    app.get("/", function (req, res) {
        res.render("homepage.hbs");
    });

    app.get("/:userID", (req, res) => {
        const item_list = null;
        res.render("item_list.hbs", {item_list: item_list});
    });

    app.get("/:userID/:itemID", (req, res) => {
        const item = null;
       res.render("recover_item.hbs", {item: item});
    });
};