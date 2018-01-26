// I was requested to populate the homepage channel by profile-type

'use strict'

const responses = require('../models/responses')
const profileService = require('../services/profiles.service')
const locationsService = require('../services/locations.service')
const institutionsService = require('../services/institutions.service')
const apiPrefix = '/api/messages'

module.exports = { readMyChannels: _readMyChannels }

function _readMyChannels(req, res) {
    const responseModel = new responses.ItemResponse()
    responseModel.item = []

    if (req.auth.profileType == 'super-admin') {
        res.json(responseModel)
    } else if (req.auth.profileType == 'mentor') {
        profileService.readById(req.auth.profileId)
            .then(profile => {
                const clientId = responseModel.item.clientId
                responseModel.item.push({ clientId: profile.menteeId })
                res.json(responseModel)
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
    } else if (req.auth.profileType == 'institution-admin') {
        let institutionObj = {}

        profileService.readById(req.auth.profileId)
            .then(profile => {
                return institutionsService.readById(profile.institutionId)
            })
            .then(institution => {
                let currentInstitutionId = institution._id

                institutionObj.name = institution.name
                institutionObj.institutionId = currentInstitutionId

                return locationsService.readByInstitutionId(currentInstitutionId)
            })
            .then(locations => {
                for (var j = 0; j < locations.length; j++) {
                    let locationObj = {}
                    locationObj.name = locations[j].name
                    locationObj.institutionId = locations[j].institutionId
                    locationObj.locationId = locations[j]._id
                    responseModel.item.push(locationObj)
                }
                responseModel.item.unshift(institutionObj)
                res.json(responseModel)
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
    } else if (req.auth.profileType == 'location-admin') {
        let institutionObj = {}

        profileService.readById(req.auth.profileId)
            .then(profile => {
                return locationsService.readById(profile.locationId)
            })
            .then(location => {
                location = location[0]
                let locationObj = {}
                locationObj.name = location.name
                locationObj.locationId = location._id
                responseModel.item.push(locationObj)
                return institutionsService.readById(location.institutionId)
            })
            .then(institution => {
                let currentInstitutionId = institution._id
                institutionObj.name = institution.name
                institutionObj.institutionId = currentInstitutionId

                responseModel.item.unshift(institutionObj)
                res.json(responseModel)
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
    } else if (req.auth.profileType == 'client') {
        let clientObj = {}
        let activeLocationsArr = []

        profileService.readById(req.auth.profileId)
            .then(profile => {
                clientObj.clientId = profile._id
                return locationsService.readByLiveClientId(profile._id)
            })
            .then(locations => {
                for (var j = 0; j < locations.length; j++) {
                    let activeLocationsObj = {}
                    activeLocationsObj.name = locations[j].name
                    activeLocationsObj.locationId = locations[j]._id
                    activeLocationsObj.institutionId = locations[j].institutionId
                    activeLocationsArr.push(activeLocationsObj)
                }
                return institutionsService.readByIds(activeLocationsArr)
            })
            .then(institution => {
                for (var i = 0; i < institution.length; i++) {
                    let institutionObj = {}
                    institutionObj.name = institution[i].name
                    institutionObj.institutionId = institution[i]._id
                    responseModel.item.unshift(institutionObj)
                }

                for (var x = 0; x < activeLocationsArr.length; x++) {
                    let location = activeLocationsArr[x]
                    const index = responseModel.item.findIndex(obj => obj.institutionId == location.institutionId)
                    responseModel.item.splice(index + 1, 0, location)
                }
                responseModel.item.unshift(clientObj)
                res.json(responseModel)
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
            .catch(err => {
                console.log(err)
                res.status(500).send(new responses.ErrorResponse(err))
            })
    }
}