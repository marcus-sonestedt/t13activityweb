import React, { useContext } from "react";
import { Button, Table } from 'react-bootstrap'
import { useHistory } from "react-router-dom";

import { Activity } from '../Models'
import { userContext } from "../App"
import { createADR, cancelADRByActivity } from "../logic/ADRActions";
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

    const renderRow = (activity: Activity) => {
        const unlistPossible = activity.event.start_date > today;

        return (
            <tr key={activity.id} className='clickable-row' onClick={() => history.push(activity.url())}>
                <td><a href={activity.url()}>{activity.name}</a></td>
                <td><a href={activity.event.url()}>{activity.event.name}</a></td>
                <td className='nowrap'>
                    {activity.date()}<br/>{activity.time()}
                </td>
                <td>{!unlistPossible ? (activity.completed ? "✔" : "❌") :
                    (!activity.delist_requested ?
                        <Button variant='danger' size='sm'
                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {e.stopPropagation(); createADR(activity, user).then(reload)}}>
                            Avboka?
                        </Button>
                        : <Button variant='warning' size='sm'
                            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {e.stopPropagation(); cancelADRByActivity(activity.id).then(reload)}}>
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