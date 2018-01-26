/* https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#data-services */
(function() {
    'use strict'

    angular
        .module('client.services')
        .factory('addressesService', AddressesService) //creating service for above module

    AddressesService.$inject = ['$http', '$q']

    function AddressesService($http, $q) {
        return {
            readAll: readAll,
            readById: readById,
            create: create,
            update: update,
            delete: _delete
        }

        function readAll() {
            return $http.get('/api/addresses')
                .then(dateChange =>
                    convertAllDates(dateChange)
                )
                .catch(onError)
        }

        function readById(id) {
            return $http.get(`/api/addresses/${id}`)
                .then(dateChange =>
                    convertDate(dateChange)
                )
                .catch(onError)
        }

        function create(addressData) {
            return $http.post('/api/addresses', addressData)
                .then(xhrSuccess)
                .catch(onError)
        }

        function update(addressData) {
            return $http.put(`/api/addresses/${addressData._id}`, addressData)
                .then(xhrSuccess)
                .catch(onError)
        }

        function _delete(id) {
            return $http.delete(`/api/addresses/${id}`)
                .then(xhrSuccess)
                .catch(onError)
        }

        function xhrSuccess(responses) {
            return responses.data
        }

        function convertAllDates(dateChange){
            for (let x = 0; x < dateChange.data.length; x++) {
                dateChange.data[x].dateCreated = new Date(dateChange.data[x].dateCreated)
                dateChange.data[x].dateModified = new Date(dateChange.data[x].dateModified)
                dateChange.data[x].birthDate = new Date(dateChange.data[x].birthdate)
                if (dateChange.data[x].dateDeactivated !== null) {
                    dateChange.data[x].dateDeactivated = new Date(dateChange.data[x].dateDeactivated)
                }
                
            }
            return dateChange.data   
        }

        function convertDate(dateChange){
            dateChange.data.dateCreated = new Date(dateChange.data.dateCreated)
            dateChange.data.dateModified = new Date(dateChange.data.dateModified)
            dateChange.data.birthDate = new Date(dateChange.data.birthdate)
            if (dateChange.data.dateDeactivated !== null) {
                dateChange.data.dateDeactivated = new Date(dateChange.data.dateDeactivated)
            }
            return dateChange.data
        }

        function onError(error) {
            console.log(error.data)
            return $q.reject(error.data)
        }
    }
})();
