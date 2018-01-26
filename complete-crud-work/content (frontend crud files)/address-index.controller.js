(function () {
    'use strict'

    angular.module('client.crud')
        .controller('indexAddressController', IndexAddressController)

    IndexAddressController.$inject = ['addressesService', '$stateParams', '$state', 'addresses', '$log', 'uiFeedbackService']

    function IndexAddressController(addressesService, $stateParams, $state, addresses, $log, uiFeedbackService) {
        var vm = this

        vm.addresses = null
        vm.filterArray = _filterArray
        vm.openModal = _openModal

        init()

        function init() {
            vm.addresses = addresses
        }

        function _filterArray() {
            if ($state.params.id) return $state.params.id
        }

        //Modal function===================================================================================
        function _openModal(item, itemDesc) {
            uiFeedbackService.deleteModal(itemDesc)
                .then(() => addressesService.delete(item._id))
                .then(() => $state.go('site.addresses.index', {}, { reload: true }))
                .then(() => uiFeedbackService.success(`You have Successfully Deleted ${itemDesc}`, true))
                .catch(() => { $log.log('Modal dismissed at: ' + new Date()) })
        }
    }
})();
