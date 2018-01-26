'use strict'

const Institution = require('../models/institution')
const mongodb = require('../mongodb')
const conn = mongodb.connection
const ObjectId = mongodb.ObjectId

module.exports = {
    readAll: _readAll,
    readByIds: _readByIds,
    readById: _readById,
    create: _create,
    update: _update,
    deactivate: _deactivate
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

function _readByIds(activeLocationsArr) {
    let idArray = []
    for (var i = 0; i < activeLocationsArr.length; i++) {
        let item = activeLocationsArr[i]
        item.institutionId = new ObjectId(item.institutionId)
        idArray.push(item.institutionId)
    }
    let query = { "dateDeactivated": null, _id: { $in: idArray } }
    return conn.db().collection('institutions').find(query).toArray()
        .then(institutions => {
            for (let i = 0; i < institutions.length; i++) {
                let institution = institutions[i]
                institution._id = institution._id.toString()
                institution.profileId = institution.profileId.toString()
                institution.addressId = institution.addressId.toString()
            }
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

function _create(model) {
    let doc = newDoc(model)
    doc.dateCreated = new Date(),
        doc.dateDeactivated = null,
        doc.isPending = model.isPending,
        doc.profileId = new ObjectId(model.profileId)

    return conn.db().collection('institutions').insert(doc)
        .then(result => result.insertedIds[0].toString())
}

function _update(id, doc) {
    let updatedDoc = newDoc(doc)
    return conn.db().collection('institutions').updateOne({ _id: new ObjectId(id) }, { $set: updatedDoc })
        .then(result => Promise.resolve())
}

function _deactivate(id) {
    return conn.db().collection('institutions').updateOne({ _id: new ObjectId(id) }, { $currentDate: { 'dateDeactivated': true, 'dateModified': true } })
        .then(result => Promise.resolve())
}
