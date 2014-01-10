/**
 * RcmLogin
 *
 * JS for editing RcmLogin
 *
 * PHP version 5.3
 *
 * LICENSE: No License yet
 *
 * @category  Reliv
 * @package   RcmPlugins\RcmLogin
 * @author    Rod McNew <rmcnew@relivinc.com>
 * @copyright 2012 Reliv International
 * @license   License.txt New BSD License
 * @version   GIT: <git_id>
 */

/**
 * Synchronously grab dependency object file(s)
 */
$.ajax({
    async: false,
    url: '/modules/rcm/js/admin/ajax-plugin-edit-helper.js',
    dataType: 'script'
});

/**
 *
 * @param {int} instanceId
 * @param {jQuery} container
 * @constructor
 */
var RcmLoginEdit = function (instanceId, container) {

    var me = this;

    /**
     * Settings from db
     * @type {Object}
     */
    var data;

    /**
     * Default settings from config json file
     * @type {Object}
     */
    var defaultData;

    var ajaxEditHelper = new AjaxPluginEditHelper(
        instanceId, container, 'rcm-login'
    );

    /**
     * Called by content management system to make this plugin user-editable
     */
    this.initEdit = function () {
        ajaxEditHelper.disableEvents();
        ajaxEditHelper.ajaxGetInstanceConfigs(me.completeEditInit);
    };

    /**
     * Completes edit init process after we get data from server
     *
     * @param {Object} returnedData
     * @param {Object} returnedDefaultData
     */
    this.completeEditInit = function (returnedData, returnedDefaultData) {
        data = returnedData;
        defaultData = returnedDefaultData;
        ajaxEditHelper.attachPropertiesDialog(me.showEditDialog);
    };

    this.showEditDialog = function () {

        var errorInputs = ajaxEditHelper.buildInputGroup(
            data['translate'],
            defaultData['translate']
        );

        $('<form></form>')
            .addClass('simple')
            .appendMulti(errorInputs)
            .dialog({
                title: 'Properties',
                modal: true,
                width: 620,
                zIndex: 2000000,
                buttons: {
                    Cancel: function () {
                        $(this).dialog("close");
                    },
                    Ok: function () {

                        ajaxEditHelper.captureInputGroup(
                            'translate', errorInputs, data
                        );

                        $(this).dialog("close");
                    }
                }
            });
    };

    /**
     * Called by content management system to get this plugins data for saving
     * on the server
     *
     * @return {Object}
     */
    this.getSaveData = function () {
        return data;
    };
};