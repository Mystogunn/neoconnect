const   db = require("../_helpers/db"),
        Shop = db.Shop,
        User = db.Influencer,
        CommentMark = require("../CommentMark/commentMark.service");
        bcrypt = require("bcrypt"),
        jwtUtils = require("../utils/jwt.utils");
        GetImage = require("../UploadImage/uploadImage.service");
        GetAllImage = require("../UploadImage/uploadImage.service");


async function login(params) {
    const user = await Shop.findOne({
        where: {
            pseudo: params.pseudo,
        }
    });
    if (user && bcrypt.compareSync(params.password, user.password)) {
        return {
            "userId" : user.id,
            "userType" : user.userType,
            "token" : jwtUtils.generateTokenForUser(user)
        }
    }
    else
        return (undefined);
}

async function getMyProfile(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
        return (undefined);

    const list = await Shop.findOne({
        where: { id: userId },
        attributes: ['id', 'pseudo', 'userType', 'full_name', 'email', 'phone', 'postal', 'city', 'userDescription', 'theme',
            'society', 'function', 'website']
    });
    list.userPicture = await GetImage.getImage({
        idLink: userId.toString(),
        type: 'User'
    });
    list.dataValues.comment = await CommentMark.getCommentByUserId(userId.toString());
    list.dataValues.mark = await CommentMark.getMarkByUserId(userId.toString());
    return (list);
}

async function getUserProfile(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    const list = await Shop.findOne({
        where: { id: req.params.id },
        attributes: ['id', 'pseudo', 'userType', 'full_name', 'email', 'phone', 'postal', 'city', 'userDescription', 'theme',
            'society', 'function', 'website']
    });
    if (list === null)
        return (undefined);
    list.userPicture = await GetImage.getImage({
        idLink: req.params.id.toString(),
        type: 'User'
    });
    list.dataValues.comment = await CommentMark.getCommentByUserId(req.params.id.toString());
    list.dataValues.mark = await CommentMark.getMarkByUserId(req.params.id.toString());
    return (list);
}

async function modifyUserProfile(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0)
        return (undefined);

    let user = await Shop.findOne({
        where: {id: userId}
    });

    Object.keys(req.body).forEach(function (item) {
        user[item] = req.body[item];
    });
    user['password'] = bcrypt.hashSync(req.body.password, 5);
    user.save().then(() => {});
    return (user.get( { plain: true } ))

}

async function listInf(req) {
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
        return (undefined);

    const list = await User.findAll({
        attributes: ['id', 'pseudo', 'full_name', 'email', 'phone', 'postal', 'city', 'theme',
        'facebook', 'twitter', 'snapchat', 'instagram', 'userDescription']
    });
    let newList = await GetImage.regroupImageData(list, 'User');
    return (newList);
}

module.exports = {
    login,
    getMyProfile,
    getUserProfile,
    modifyUserProfile,
    listInf
};