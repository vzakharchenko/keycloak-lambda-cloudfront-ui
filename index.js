import fetch from 'axios';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

function getSessionValue() {
  return Cookies.get('KEYCLOAK_AWS_SESSION');
}

export function getTenantCookieValue(cookieName) {
  return Cookies.get(cookieName);
}

export function getDecodedSession() {
  const sessionValue = getSessionValue();
  if (sessionValue) {
    return jwt.decode(sessionValue);
  }
  window.location.reload();
  return {};
}

function removeCookies(cookieName) {
  if (window.location.protocol === 'http:') {
    Cookies.remove(cookieName);
  } else {
    Cookies.remove(cookieName, { path: '/', domain: `.${window.location.host}`, secure: true });
    Cookies.remove(cookieName, { path: '/', domain: `${window.location.host}`, secure: true });
  }
}

export function getTenants() {
  const decodedSession = getDecodedSession();
  const retTenants = [];
  const { tenants } = decodedSession;
  Object.keys(tenants).forEach((tenant) => {
    const resources = tenants[tenant];
    Object.keys(resources).forEach((resource) => {
      retTenants.push({
        realm: tenant,
        resource,
      });
    });
  });
  return retTenants;
}

export function getTenantCookie(realm, resource) {
  const decodedSession = getDecodedSession();
  const { tenants } = decodedSession;
  if (tenants[realm] && tenants[realm][resource]) {
    return tenants[realm][resource].cookieName;
  }
  throw new Error(`Tenant ${realm}-${resource}does not exist`);
}

export async function reloadToken(realm, resource, cookieName) {
  removeCookies(cookieName);
  const ret = await fetch({
    url: `/${realm}/${resource}/refresh`,
    method: 'GET',
    withCredentials: true,
  });
  if (ret.data) {
    window.location.reload();
    return true;
  }
  return false;
}

export async function getActiveTenantToken(realm, resource) {
  let realm0 = realm;
  let resource0 = resource;
  if (!realm && !resource) {
    const tenants = getTenants();
    if (tenants.length > 1) {
      throw new Error('Several Tenant found. Please specify which tenant do you need');
    }
    const tenant = tenants[0];
    realm0 = tenant.realm;
    resource0 = tenant.resource;
  }
  const tenantCookie = getTenantCookie(realm0, resource0);
  let token = getTenantCookieValue(tenantCookie);
  if (!token) {
    token = await reloadToken(realm0, resource0, tenantCookie);
  }
  return token;
}

export async function getDecodedTenantToken(realm, resource) {
  return jwt.decode(await getActiveTenantToken(realm, resource));
}

export function getTenant(realm, resource) {
  return getTenants().find((tenant) => tenant.realm === realm && tenant.resource === resource);
}
