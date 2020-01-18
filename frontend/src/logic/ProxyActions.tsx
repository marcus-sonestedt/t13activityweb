import { Member } from "../Models";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const deleteProxy = (proxy: Member, userName: string) => {
    if (!window.confirm(`Vill verkligen du ta bort möjligheten för ${proxy.fullname}\n` +
        `att åta sig uppgifter för din (${userName}) egen räkning?`))
        return;

    fetch(`/api/proxy/${proxy.id}`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': cookies.get('csrftoken') }
    }).then(r => {
        if (r.status !== 200)
            throw r.statusText;
    }, r => { throw r })
        .catch(e => {
            console.error(e);
            alert("Något gick fel! :(\n" + e);
        })
        .finally(() => {
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
    }, r => { throw r }
    ).catch(e => {
        console.error(e);
        alert("Något gick fel! :(\n" + e);
    }).finally(() => {
        window.location.reload();
    });
}