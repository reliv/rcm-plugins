/**
 * General service to wrap standard API JSON returns from RCM
 *  - Deals with failed codes (code 0 = success)
 *  - Creates standard return on error if no standard API JSON object received
 *  - Deals with loading state
 *  - Formats error messages (from rcm input filter) into single strings (optional)
 */
angular.module('rcmApi', [])
    .factory(
    'rcmApiService',
    [
        '$http', '$log',
        function ($http, $log) {

            var self = this;

            /**
             * cache
             * @type {{}}
             */
            self.cache = {};

            /**
             * ApiParams
             * @constructor
             */
            self.ApiParams = function () {
                this.url = '';
                this.urlParams = null;
                this.data = null;
                this.params = null;
                this.prepareErrors = true;

                this.loading = function (loading) {
                };
                this.success = function (data) {
                };
                this.error = function (data) {
                };
            };

            /**
             * ApiData
             * @constructor
             */
            self.ApiData = function () {
                this.code = null;
                this.message = null;
                this.data = [];
                this.errors = [];
            };

            /**
             * GET
             * @param apiParams
             * @param {bool} cache - if you ask for cache it will try to get it from and set it to the cache
             * @returns {*}
             */
            self.get = function (apiParams, cache) {

                apiParams = angular.extend(new self.ApiParams(), apiParams);

                apiParams.url = self.formatUrl(apiParams.url, apiParams.urlParams);

                if (cache) {

                    if (self.cache[apiParams.url]) {

                        self.apiSuccess(self.cache[apiParams.url], apiParams, 'CACHE', null, null)
                        return ;
                    }

                    apiParams.cacheId = apiParams.url;
                }

                apiParams.loading(true);

                $http(
                    {
                        method: 'GET',
                        url: apiParams.url,
                        params: apiParams.params // @todo Validate this works for GET query
                    }
                )
                    .success(
                    function (data, status, headers, config) {
                        self.apiSuccess(data, apiParams, status, headers, config)
                    }
                )
                    .error(
                    function (data, status, headers, config) {
                        self.apiError(data, apiParams, status, headers, config)
                    }
                );
            };

            /**
             * POST
             * @param apiParams
             */
            self.post = function (apiParams) {

                apiParams = angular.extend(new self.ApiParams(), apiParams);

                apiParams.url = self.formatUrl(apiParams.url, apiParams.urlParams);

                apiParams.loading(true);

                $http(
                    {
                        method: 'POST',
                        url: apiParams.url,
                        data: apiParams.data
                    }
                )
                    .success(
                    function (data, status, headers, config) {
                        self.apiSuccess(data, apiParams, status, headers, config)
                    }
                )
                    .error(
                    function (data, status, headers, config) {
                        self.apiError(data, apiParams, status, headers, config)
                    }
                );
            };

            /**
             * PUT
             * @param apiParams
             */
            self.put = function (apiParams) {

                apiParams = angular.extend(new self.ApiParams(), apiParams);

                apiParams.url = self.formatUrl(apiParams.url, apiParams.urlParams);

                apiParams.loading(true);

                $http(
                    {
                        method: 'PUT',
                        url: apiParams.url,
                        data: apiParams.data
                    }
                )
                    .success(
                    function (data, status, headers, config) {
                        self.apiSuccess(data, apiParams, status, headers, config)
                    }
                )
                    .error(
                    function (data, status, headers, config) {
                        self.apiError(data, apiParams, status, headers, config)
                    }
                );
            };

            /**
             * DELETE
             * @param apiParams
             */
            self.delete = function (apiParams) {

                apiParams = angular.extend(new self.ApiParams(), apiParams);

                apiParams.url = self.formatUrl(apiParams.url, apiParams.urlParams);

                apiParams.loading(true);

                $http(
                    {
                        method: 'DELETE',
                        url: apiParams.url,
                        data: apiParams.data
                    }
                )
                    .success(
                    function (data, status, headers, config) {
                        self.apiSuccess(data, apiParams, status, headers, config)
                    }
                )
                    .error(
                    function (data, status, headers, config) {
                        self.apiError(data, apiParams, status, headers, config)
                    }
                );
            };

            /**
             * Parse URL string and replace {#} with param value by key
             * @param {string} str
             * @param {array} urlParams
             * @returns {string}
             */
            self.formatUrl = function (str, urlParams) {

                if (typeof urlParams !== 'object' || urlParams === null) {
                    return str;
                }

                for (var arg in urlParams) {
                    str = str.replace(
                        RegExp("\\{" + arg + "\\}", "gi"),
                        urlParams[arg]
                    );
                }

                return str;
            };

            /**
             *
             * @param data
             * @param apiParams
             */
            self.apiError = function (data, apiParams, status, headers, config) {
                $log.error('An API error occured, status: '+status+' returned: ', data);

                self.prepareErrorData(
                    data,
                    apiParams,
                    function (data) {
                        apiParams.loading(false);
                        apiParams.error(data);
                    }
                );
            };

            /**
             * apiSuccess
             * @param data
             * @param apiParams
             * @param cacheId
             */
            self.apiSuccess = function (data, apiParams, status, headers, config) {
                // $log.info('An API success: ', data);

                if (data.code > 0) {

                    self.prepareErrorData(
                        data,
                        apiParams,
                        function (data) {
                            apiParams.loading(false);
                            apiParams.error(data);
                        }
                    )
                } else {

                    self.prepareData(
                        data,
                        apiParams,
                        function (data) {
                            if (apiParams.cacheId) {
                                self.cache[apiParams.cacheId] = angular.copy(data);
                            }
                            apiParams.loading(false);
                            apiParams.success(data);
                        }
                    );
                }
            };

            /**
             * prepareErrorData
             * @param data
             * @returns {ApiData} data
             */
            self.prepareErrorData = function (data, apiParams, callback) {

                if (typeof data !== 'object' || data === null) {
                    data = new self.ApiData();
                }

                if (!data.code) {
                    data.code = 1;
                }
                if (!data.message) {
                    data.message = 'An unknown error occured while making request.';
                }

                return self.prepareData(data, apiParams, callback);
            };

            /**
             * prepareData
             * @param data
             * @param {boolean} prepareErrors
             * @returns {ApiData} data
             */
            self.prepareData = function (data, apiParams, callback) {

                if (data.errors && apiParams.prepareErrors) {
                    self.prepareErrors(data, callback);
                    return;
                }

                callback(data);
            };

            /**
             * prepareErrors
             * @param data
             * @returns {ApiData} data
             */
            self.prepareErrors = function (data, callback) {

                angular.forEach(
                    data.errors,
                    function (value, key) {
                        if (typeof value === 'object' && value !== null) {
                            angular.forEach(
                                value,
                                function (evalue, ekey) {
                                    data.errors[key] = evalue + ' ';
                                }
                            );
                        }
                    }
                );
                callback(data);
            };

            return self;
        }
    ]
);