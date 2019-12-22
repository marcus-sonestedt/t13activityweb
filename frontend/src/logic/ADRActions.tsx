import Cookies from 'universal-cookie';
import { Activity, ActivityDelistRequest } from '../Models';
import { UserContext } from '../App';

const cookies = new Cookies();


const handleResponse = (resp: any, action: string, url: string) => {
    if (resp instanceof Response) {
        if (resp.status !== 200) {
            console.error(resp.statusText);
            resp.text().then(console.error);
            alert(`Misslyckades att ${action} förfrågan\nUPDATE ${url}: ${resp.statusText}`);
        }
    } else {
        console.error(resp);
        alert(`Misslyckades att ${action} förfrågan\n${url}: ${resp}`);
    }
    window.location.reload();
};


export const createADR = (model: Activity, user: UserContext) => {
    const reason = prompt(
        "Ange varför du vill avboka ditt åtagande.\n" +
        "Observera att avbokningen måste bekräftas av klubben.");
    if (reason === null)
        return

    const handler = (x: any) => handleResponse(x, 'avboka', model.apiUrl())

    fetch(`/api/activity_delist/${model.id}`,
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
        .then(handler, handler)
        .finally(() => window.location.reload());
}



export const cancelADR = (model: ActivityDelistRequest) => {
    if (!window.confirm(`Vill du verkligen radera din avbokningsförfrågan för\n${model}?`))
        return

    const handler = (r: any) => handleResponse(r, 'radera', model.apiUrl());

    const cookies = new Cookies();

    fetch(model.apiUrl(),
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
        return
    }        

    if (!window.confirm(`Godkänn avbokningsförfrågan för\n${model}?`))
        return

    const handler = (r: any) => handleResponse(r, 'bekräfta', model.apiUrl());

    fetch(model.apiUrl(),
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
        return
    }        

    var rejectReason = prompt(`Ange anledning att avvisa avbokningsförfrågan för\n${model}?`);
    if (rejectReason === null)
        return

    const handler = (r: any) => handleResponse(r, 'avvisa', model.apiUrl());

    fetch(model.apiUrl(),
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