import { License } from "../Models";
import { getJsonHeaders } from './ADRActions';

export const deleteLicenseAsync  = async (license: License) => {
    const r = await fetch(License.apiUrlForId(license.member, license.id), {
        method: 'DELETE',
        headers: getJsonHeaders(),
        body: JSON.stringify(license)
    });

    if (r.status >= 300) {
        console.error(r.status + ': ' + r.statusText);
        throw (await r.text())
    }
}

// throws on error
export const updateLicenseAsync = async (license: License) => {
    const r = await fetch(License.apiUrlForId(license.member, license.id), {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify(license)
    });

    if (r.status >= 300) {
        console.error(r.status + ': ' + r.statusText);
        throw (await r.text())
    }
}

// throws on error
export const createLicenseAsync = async (license: License) => {
    const r = await fetch(License.apiUrlForId(license.member, ''), {
        method: 'PUT',  
        headers: getJsonHeaders(),
        body: JSON.stringify(license)
    });

    if (r.status >= 300) {
        console.error(r.status + " " + r.statusText)
        throw (await r.text())
    }

    await r.json();
    return license;
}

