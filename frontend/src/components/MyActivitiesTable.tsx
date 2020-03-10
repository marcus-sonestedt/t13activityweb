import React, { useContext, useMemo } from "react";
import { Table, Col, Row } from 'react-bootstrap'
import { useHistory } from "react-router-dom";

import { Activity } from '../Models';
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

    const bookedWeight = useMemo(() => values
        .filter(a => a.active_delist_request?.member !== user.memberId)
        .reduce((w, a) => w + a.weight, 0)
        , [values, user.memberId])

    const completedWeight = useMemo(() => values
        .filter(a => a.completed === true)
        .reduce((w, a) => w + a.weight, 0)
        , [values])

    if (values === undefined)
        return <p>Oops</p>

    const buttonClick = (f: () => Promise<void>) => (e: any) => {
        e.stopPropagation();
        f().then(reload);
    }

    const highlightActivityMatch = window.location.search.match(/[?&]highlight-task=([0-9]+)/);
    const highlightActivityId = highlightActivityMatch ? highlightActivityMatch[1] : undefined;

    const renderRow = (activity: Activity) => {
        const eventActive = activity.event.start_date >= today && activity.event.end_date <= today;
        const eventInPast = activity.event.end_date < today;

        const rowClick = (e: any) => {
            if (e.target?.tagName === 'A')
                return

            e.preventDefault();
            history.push(activity.url());
        }

        const [text, tooltip, emoji, emojiLabel] =
            eventActive
                ? ['Aktiv', 'Uppgiften pågår!', '🎉', 'party-popper']
                : !eventInPast
                    ? ['', '', '', '']
                    : activity.completed === null
                        ? ["Obekräftad", "Din närvaro har inte bekräftats än.", '📒', 'ledger']
                        : activity.completed === true
                            ? ["Utförd", "Bra jobbat", '🏆', 'cup']
                            : ["Missad", "Du missade din uppgift! Du behöver boka en ny!", '😨', 'ohno']

        const rowClassName = 'clickable-row ' + (activity.id.toString() === highlightActivityId ? 'active' : '');

        const myADR = activity.active_delist_request?.member === user.memberId;

        const canRequestUnlist = !user.hasMemberCard || (bookedWeight - activity.weight) >= user.minSignups

        return {
            row: (children: JSX.Element[]) =>
                <tr key={activity.id} className={rowClassName} onClick={rowClick}>
                    {children}
                </tr>,
            td: [
                <td>
                    <a href={activity.url()}>{activity.name}</a>
                    <br />
                    {activity.type !== null
                        ? <a href={activity.type.url()} style={{ fontWeight: 'normal' }}>{activity.type.name}</a>
                        : null}
                </td>,
                <td>
                    <a href={activity.event.url()} style={{ fontWeight: 'bold' }}>{activity.event.name}</a>
                    <br />
                    {activity.event.type !== null
                        ? <a href={activity.event.type.url()}>{activity.event.type.name}</a>
                        : null}
                </td>,
                <td className='nowrap'>
                    <b>{activity.date()}</b>
                    <br />
                    {activity.time()}
                </td>,
                <td>{(eventInPast || eventActive)
                    ? <HoverTooltip tooltip={tooltip}>
                        <span>{text} <span role="img" aria-label={emojiLabel}>{emoji}</span></span>
                    </HoverTooltip>
                    : (myADR && activity.active_delist_request)
                        ? <a href={activity.active_delist_request.url()}>Avbokningsfråga inlagd</a>
                        : <b>Bokad</b>
                }
                    <div>Värde: {activity.weight}</div>
                </td>,
                <td>
                    {myADR
                        ? <CancelAdrButton onClick={buttonClick(() => cancelADRByActivity(activity.id))} />
                        : <RequestAdrButton onClick={buttonClick(() => createADR(activity, user))} disabled={!canRequestUnlist} />
                    }
                </td>
            ]
        }
    }


    const renderMyRow = (activity: Activity) => {
        const r = renderRow(activity);
        return r.row(r.td);
    }

    const renderProxyRow = (activity: Activity) => {
        const r = renderRow(activity);
        const proxy = <td><a href={activity.assigned?.url()}>{activity.assigned?.fullname}</a></td>
        return r.row([proxy].concat(r.td));
    }

    const tableHeaders = <>
        <th>Uppgift / Typ</th>
        <th>Aktivitet / Typ</th>
        <th>Tidpunkt</th>
        <th>Status</th>
        <th>Åtgärd</th>
    </>

    var myTasks = values
        .filter(a => a.assigned?.id === user.memberId)
        .sort((a, b) => a.date < b.date ? 1 : 0)
        .map(renderMyRow)

    var myProxiesTasks = values
        .filter(a => a.assigned?.id !== user.memberId)
        .sort((a, b) => a.date < b.date ? 1 : 0)
        .map(renderProxyRow)

    var r =
        [<Row>
            <Col>
                <h2>Mina egna uppgifter</h2>
            </Col>
            <Col style={{ textAlign: 'right' }}>
                <h3>
                    {values.length} uppgift(er), {completedWeight} utfört värde, {bookedWeight} bokat värde
                </h3>
            </Col>
        </Row>,
        <Row><Col><Table striped responsive='lg'>
            <thead><tr>
                {tableHeaders}
            </tr></thead>
            <tbody>
                {myTasks}
            </tbody>
        </Table></Col></Row>
        ]

    if (user.hasProxies) {
        r.push(<Row><Col><h2>Mina underhuggares uppgifter</h2></Col></Row>)
        r.push(<Row><Col><Table striped responsive='lg'>
            <thead><tr>
                <th>Namn</th>
                {tableHeaders}
            </tr></thead>
            <tbody>
                {myProxiesTasks}
            </tbody>
        </Table></Col></Row>)
    }

    return <div className="table-container">
        {r}
    </div>

}