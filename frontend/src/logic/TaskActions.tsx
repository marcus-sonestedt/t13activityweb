import React from "react";
import Cookies from "universal-cookie";
import * as H from 'history';
import { Button } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import { Activity, Member } from "../Models";
import { getJsonHeaders } from "./ADRActions";

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

export const changeActivityViaProxy = (
    method:string,
    activity: Activity,
    proxy: Member,
    setError: (err?: string) => void,
) => {
    fetch(`/api/proxy/activity/${activity.id}/${proxy.id}`, {
        method: method,
        headers: getJsonHeaders()
    }).then(async  r => {
        if (r.status !== 200){
            const errText = `${r.statusText}:\n${await r.json().then(j => j['detail'])}`
            throw errText
        }
        setError(undefined);
    }, r => {
        throw r
    }).catch(e => {
        console.error(e);
        setError(e);
    });
}

export const BookButtons = (props: { activity: Activity, canBookSelf: boolean }) => {
    const history = useHistory();
    const createClaimHandler = (self: boolean) => {
        return (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            claimActivity(props.activity, self, history);
        }
    }

    return <>
        {props.canBookSelf
            ? <Button onClick={createClaimHandler(true)}>Boka själv</Button>
            : null}
        {' '}
        <Button onClick={createClaimHandler(false)}>Boka underhuggare</Button>
    </>
}
