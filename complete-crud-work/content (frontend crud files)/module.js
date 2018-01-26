(function () {
    'use strict';

    angular.module('client.crud', ['ui.router', 'client.services','ui.bootstrap'])

    angular
        .module('client.crud').config(RouteConfig)

    RouteConfig.$inject = ['$stateProvider'];

    function RouteConfig($stateProvider) {
        $stateProvider
            .state('site.addresses', {
                url: '/addresses',
                abstract: true,
                views: {
                    'content': {
                        templateUrl: 'client/crud/addresses/addresses.html',
                        controller: 'addressController as addCtrl'
                    }
                }
            })
            .state('site.addresses.index', {
                url: '/index',
                views: {
                    'content': {
                        templateUrl: 'client/crud/addresses/index/address-index.html',
                        controller: 'indexAddressController as indexAddCtrl'
                    }
                },
                resolve: {
                    addresses: getAllAddresses
                }
            })
            .state('site.addresses.create', {
                url: '/create',
                views: {
                    'content': {
                        templateUrl: 'client/crud/addresses/write/address-write.html',
                        controller: 'writeAddressController as writeAddCtrl'
                    }
                }
            })
            .state('site.addresses.index.edit', {
                url: '/edit/:id',
                views: {
                    'content': {
                        templateUrl: 'client/crud/addresses/write/address-write.html',
                        controller: 'writeAddressController as writeAddCtrl'
                    }
                }
            })
            .state('site.addresses.detail', {
                url: '/:id',
                views: {
                    'content': {
                        templateUrl: 'client/crud/addresses/detail/address-detail.html',
                        controller: 'detailAddressController as detailAddCtrl'
                    }
                }
            })
    }

    getAllAddresses.$inject = ['addressesService']

    function getAllAddresses(addressesService) {
        return addressesService.readAll()
            .then(data => data.items)
    }
})();