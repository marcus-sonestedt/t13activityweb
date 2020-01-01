import React, { useContext } from "react";
import { Button, Table } from 'react-bootstrap'
import { useHistory } from "react-router-dom";

import { Activity } from '../Models'
import { userContext } from "../App"
import { createADR, cancelADR } from "../logic/ADRActions";
import './Table.css'

export class MyActivitiesProps {
    values: Activity[] = [];
    reload: () => void = () => {};
}

export const MyActivitiesTable = (props: MyActivitiesProps) => {
    const { values, reload } = props;
    const history = useHistory();
    const user = useContext(userContext)
    const today = new Date();

    const renderRow = (model: Activity) => {
        const unlistPossible = model.event.start_date > today;
        const delistRequest = model.delistRequest;

        return (
            <tr key={model.id} className='clickable-row' onClick={() => history.push(model.url())}>
                <td><a href={model.url()}>{model.name}</a></td>
                <td><a href={model.event.url()}>{model.event.name}</a></td>
                <td className='nowrap'>
                    {model.date()}<br/>{model.time()}
                </td>
                <td>{!unlistPossible ? (model.completed ? "✔" : "❌") :
                    (delistRequest === null ?
                        <Button variant='danger' size='sm'
                            onClick={() => createADR(model, user).then(reload)}>
                            Avboka?
                        </Button>
                        : <Button variant='warning' size='sm'
                            onClick={() => cancelADR(delistRequest).then(reload)}>
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
                <span className="table-count">({values.length} st)</span>
            </h3>
            <Table striped>
                <thead>
                    <tr>
                        <th>Namn</th>
                        <th>Aktivitet</th>
                        <th>Tidpunkt</th>
                        <th>Utförd</th>
                    </tr>
                </thead>
                <tbody>
                    {values
                        .sort((a, b) => a.date < b.date ? 1 : 0)
                        .map(renderRow)}
                </tbody>
            </Table>
        </div>
    )
}