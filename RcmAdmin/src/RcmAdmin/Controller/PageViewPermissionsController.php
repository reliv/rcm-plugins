<?php

namespace RcmAdmin\Controller;

use Rcm\Http\Response;
use RcmUser\Acl\Entity\AclRule;
use Zend\Mvc\Controller\AbstractRestfulController;
use Zend\View\Model\JsonModel;

class PageViewPermissionsController extends AbstractRestfulController
{
    protected $siteId;

    /**
     * @var \Rcm\Acl\ResourceProvider $resourceProvider
     */
    protected $resourceProvider;

    /**
     * @var \RcmUser\Acl\Service\AclDataService $aclDataService
     */
    protected $aclDataService;

    /**
     * @var \Rcm\Service\PageManager
     */
    protected $pageManager;

    /**
     * Update an existing resource
     *
     * @param  string $id   $pageName
     * @param  array  $data $roles
     *
     * @return mixed
     */
    public function update($id, $data)
    {
        $this->aclDataService = $this->getServiceLocator()->get(
            'RcmUser\Acl\AclDataService'
        );

        $this->resourceProvider = $this->getServiceLocator()->get(
            'Rcm\Acl\ResourceProvider'
        );
        $this->pageManager = $this->getServiceLocator()->get(
            'Rcm\Service\PageManager'
        );

        if (!is_array($data)) {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_400);
            return $this->getResponse();
        }

        $currentSiteId = $this->getServiceLocator()->get(
                'Rcm\Service\SiteManager'
            )->getCurrentSiteId();

        if (is_numeric($data['siteId']) && ($currentSiteId == $data['siteId'])) {
            $siteId = $data['siteId'];
        } else {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_400);
            return $this->getResponse();
        }

        if (is_string($data['pageName'])) {

            $pageName = $data['pageName'];

        } else {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_400);
            return $this->getResponse();
        }

        if (is_string($data['pageType']) && strlen($data['pageType']) == '1') {

            $pageType = $data['pageType'];

        } else {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_400);
            return $this->getResponse();
        }

        if (is_array($data['roles'])) {

            $roles = $data['roles'];

        } else {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_400);
            return $this->getResponse();

        }
        //CREATE RESOURCE ID
        $resourceId = 'sites.' . $siteId . '.pages.' . 'n' . '.' . $pageName;
        //ACCESS CHECK
        if (!$this->rcmIsAllowed($resourceId, 'admin')) {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_401);
            return $this->getResponse();
        }

        //IS PAGE VALID?
        $validPage = $this->pageManager->isPageValid($pageName, $pageType);

        if (!$validPage) {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_404);
            return $this->getResponse();
        }

        if (!$this->isValidResourceId($resourceId)) {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_400);
            return $this->getResponse();
        }

        //DELETE ALL PERMISSIONS
        $deleteAllPermissions = $this->deletePermissions($resourceId);

        if (!$deleteAllPermissions) {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_400);
            return $this->getResponse();
        }

        $this->addPermissions($roles, $resourceId);

        return new JsonModel(array());

    }

    /**
     * deletePermissions
     *
     * @param $resourceId
     *
     * @return boolean
     */
    public function deletePermissions($resourceId)
    {
        $rules = $this->aclDataService->getRulesByResource($resourceId)
            ->getData();
        /** @var \RcmUser\Acl\Entity\AclRole $role */
        foreach ($rules as $rule) {

            $result = $this->aclDataService->deleteRule($rule);

            if (!$result->isSuccess()) {
                return false;
            }
        }

        return true;
    }

    /**
     * addPermissions
     *
     * @param $roles
     * @param $resourceId
     *
     * @return void
     */
    public function addPermissions($roles, $resourceId)
    {
        if (empty($roles)) {
            return;
        }

        foreach ($roles as $roleId) {
            $this->addPermission($roleId, $resourceId);
        }

        if (count($roles) > 0) {
            $this->aclDataService->createRule(
                $this->getAclRule('guest', $resourceId, 'deny')
            );
        }
    }

    /**
     * addPermission
     *
     * @param $roleId
     * @param $resourceId
     *
     * @return void
     */
    public function addPermission($roleId, $resourceId)
    {
        $this->aclDataService->createRule(
            $this->getAclRule($roleId, $resourceId)
        );
    }

    /**
     * getAclRule
     *
     * @param        $roleId
     * @param        $resourceId
     * @param string $allowDeny
     *
     * @return AclRule
     * @throws \RcmUser\Exception\RcmUserException
     */
    protected function getAclRule($roleId, $resourceId, $allowDeny = 'allow')
    {
        $rule = new AclRule();
        $rule->setRoleId($roleId);
        $rule->setRule($allowDeny);
        $rule->setResourceId($resourceId);
        $rule->setPrivilege('read');

        return $rule;
    }

    /**
     * isValidResourceId
     *
     * @param $resourceId
     *
     * @return bool
     */
    public function isValidResourceId($resourceId)
    {
        $resource = $this->resourceProvider->getResource($resourceId);

        return true;
    }
}