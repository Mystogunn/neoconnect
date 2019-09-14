const   jwt = require("jsonwebtoken"),
		db = require("../_helpers/db"),
		bcrypt = require("bcrypt"),
        Offer = db.Offre,
    	Shop = db.Shop,
        User = db.Influencer,
        OfferApply = db.OfferApply,
        config = require("../config"),
		jwtUtils = require("../utils/jwt.utils");

module.exports = {
	insert,
	getAll,
	getById,
    getByShop,
	update,
    apply,
	delete: _delete,
    getApplyOffer,
    getApplyUser
};

async function getAll(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    const list = await Offer.findAll();
    return (list);
}

async function getById(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let user = await Offer.findOne({
        where: {id: req.params.id}
    });
    if (user === null)
    	return (undefined);

	return (user);
}

async function getByShop(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let listShop = await Offer.findAll({
        where: {idUser: req.params.id}
    });
    if (listShop === undefined || listShop.length === 0)
        return (undefined);

    return (listShop);
}

async function insert(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
        return (undefined);

    const user = await Offer.create({
        idUser: userId,
		productImg: req.body.productImg,
		productName: req.body.productName,
		productSex: req.body.productSex,
		productDesc: req.body.productDesc,
		productSubject: req.body.productSubject
	});
	return (user.get( { plain: true } ));
}

async function update(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let user = await Shop.findOne({
        where: {id: userId}
    });
    let offer = await Offer.findOne({
        where: {id: req.params.id}
    });
    if (user === null || offer === null || offer['idUser'] !== userId)
        return (undefined);

    Object.keys(req.body).forEach(function (item) {
        offer[item] = req.body[item];
    });

    offer.save().then(() => {});

    return (offer.get( { plain: true } ))
}

async function _delete(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let user = await Shop.findOne({
        where: {id: userId}
    });
    let offer = await Offer.findOne({
        where: {id: req.params.id}
    });
    if (user === null || offer === null || offer['idUser'] !== userId)
        return (undefined);

    await offer.destroy();

    return ("Offer destroy");
}

async function apply(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let user = await User.findOne({
        where: {id: userId}
    });
    let offer = await Offer.findOne({
        where: {id: req.params.id}
    });
    if (user === null || offer === null)
        return (undefined);
    const apply = await OfferApply.create({
       idUser: userId,
       idOffer: req.params.id
    });

    return (offer.get( { plain: true } ));
}

async function getApplyOffer(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let apply = await OfferApply.findAll({
        where: {idOffer: req.params.id}
    });
    if (apply === undefined || apply.length === 0)
        return (undefined);
    return (apply);
}

async function getApplyUser(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let apply = await OfferApply.findAll({
        where: {idUser: req.params.id}
    });
    if (apply === undefined || apply.length === 0)
        return (undefined);
    return (apply);
}