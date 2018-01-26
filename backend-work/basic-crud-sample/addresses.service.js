const Address = require('../models/address')
const mongodb = require('../mongodb')
const conn = mongodb.connection
const ObjectId = mongodb.ObjectId

module.exports = {
    readAll: _readAll,
    readById: _readById,
    create: _create,
    update: _update,
    deactivate: _deactivate
}

function _readAll() {
    return conn.db().collection('addresses').find({ 'dateDeactivated': null }).toArray() //grabbing only active listings
        .then(addressArray => {
            for (let j = 0; j < addressArray.length; j++) {
                let address = addressArray[j]
                address._id = address._id.toString()
                address.profileId = address.profileId.toString()
            }
            return addressArray
        })
}

function _readById(id) {
    return conn.db().collection('addresses').findOne({ _id: new ObjectId(id), "dateDeactivated": null })
        .then(address => {
            address._id = address._id.toString()
            address.profileId = address.profileId.toString()
            return address
        })
}

function _create(model) {
    let newModel = {
        line1: model.line1,
        line2: model.line2,
        city: model.city,
        stateCode: model.stateCode,
        postalCode: model.postalCode,
        lat: model.lat,
        lng: model.lng,
        dateDeactivated: null,
        dateModified: new Date(),
        dateCreated: new Date(),
        profileId: new ObjectId(model.profileId)
    }
    return conn.db().collection('addresses').insert(newModel)
        .then(result => result.insertedIds[0].toString())
}

function _update(id, doc) {
    let newDoc = {
        line1: doc.line1,
        line2: doc.line2,
        city: doc.city,
        stateCode: doc.stateCode,
        postalCode: doc.postalCode,
        lat: doc.lat,
        lng: doc.lng,
        dateModified: new Date()
    }
    return conn.db().collection('addresses').updateOne( { _id: new ObjectId(id) }, { $set: newDoc } )
        .then(result => Promise.resolve())
}

function _deactivate(id) {
    return conn.db().collection('addresses').updateOne( { _id: new ObjectId(id) }, { $currentDate: { 'dateDeactivated': true, 'dateModified': true } } )
        .then(result => Promise.resolve())
}
