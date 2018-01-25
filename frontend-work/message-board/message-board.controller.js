
(function() {
    'use strict'

    angular.module('client.site')
        .controller('viewClientNotesController', ViewClientNotesController)

    ViewClientNotesController.$inject = ['clientNotes', 'currentProfile', '$stateParams', '$state', 'clientNotesService', 'profileService', '$log']

    function ViewClientNotesController(clientNotes, currentProfile, $stateParams, $state, clientNotesService, profileService, $log) {
        var vm = this
        vm.clientNotes = []
        vm.clientNotesArr = []
        vm.currentProfile = []
        vm.clientName = ''

        // form info
        vm.formData = { profile: { profileOverrides: {} } }
        vm.formData.noteDate = new Date()
        vm.formData.profileId = currentProfile._id
        vm.formData.clientId = $stateParams.clientId

        // pagination
        vm.totalItems = null
        vm.currentPage = null
        vm.pageChanged = _pageChanged
        vm.submitNote = _submitNote

        init()

        function init() {
            vm.currentProfile = currentProfile
            vm.clientNotesArr = clientNotes.notes
            _displayClientName()

            if ($stateParams.clientId) {
                for (var i = 0; i < vm.clientNotesArr.length; i++) {
                    if (vm.clientNotesArr[i].clientId === $stateParams.clientId) {
                        vm.clientNotes.push(vm.clientNotesArr[i])
                    }
                }
            }

            //pagination
            vm.totalItems =  clientNotes.count
            vm.currentPage = $stateParams.page
        }

        //pagination
        function _pageChanged(currentPage) {
            $state.go('site.view-client-notes', { page: currentPage })
        }

        function _displayClientName(){
            profileService.readById($stateParams.clientId)
            .then(profile => {
                vm.clientName = profile.item.profileOverrides.name 
            })
        }

        function _submitNote() {
            vm.formData.profile.profileOverrides.name = vm.currentProfile.profileOverrides.name
            vm.formData.profile.profileOverrides.imageUrl = vm.currentProfile.profileOverrides.imageUrl

            clientNotesService.create(vm.formData)
                .then(note => {
                    vm.clientNotes.unshift(vm.formData) 
                    $state.reload()                    
                    vm.formData = {}
                    vm.formData.noteDate = new Date()
                    vm.form.$setUntouched()
                })
                .catch(err => $log.log(err))
        }
    }
})();