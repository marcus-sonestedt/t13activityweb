import React, { useContext } from "react";
import { Button, Table } from 'react-bootstrap'
import { Activity } from '../Models'
import './Table.css'
import Cookies from "universal-cookie"
import { userContext } from "../App"
import { cancelDelistRequest } from "../views/ActivityDelistRequestsView"

export class MyActivitiesProps {
    values: Activity[] = [];
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {
    const user = useContext(userContext)

    const requestActivityDelist = (model: Activity) => {
        const reason = prompt(
            "Ange varför du vill avboka ditt åtagande.\n" +
            "Observera att avbokningen måste bekräftas av klubben.");
        if (reason === null)
            return

        const cookies = new Cookies();

        fetch(`/api/activity_delist/${model.id}`,
            {
                method: 'POST',
                headers: { 'X-CSRFToken': cookies.get('csrftoken') },
                body: JSON.stringify({
                    member: user.memberId,
                    activity: model.id,
                    reason: reason
                })
            })
            .then(r => {
                if (r.status !== 200) {
                    r.text().then(t => console.error(t));
                    throw r.statusText;
                }
            }, r => { throw r }
            )
            .catch(err => {
                console.error(err);
                alert("Något gick fel! :(\n" + err);
            })
            .finally(() => window.location.reload());
    }

    const today = new Date();

    const renderRow = (model: Activity) => {
        const unlistPossible = model.event.start_date > today;
        const delistRequest = model.delistRequest;

        return (
            <tr key={model.id}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td><a href={model.event.url()}>{model.event.name}</a></td>
                <td>{model.event.date()}</td>
                <td>{model.time()}</td>
                <td>{!unlistPossible ? (model.completed ? "✔" : "❌") :
                    (delistRequest === null ?
                        <Button variant='danger' size='sm'
                            onClick={() => requestActivityDelist(model)}>
                            Avboka?
                        </Button>
                        : <Button variant='success' size='sm'
                            onClick={() => cancelDelistRequest(delistRequest)}>
                            Återboka
                        </Button>
                    )}
                </td>
            </tr>
        );
    }

    if (props.values === undefined)
        return <p>Oops</p>

    return (
        <div className="table-container">
            <h3>
                <span className="table-title">Mina uppgifter</span>
                <span className="table-count">({props.values.length} st)</span>
            </h3>
            <Table striped>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Aktivitet</th>
                        <th>Datum</th>
                        <th>Tid</th>
                        <th>Utförd</th>
                    </tr>
                </thead>
                <tbody>
                    {props.values
                        .sort((a, b) => a.date < b.date ? 1 : 0)
                        .map(renderRow)}
                </tbody>
            </Table>
        </div>
    )
}