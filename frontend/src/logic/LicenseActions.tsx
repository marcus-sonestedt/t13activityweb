import { License } from "../Models";
import { getJsonHeaders } from './ADRActions';

// throws on error
export const updateLicenseAsync = async (license: License) => {
    const r = await fetch(license.apiUrl(), {
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
    const r = await fetch(license.apiUrl(), {
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

