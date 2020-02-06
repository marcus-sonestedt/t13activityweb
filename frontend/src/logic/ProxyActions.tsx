import { Member } from "../Models";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const disconnectProxy = (proxy: Member, userName: string) => {
    if (!window.confirm(`Vill verkligen du ta bort möjligheten för ${proxy.fullname}\n` +
        `att åta sig uppgifter för din (${userName}) egen räkning?`))
        return;

    fetch(`/api/proxy/${proxy.id}`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': cookies.get('csrftoken') }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}

export const addExistingProxy = (proxy: Member) => {
    fetch(`/api/proxy/${proxy.id}`, {
        method: 'PUT',
        headers: { 'X-CSRFToken': cookies.get('csrftoken') }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}

export const updateProxy = (member: Member) => {
    return fetch(member.apiUrl(), {
        method: 'PATCH',
        headers: { 'X-CSRFToken': cookies.get('csrftoken') }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}

export const createProxy = (member: Member) => {
    return fetch(member.apiUrl(), {
        method: 'PUT',
        headers: { 'X-CSRFToken': cookies.get('csrftoken') }
    }).then(async r => {
        if (r.status >= 300)
            throw r.statusText;

        const data = await r.json();
        member.id = data.id;
    }).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}