import Cookies from 'universal-cookie';
import { Activity, ActivityDelistRequest } from '../Models';
import { UserContext } from '../App';

const cookies = new Cookies();

const handleResponse = (action: string, url: string) => {
    return (resp: any) => new Promise((resolve: () => void, reject: () => void) => {
        const showErr = (errText: string) => {
            console.error(url + ": " + errText);
            alert(`Misslyckades att ${action} avbokningsförfrågan\n\n${errText}.`);
            reject();
        }

        if (resp instanceof Response) {
            if (resp.status < 300) {
                resolve();
            } else {                resp.text().then(
                    body => showErr(resp.statusText + ": " + body),
                    _ => showErr(resp.statusText));
            }
        } else {
            showErr(resp.toString());
        }
    });
}

export const createADR = async (model: Activity, user: UserContext) => {
    const reason = prompt(
        "Ange varför du vill avboka ditt åtagande.\n" +
        "Observera att avbokningen inte är giltig innan den bekräftats av klubben.");
    if (reason === null)
        return;

    const url = ActivityDelistRequest.apiUrlAll() + '/create';
    const handler = handleResponse('skapa', url)

    await fetch(url,
        {
            method: 'POST',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json',
                'cache': 'no-cache'
            },
            body: JSON.stringify({
                member: user.memberId,
                activity: model.id,
                reason: reason
            })
        })
        .then(handler, handler);
}

export const cancelADR = async (model: ActivityDelistRequest) => {
    if (!window.confirm(`Vill du verkligen radera din avbokningsförfrågan för\n${model.activity}?`))
        return

    const handler = handleResponse('radera', model.apiUrl())

    await fetch(model.apiUrl(),
        {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json',
                'cache': 'no-cache'
            }
        })
        .then(handler, handler);
};

export const approveADR = async (model: ActivityDelistRequest, user: UserContext) => {
    if (!user.isStaff) {
        console.error("Cannot approve ADR unless user is staff")
        return;
    }

    if (!window.confirm(`Godkänn avbokningsförfrågan för\n${model}?`)) {
        return;
    }

    const handler = handleResponse('bekräfta', model.apiUrl())

    await fetch(model.apiUrl(),
        {
            method: 'UPDATE',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json',
                'cache': 'no-cache'
            },
            body: JSON.stringify({
                approved: true,
                approved_by: user.memberId
            })
        })
        .then(handler, handler);
};

export const rejectADR = async (model: ActivityDelistRequest, user: UserContext) => {
    if (!user.isStaff) {
        console.error("Cannot reject ADR unless user is staff")
        return;
    }

    var rejectReason = prompt(`Ange anledning att avvisa avbokningsförfrågan för\n${model}?`);
    if (rejectReason === null) {
        return;
    }

    const handler = handleResponse('avvisa', model.apiUrl())

    await fetch(model.apiUrl(),
        {
            method: 'UPDATE',
            headers: {
                'X-CSRFToken': cookies.get('csrftoken'),
                'Content-Type': 'application/json',
                'cache': 'no-cache'
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