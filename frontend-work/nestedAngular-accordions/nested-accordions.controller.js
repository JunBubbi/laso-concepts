// Following team standards of John Papa style AngularJS

(function () {
    'use strict'

    angular.module('client.site')
        .controller('helpFaqController', HelpFaqController)

    HelpFaqController.$inject = ['faqCategoryService', 'faqEntriesService', '$log']

    function HelpFaqController(faqCategoryService, faqEntriesService, $log) {
        var vm = this
        vm.categories = null
        vm.getCategoryEntries = _getCategoryEntries

        init()

        function init() {
            faqCategoryService.readAll()
                .then(faqCategories => vm.categories = faqCategories.items)
        }

        function _getCategoryEntries(category) {
            if (category.entries === undefined) {
                faqEntriesService.readAll(category._id)
                    .then(faqEntries => category.entries = faqEntries.items)
                    .catch(error => $log.log(`Error type: ${error}`))
            }
        }
    }
})();