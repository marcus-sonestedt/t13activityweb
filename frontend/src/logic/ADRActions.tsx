import Cookies from 'universal-cookie';
import { Activity, ActivityDelistRequest } from '../Models';
import { UserContext } from "../components/UserContext";
import { deserialize } from 'class-transformer';

const cookies = new Cookies();

const getJsonHeaders = () => {
    return {
        'X-CSRFToken': cookies.get('csrftoken'),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

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
            } else {
                resp.text().then(
                    body => showErr(resp.statusText + ": " + body),
                    _ => showErr(resp.statusText));
            }
        } else {
            showErr(resp?.toString() ?? 'okänt fel');
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
            headers: getJsonHeaders(),
            body: JSON.stringify({
                member: user.memberId,
                activity: model.id,
                reason: reason
            })
        })
        .then(handler, handler);
}

export async function cancelADRByActivity(activity_id: string) {
    const url = ActivityDelistRequest.apiUrlForActivityId(activity_id);
    const handler = handleResponse('radera', url)

    await fetch(url,
        {
            method: 'GET',
            headers: getJsonHeaders(),
            cache: 'no-cache'
        })
        .then(resp => resp.text().then(json => {
            const data = deserialize(ActivityDelistRequest, json);
            return cancelADR(data);
        }, handler), handler);
        
}

export async function cancelADR(model: ActivityDelistRequest) {
    if (!window.confirm(`Vill du verkligen radera din avbokningsförfrågan för\n${model.activity}?`))
        return

    const handler = handleResponse('radera', model.apiUrl())

    await fetch(model.apiUrl(),
        {
            method: 'DELETE',
            headers: getJsonHeaders(),
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
            headers: getJsonHeaders(),
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
            headers: getJsonHeaders(),
            body: JSON.stringify({
                approved: false,
                approved_by: user.memberId,
                reject_reason: rejectReason
            })
        })
        .then(handler, handler);
};

export default {}