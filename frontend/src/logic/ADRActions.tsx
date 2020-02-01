import Cookies from 'universal-cookie';
import { Activity, ActivityDelistRequest, Member } from '../Models';
import { UserContext } from "../components/UserContext";
import { deserialize } from 'class-transformer';

const cookies = new Cookies();

export const getJsonHeaders = () => {
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
        .then(handler, handler)
        .finally(() => window.location.reload)
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

export async function deleteADR(model: ActivityDelistRequest) {
    if (model.approved !== true) {
        await cancelADR(model);
        return;
    }

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

    if (!(model.member instanceof Member) || !(model.activity instanceof Activity)) {
        console.error("member and/or activity property of ADR not fully populated.")
        return;
    }

    if (!window.confirm(`Godkänn avbokningsförfrågan från ${model.member?.fullname}\nför uppgiften '${model.activity?.name}'?`)) {
        return;
    }

    const handler = handleResponse('bekräfta', model.apiUrl())

    await fetch(model.apiUrl(),
        {
            method: 'PATCH',
            headers: getJsonHeaders(),
            body: JSON.stringify({
                approved: true,
                approver: user.memberId
            })
        })
        .then(handler, handler);
};

export const rejectADR = async (model: ActivityDelistRequest, user: UserContext) => {
    if (!user.isStaff) {
        console.error("Cannot reject ADR unless user is staff")
        return;
    }

    if (!(model.member instanceof Member) || !(model.activity instanceof Activity)) {
        console.error("member and/or activity property of ADR not fully populated.")
        return;
    }


    var rejectReason = window.prompt(`Ange din anledning att avvisa ${model.member.fullname}s\navbokningsförfrågan för uppgiften '${model.activity.name}'?`);
    if (rejectReason === null) {
        return;
    }

    const handler = handleResponse('avvisa', model.apiUrl())

    await fetch(model.apiUrl(),
        {
            method: 'PATCH',
            headers: getJsonHeaders(),
            body: JSON.stringify({
                approved: false,
                approver: user.memberId,
                reject_reason: rejectReason
            })
        })
        .then(handler, handler);
};

export default {}