// These are the READ functions from a backend service file I worked on
// I utilized refactored code, with objects and functions, to utilize
'use strict'

const Institution = require('../models/institution')
const mongodb = require('../mongodb')
const conn = mongodb.connection
const ObjectId = mongodb.ObjectId

module.exports = {
    readAll: _readAll,
    readById: _readById
}

var filterDateDeactivated = { "dateDeactivated": null }

var addProfileField = { profile: { $arrayElemAt: ['$profile', 0] } }
var addUserField = { user: { $arrayElemAt: ['$user', 0] } }
var addAddressField = { address: { $arrayElemAt: ['$address', 0] } }

var lookupProfile = {
    from: "profiles",
    localField: "profileId",
    foreignField: "_id",
    as: "profile"
}

var lookupUser = {
    from: "users",
    localField: "profile.userId",
    foreignField: "_id",
    as: "user"
}

var lookupAddress = {
    from: "addresses",
    localField: "addressId",
    foreignField: "_id",
    as: "address"
}

var projectNewArray = {
    profileId: 1,
    profile: {
        id: '$profile._id',
        profileOverrides: {
            name: '$profile.profileOverrides.name',
            imageUrl: '$profile.profileOverrides.imageUrl'
        },
        userId: '$user._id',
        user: {
            id: '$user._id',
            defaultDisplayName: '$user.defaultDisplayName',
            defaultImageUrl: '$user.defaultImageUrl',
        },
    },
    addressId: 1,
    address: {
        id: '$address._id',
        line1: '$address.line1',
        line2: '$address.line2',
        city: '$address.city',
        stateCode: '$address.stateCode',
        postalCode: '$address.postalCode'
    },
    _id: 1,
    name: 1,
    websiteUrl: 1,
    imageUrl: 1,
    description: 1,
    contactPhone: 1,
    contactEmail: 1,
    dateCreated: 1,
    dateModified: 1,
    dateDeactivated: 1,
    isPending: 1
}

function readMapping(model) {
    if (model._id) { model._id = model._id.toString() }
    if (model.profileId) { model.profileId = model.profileId.toString() }
    if (model.profile.id) { model.profile.id = model.profile.id.toString() }
    if (model.profile.userId) { model.profile.userId = model.profile.userId.toString() }
    if (model.profile.user.id) { model.profile.user.id = model.profile.user.id.toString() }
    if (model.addressId) { model.addressId = model.addressId.toString() }
    if (model.address.id) { model.address.id = model.address.id.toString() }
    return model
}

function newDoc(model) {
    let newModel = {
        name: model.name,
        websiteUrl: model.websiteUrl,
        imageUrl: model.imageUrl,
        description: model.description,
        addressId: new ObjectId(model.addressId),
        contactPhone: model.contactPhone,
        contactEmail: model.contactEmail,
        dateModified: new Date()
    }
    return newModel
}

function _readAll() {
    return conn.db().collection('institutions').aggregate([{
            $match: filterDateDeactivated
        }, {
            $lookup: lookupProfile
        }, {
            $addFields: addProfileField
        }, {
            $lookup: lookupUser
        }, {
            $addFields: addUserField
        }, {
            $lookup: lookupAddress
        }, {
            $addFields: addAddressField
        }, {
            $project: projectNewArray
        }]).toArray()
        .then(institutions => {
            institutions.map(readMapping)
            return institutions
        })
}

function _readById(id) {
    return conn.db().collection('institutions').aggregate([{
            $match: { $and: [filterDateDeactivated, { _id: new ObjectId(id) }] }
        }, {
            $lookup: lookupProfile
        }, {
            $addFields: addProfileField
        }, {
            $lookup: lookupUser
        }, {
            $addFields: addUserField
        }, {
            $lookup: lookupAddress
        }, {
            $addFields: addAddressField
        }, {
            $project: projectNewArray
        }]).toArray()
        .then(institution => {
            if (!institution.length) {
                return null
            } else {
                return readMapping(institution[0])
            }
        })
}
