angular.module('rcmAdmin').controller(
    'rcmAdminCreateSiteController',
    function ($scope, $log, $http) {

        var self = this;

        $scope.loadings = {
            defaultSite: false,
            themes: false,
            languages: false,
            countries: false,
            createSite: false
        };

        $scope.site = {};
        $scope.themes = {};
        $scope.languages = {};
        $scope.countries = {};

        $scope.done = false;

        $scope.code = 1;
        $scope.message = '';
        $scope.errorMessage = '';

        self.parseMessage = function(result){

            if(result.code == 0){
                $scope.errorMessage = $scope.errorMessage + ' ' + result.message;
            }
        };

        self.resetMessage = function(result){

            $scope.code = 1;
            $scope.message = '';
            $scope.errorMessage = '';
        };

        $scope.reset = function() {

            self.resetMessage();
            $scope.done = false;
        };

        self.getDefaultSite = function(){
            $scope.loadings.defaultSite = true;
            $http(
                {
                    method: 'GET',
                    url: '/api/admin/manage-sites/-1'
                }
            )
                .success(
                function (data) {

                    self.parseMessage(data);

                    $scope.site = data.data;
                    $scope.loadings.defaultSite = false;
                }
            )
                .error(
                function (data) {
                    self.parseMessage(data);

                    $scope.site = data.data;
                    $scope.loadings.defaultSite = false;
                }
            );
        };

        self.getThemes = function(){
            $scope.loadings.themes = true;
            $http(
                {
                    method: 'GET',
                    url: '/api/admin/theme'
                }
            )
                .success(
                function (data) {
                    self.parseMessage(data);

                    $scope.themes = data.data;
                    $scope.loadings.themes = false;
                }
            )
                .error(
                function (data) {
                    self.parseMessage(data);

                    $scope.themes = data.data;
                    $scope.loadings.themes = false;
                }
            );
        };

        self.getLanguages = function(){
            $scope.loadings.languages = true;
            $http(
                {
                    method: 'GET',
                    url: '/api/admin/language'
                }
            )
                .success(
                function (data) {
                    self.parseMessage(data);

                    $scope.languages = data.data;
                    $scope.loadings.languages = false;
                }
            )
                .error(
                function (data) {
                    self.parseMessage(data);

                    $scope.languages = data.data;
                    $scope.loadings.languages = false;
                }
            );
        };

        self.getCountries = function(){
            $scope.loadings.countries = true;
            $http(
                {
                    method: 'GET',
                    url: '/api/admin/country'
                }
            )
                .success(
                function (data) {
                    self.parseMessage(data);

                    $scope.countries = data.data;
                    $scope.loadings.countries = false;
                }
            )
                .error(
                function (data) {
                    self.parseMessage(data);

                    $scope.countries = data.data;
                    $scope.loadings.countries = false;
                }
            );
        };

        $scope.createSite = function(){
            $scope.loadings.createSite = true;
            self.resetMessage();
            $http(
                {
                    method: 'POST',
                    url: '/api/admin/manage-sites',
                    data: $scope.site
                }
            )
                .success(
                function (data) {
                    console.log('success', data);
                    self.parseMessage(data);

                    if(data.code == 1) {
                        $scope.site = data.data;
                        $scope.message = data.message;
                        $scope.done = true;
                    }
                    $scope.loadings.createSite = false;
                }
            )
                .error(
                function (data) {
                    console.log('error', data);
                    self.parseMessage(data);

                    $scope.loadings.createSite = false;
                }
            );
        };

        self.getDefaultSite();

        self.getThemes();

        self.getLanguages();

        self.getCountries();
    }
);