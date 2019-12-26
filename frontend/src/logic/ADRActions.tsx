import Cookies from 'universal-cookie';
import { Activity, ActivityDelistRequest } from '../Models';
import { UserContext } from '../App';

const cookies = new Cookies();

const handleResponse = (action: string, url: string) => {
    return (resp: any) => new Promise((resolve: () => void, reject: () => void) => {
        let errText = "";

        if (resp instanceof Response) {
            if (resp.status < 300) {
                console.info(`Lyckades att ${action} avbokningsförfrågan.`)
                resolve();
                return;
            }

            errText = resp.statusText;
            resp.text().then(console.error);
        } else {
            errText = resp.toString();
        }

        console.error(errText);
        alert(`Misslyckades att ${action} avbokningsförfrågan\n${url}: ${errText}`);
        reject();
    });
}

export const createADR = (model: Activity, user: UserContext) => {
    const reason = prompt(
        "Ange varför du vill avboka ditt åtagande.\n" +
        "Observera att avbokningen inte är giltig innan den bekräftats av klubben.");
    if (reason === null)
        return Promise.reject(null);

    const url = `/api/activity_delist/${model.id}`;
    const handler = handleResponse('skapa', url)

    return fetch(url,
        {
            method: 'POST',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                member: user.memberId,
                activity: model.id,
                reason: reason
            })
        })
        .then(handler, handler);
}

export const cancelADR = (model: ActivityDelistRequest) => {
    if (!window.confirm(`Vill du verkligen radera din avbokningsförfrågan för\n${model}?`))
        return Promise.reject(null);

    const handler = handleResponse('radera', model.apiUrl())

    return fetch(model.apiUrl(),
        {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json'
            }
        })
        .then(handler, handler);
};

export const approveADR = (model: ActivityDelistRequest, user: UserContext) => {
    if (!user.isStaff) {
        console.error("Cannot approve ADR unless user is staff")
        return Promise.reject(null);
    }

    if (!window.confirm(`Godkänn avbokningsförfrågan för\n${model}?`)) {
        return Promise.reject(null);
    }

    const handler = handleResponse('bekräfta', model.apiUrl())

    return fetch(model.apiUrl(),
        {
            method: 'UPDATE',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approved: true,
                approved_by: user.memberId
            })
        })
        .then(handler, handler);
};

export const rejectADR = (model: ActivityDelistRequest, user: UserContext) => {
    if (!user.isStaff) {
        console.error("Cannot reject ADR unless user is staff")
        return Promise.reject(null);
    }

    var rejectReason = prompt(`Ange anledning att avvisa avbokningsförfrågan för\n${model}?`);

    if (rejectReason === null) {
        return Promise.reject(null);
    }

    const handler = handleResponse('avvisa', model.apiUrl())

    return fetch(model.apiUrl(),
        {
            method: 'UPDATE',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approved: false,
                approved_by: user.memberId,
                reject_reason: rejectReason
            })
        })
        .then(handler, handler);
};

export default {}