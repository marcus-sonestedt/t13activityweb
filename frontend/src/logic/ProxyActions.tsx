import { Member } from "../Models";
import { getJsonHeaders } from './ADRActions';

export const disconnectProxy = (proxy: Member, userName: string) => {
    if (!window.confirm(`Vill verkligen du ta bort möjligheten för ${proxy.fullname}\n` +
        `att åta sig uppgifter för din (${userName}) egen räkning?`))
        return;

    fetch(`/api/proxy/${proxy.id}`, {
        method: 'DELETE',
        headers: getJsonHeaders()
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
        headers: getJsonHeaders()
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
        headers: getJsonHeaders()
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

export const createProxy = async (member: Member) => {
    try {
        const r = await fetch(Member.apiUrlForId(''), {
            method: 'PUT',
            headers: getJsonHeaders()
        });

        if (r.status >= 300)
            throw r.statusText;

        const data = await r.json();
        member.id = data.id;
        return member;
    } catch (e) {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }
}