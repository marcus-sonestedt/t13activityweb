import React, { useContext, useMemo } from "react";
import { Table, Col, Row } from 'react-bootstrap'
import { useHistory } from "react-router-dom";

import { Activity, ActivityDelistRequest } from '../Models';
import { userContext } from "./UserContext"
import { createADR, cancelADRByActivity } from "../logic/ADRActions";
import { CancelAdrButton, RequestAdrButton } from '../pages/ADRPage';
import { HoverTooltip } from "./Utilities";
import './Table.css'

export const MyActivitiesTable = (props: {
    values: Activity[],
    reload: () => void
}) => {
    const { values, reload } = props;
    const history = useHistory();
    const user = useContext(userContext)
    const today = new Date();
    const bookedCount = useMemo(() => values.filter(a => !a.delist_requested).length, [values])
    const completedCount = useMemo(() => values.filter(a => a.completed === true).length, [values])
    const canRequestUnlist = bookedCount > user.settings.minSignups

    const buttonClick = (f: () => Promise<void>) => (e: any) => {
        e.stopPropagation();
        f().then(reload);
    }

    const highlightActivityMatch = window.location.search.match(/\?highlight-activity=([0-9]+)/);
    const highlightActivityId = highlightActivityMatch ? highlightActivityMatch[1] : undefined;

    const renderRow = (activity: Activity) => {
        const eventInPast = activity.event.start_date <= today;
        const rowClick = (e: any) => {
            if (e.target?.tagName === 'A')
                return

            e.preventDefault();
            history.push(activity.url());
        }

        const [text, tooltip, emoji, emojiLabel] =
            !eventInPast ? ['', '', '', '']
                : activity.completed === null
                    ? ["Obekräftad", "Din närvaro har inte registrerats", '⏰', 'clock']
                    : activity.completed === true
                        ? ["Utförd", "Bra jobbat", '👍', 'thumbsup']
                        : ["Missad", "Du missade din uppgift! Du behöver boka en ny!", '😨', 'ohno']

        const rowClassName = 'clickable-row ' + (activity.id.toString() === highlightActivityId ? 'active' : '');

        return (
            <tr key={activity.id} className={rowClassName} onClick={rowClick} >
                <td>
                    <a href={activity.url()}>{activity.name}</a>
                    <br />
                    {activity.type !== null
                        ? <a href={activity.type.url()} style={{ fontWeight: 'normal' }}>{activity.type.name}</a>
                        : null}
                </td>
                <td>
                    <a href={activity.event.url()}  style={{ fontWeight: 'bold' }}>{activity.event.name}</a>
                    <br />
                    {activity.event.type !== null
                        ? <a href={activity.event.type.url()}>{activity.event.type.name}</a>
                        : null}
                </td>
                <td className='nowrap'>
                    {activity.date()}
                    <br />
                    {activity.time()}
                </td>
                <td>{eventInPast
                    ? <HoverTooltip tooltip={tooltip}>
                        <span>{text} <span role="img" aria-label={emojiLabel}>{emoji}</span></span>
                    </HoverTooltip>
                    : activity.delist_requests.length === 0
                        ? <span>Bokad</span>
                        : <a href={ActivityDelistRequest.urlForId(activity.delist_requests[0])}>Avbokningsfråga inlagd</a>
                }
                </td>
                <td>
                    {activity.delist_requests.length === 0
                        ? <RequestAdrButton onClick={buttonClick(() => createADR(activity, user))} disabled={!canRequestUnlist} />
                        : <CancelAdrButton onClick={buttonClick(() => cancelADRByActivity(activity.id))} />
                    }
                </td>
            </tr>
        );
    }

    if (props.values === undefined)
        return <p>Oops</p>

    return (
        <div className="table-container">
            <Row>
                <Col>
                    <h1>Mina uppgifter</h1>
                </Col>
                <Col style={{ textAlign: 'right'}}>
                    <h3>
                        {values.length} totalt, {completedCount} utförda, {bookedCount} bokade
                    </h3>
                </Col>
            </Row>
            <Table striped responsive='lg'>
                <thead>
                    <tr>
                        <th>Uppgift / Typ</th>
                        <th>Aktivitet / Typ</th>
                        <th>Tidpunkt</th>
                        <th>Status</th>
                        <th>Åtgärd</th>
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