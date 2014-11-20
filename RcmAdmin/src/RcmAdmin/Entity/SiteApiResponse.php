<?php
namespace RcmAdmin\Entity;

use Rcm\Entity\Site;


/**
 * Class SiteApiResponse
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   moduleNameHere
 * @author    James Jervis <jjervis@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   Release: <package_version>
 * @link      https://github.com/reliv
 */
class SiteApiResponse extends Site
{
    /**
     * jsonSerialize
     *
     * @return array|mixed
     */
    public function jsonSerialize()
    {
        return $this->toArray();
    }

    /**
     * getIterator
     *
     * @return array|Traversable
     */
    public function getIterator()
    {
        return new \ArrayIterator($this->toArray());
    }

    /**
     * getBasicProperties
     *
     * @return array
     */
    public function toArray()
    {
        return array(
            'siteId' => $this->getSiteId(),
            'domain' => $this->getDomain(),
            'theme' => $this->getTheme(),
            'siteLayout' => $this->getSiteLayout(),
            'siteTitle' => $this->getSiteTitle(),
            'language' => $this->getLanguage(),
            'country' => $this->getCountry(),
            'status' => $this->getStatus(),
            'favIcon' => $this->getFavIcon(),
            'loginPage' => $this->getLoginPage(),
            'notAuthorizedPage' => $this->getNotAuthorizedPage(),
            'notFoundPage' => $this->getNotFoundPage(),
        );
    }
} 