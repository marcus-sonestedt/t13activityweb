import { Cookies } from "react-cookie-consent";
import { Activity, Member } from "../Models";
import * as H from 'history';

const cookies = new Cookies();

export const claimActivity = (
    model: Activity,
    self: boolean,
    history: H.History<H.LocationState>
) => {
    if (self) {
        claimActivityForSelf(model, history);
    } else {
        history.push(`/frontend/enlist_by_proxy/${model.id}`)
    }
}

const claimActivityForSelf = (
    model: Activity,
    history: H.History<H.LocationState>
) => {
    fetch(`/api/activity_enlist/${model.id}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': cookies.get('csrftoken'),
            'accept': 'application/json'
        }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
        history.push(`/frontend/home?tab=my-tasks?highlight-task=${model.id}`)
    }, r => {
        throw r
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
        window.location.reload();
    });
}

export const enlistActivityViaProxy = (
    model: Activity,
    proxy: Member
) => {
    fetch(`/api/proxy/activity/${model.id}/${proxy.id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': cookies.get('csrftoken'),
            'accept': 'application/json'
        }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
    }, r => {
        throw r
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}

export const delistActivityViaProxy = (
    model: Activity,
    proxy: Member,
) => {
    fetch(`/api/proxy/activity/${model.id}/${proxy.id}`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': cookies.get('csrftoken'),
            'accept': 'application/json'
        }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
    }, r => {
        throw r
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}
