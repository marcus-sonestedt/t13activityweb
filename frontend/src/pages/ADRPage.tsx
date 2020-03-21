import { deserialize } from "class-transformer";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { Badge, Button, Col, Container, Pagination, Row, Table } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import DataProvider from "../components/DataProvider";
import { userContext } from "../components/UserContext";
import { HoverTooltip, MarkDown, PageItems } from '../components/Utilities';
import { approveADR, cancelADR, deleteADR, rejectADR } from "../logic/ADRActions";
import { Activity, ActivityDelistRequest, Member, PagedADR } from '../Models';
import '../components/Table.css'

export const RequestAdrButton = (props: {
    onClick: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void),
    disabled: boolean
}) => {
    const user = useContext(userContext);

    const onSpanClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (props.disabled) e.stopPropagation();
    }

    const onButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        props.onClick(e);
    }

    return (
        <HoverTooltip placement='bottom'
            tooltip={!props.disabled
                ? "Skapa en förfrågan om att att avboka dig från uppgiften"
                : "Du kan inte begära att avboka dig då du skulle få mindre än "
                + `${user.minSignups} uppgifter om det godkändes.`}>
            <span className="d-inline-block" onClick={onSpanClick}>
                <Button variant='outline-danger' size='sm' disabled={props.disabled}
                    onClick={onButtonClick} style={{ pointerEvents: props.disabled ? 'none' : 'auto' }}>
                    Avboka?
                </Button>
            </span>
        </HoverTooltip>
    );
}

export const CancelAdrButton = (props: { onClick: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) }) =>
    <HoverTooltip placement='bottom'
        tooltip='Avbryt din begäran att avboka och återta dig uppgiften.'>
        <Button variant='outline-warning' size='sm' onClick={props.onClick}>
            Återta
        </Button>
    </HoverTooltip>

export const DeleteAdrButton = (props: { onClick: ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) }) =>
    <HoverTooltip placement='bottom'
        tooltip='Radera denna avbegäran.'>
        <Button variant='outline-secondary' size='sm' onClick={props.onClick}>
            Radera
        </Button>
    </HoverTooltip>

const AdrStatusBadge = (props: { model: ActivityDelistRequest }) => {
    const approved = props.model.approved
    const [text, variant] =
        approved === true ? ['Bekräftad', 'success']
            : approved === false ? ['Avvisad', 'danger']
                : ['Obekräftad', 'dark'];

    return <Badge variant={variant as any}>{text}</Badge>
}

export const ActivityDelistRequestComponent = (props: { model?: ActivityDelistRequest | null }) => {
    const { model } = props;
    const user = useContext(userContext);

    if (!model)
        return null

    if (!(model.activity instanceof Activity))
        return <p>Datafel, saknar uppgift</p>

    if (!(model.member instanceof Member))
        return <p>Datafel, saknar medlem</p>

    const approver = (model.approver instanceof Member) ?
        <span>
            /<a href={model.approver.url()}>{model.approver.fullname}</a>
        </span>
        : null;

    const remainingWeight = (model.member.booked_weight ?? 0) - (model.activity ?.weight ?? 1)

    return (
        <>
            <div className='clearfix'>
                <h4 className=' float-left'>
                    Status: <AdrStatusBadge model={model} />
                </h4>
                <div className='float-right'>
                    {!user.isStaff ? null :
                        <Button variant='outline-secondary' href={model.adminUrl()} size='sm'>
                            Editera förfrågan
                    </Button>}
                </div>
            </div>
            <div className='clearfix'>
                <h5 className='float-left'>Medlem</h5>
                {user.isStaff ?
                    <Button className='float-right' variant='outline-secondary' href={model.member.adminUrl()} size='sm'>
                        Editera medlem
                    </Button>
                    : null}
            </div>
            <p>
                <a href={model.member.url()}>{model.member.fullname}</a>
                {' - '}
                <a href={`tel:${model.member.phone_number}`}>{model.member.phone_number}</a>
                {' - '}
                <a href={`mailto:${model.member.email}`}>{model.member.email}</a>
            </p>
            {!user.isStaff ? null :
                <p>
                    <span style={{ opacity: 0.7 }}>
                        Bokade uppgifter exkl. denna:
                    </span>
                    {' '}
                    <b>
                        {remainingWeight} / {user.minSignups}
                    </b>
                    {' '}
                    <span style={{ fontSize: 'x-large' }}>
                        {remainingWeight >= user.minSignups
                            ? <Badge variant='success'>OK</Badge>
                            : <Badge variant='danger'>UNDER GRÄNS</Badge>
                        }
                    </span>
                </p>
            }
            <h5>Uppgift / Aktivitet / Värde</h5>
            <p>
                <a href={model.activity.url()}>{model.activity.name}</a>
                {' - '}
                <a href={model.activity.event.url()}>{model.activity.event.name}</a>
                {' - '}
                <b>
                    {model.activity.weight}
                </b>
            </p>
            <p>Kommentar</p>
            <p style={{ opacity: 0.7 }}>
                {model.activity.comment}
            </p>
            <h5>Anledning</h5>
            <MarkDown source={model.reason} />
            {model.approved !== false ? null : <>
                <MarkDown source={model.reject_reason ?? ''} />
                <p>/{approver}</p>
            </>}
        </>
    )
}

export const ActivityDelistRequestsComponent = () => {
    const user = useContext(userContext);
    const history = useHistory();

    const highlightMatch = window.location.search.match(/[?&]highlight=([0-9]+)/);
    const highlightId = highlightMatch ? highlightMatch[1] : null;

    const [requests, setRequests] = useState<PagedADR>();
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(1);

    const currentReq = requests?.results.find(r => r.id.toString() === highlightId) ?? null;
    console.log(highlightId)
    console.log(currentReq?.id)

    const incReload = useCallback(() => setReload(reload + 1), [reload])
    const loadedHandler = useCallback(setRequests, [reload]);

    const adrTable = useMemo(() => {
        const setHighlightId = (id?: string) => { id ? history.replace(`?tab=my-adrs&highlight=${id}`) : history.replace('?tab=my-adrs') }

        const memberMatch = (r: ActivityDelistRequest) => {
            if (!(r.member instanceof Member))
                return false;
            return r.member.id === user.memberId;
        }

        const approverMatch = (r: ActivityDelistRequest) => {
            if (!(r.approver instanceof Member))
                return false;
            return r.approver.id === user.memberId;
        }

        const myUnansweredRequests = requests ?.results.filter(r => memberMatch(r) && r.approved === null)
        const myAnsweredRequests = requests ?.results.filter(r => memberMatch(r) && r.approved !== null)
        const unhandledRequests = requests ?.results.filter(r => !memberMatch(r) && r.approved === null)
        const myHandledRequests = requests ?.results.filter(r => !memberMatch(r) && approverMatch(r))

        const delistRequestsTable = (requests?: PagedADR) => {
            if (!requests)
                return null;

            const rowClicked = (e: any, request: ActivityDelistRequest) => {
                if (e.target === null || e.target['tagName'] === 'A')
                    return
                setHighlightId(request.id);
            }

            const renderRow = (request: ActivityDelistRequest) => {
                const cancelClicked = () => {
                    setHighlightId(request.id);
                    setTimeout(() =>
                        cancelADR(request).then(() => {
                            setHighlightId(undefined);
                            incReload();
                        }, incReload), 10);
                }

                const deleteClicked = () => deleteADR(request).then(() => window.location.reload());

                if (!(request.member instanceof Member) || !(request.activity instanceof Activity))
                    return null;

                return <tr key={request.id} onClick={e => rowClicked(e, request)}
                    className={`clickable-row ${request.id === currentReq?.id ? 'active' : ''}`}>
                    <td>
                        {request.activity.assigned_for_proxy
                            ? <>
                                <a href={request.member.url()}>{request.member.fullname}</a>
                                <br />
                                <span style={{ fontWeight: 'normal' }}>Via: </span>
                                <a href={request?.activity?.assigned?.url() ?? 'x'}>{request?.activity?.assigned?.fullname}</a>
                            </>
                            : <a href={request.member.url()}>{request.member.fullname}</a>}
                    </td>
                    <td>
                        <a href={request.activity.event.url()}>{request.activity.event.name}</a>
                        <br />
                        <a href={request.activity.url()}>{request.activity.name}</a>
                    </td>
                    <td>
                        {request.activity.event.date()}
                        <br />
                        <b>Värde: {request.activity.weight}</b>
                    </td>
                    <td>
                        <h4><AdrStatusBadge model={request} /></h4>
                    </td>
                    <td>{request.member.id === user.memberId && request.approved !== true
                        ? <CancelAdrButton onClick={cancelClicked} />
                        : <DeleteAdrButton onClick={deleteClicked} />}
                    </td>
                </tr>
            }

            const Separator = (props: { title: string }) =>
                <tr><td colSpan={10}>
                    <h5>{props.title}</h5>
                </td></tr>

            return <Table hover striped>
                <thead>
                    <tr>
                        <th>Medlem/Underhuggare</th>
                        <th>Aktivitet/Uppgift</th>
                        <th>Datum/Värde</th>
                        <th>Status</th>
                        <th>Åtgärd</th>
                    </tr>
                </thead>
                <tbody>
                    <Separator title={`Mina obesvarade avbokningar (${myUnansweredRequests ?.length})`} />
                    {myUnansweredRequests ?.map(renderRow)}
                    <Separator title={`Mina besvarade avbokningar (${myAnsweredRequests ?.length})`} />
                    {myAnsweredRequests ?.map(renderRow)}
                    {!user.isStaff ? null : <>
                        <Separator title={`Obesvarade avbokningar (${unhandledRequests ?.length})`} />
                        {unhandledRequests ?.map(renderRow)}
                        <Separator title={`Besvarade avbokningar (${myHandledRequests ?.length})`} />
                        {myHandledRequests ?.map(renderRow)}
                    </>}
                </tbody>
            </Table>
        }

        return delistRequestsTable(requests)
    }, [requests, user, currentReq, incReload, history]);

    const url = useMemo(() => `${ActivityDelistRequest.apiUrlAll()}?page=${page}`, [page])

    return (
        <Row>
            <Col md={12} lg={7}>
                <h2>Avbokningar</h2>
                <Pagination>
                    <PageItems count={requests ? requests.count : 0}
                        pageSize={10} currentPage={page} setFunc={setPage} />
                </Pagination>
                <DataProvider url={url}
                    ctor={json => deserialize(PagedADR, json)}
                    onLoaded={loadedHandler}>
                    {adrTable}
                </DataProvider>
            </Col>
            <Col md={12} lg={5}>
                <h2>Detaljer</h2>
                <div className="div-group">
                    {currentReq === null
                        ? <p>Välj en avbokning att visa</p>
                        : <ActivityDelistRequestComponent model={currentReq} />}
                    {(currentReq === null || !user.isStaff) ? null :
                        <div className='align-right'>
                            {' '}
                            <ApproveAdrButton onClick={() => approveADR(currentReq, user).then(incReload)}
                                disabled={currentReq.approved === true} />
                            {' '}
                            <RejectAdrButton onClick={() => rejectADR(currentReq, user).then(incReload)}
                                disabled={currentReq.approved === false} />
                        </div>
                    }
                </div>
            </Col>
        </Row>
    )
}

export const ActivityDelistRequestsPage = () => {
    return <Container fluid>
        <ActivityDelistRequestsComponent />
    </Container>
}

const ApproveAdrButton = (props: { onClick: (e: any) => Promise<void>, disabled: boolean }) =>
    <HoverTooltip tooltip=
        {'Godkänn avbokningen och frigör medlemmen från sitt åtagande.' +
            'Uppgiften kommer inte ha någon medlem tilldelad efter detta.'}>
        <span className="d-inline-block">
            <Button variant='success' onClick={props.onClick} disabled={props.disabled}
                style={{ pointerEvents: props.disabled ? 'none' : 'auto' }}>
                Godkänn
            </Button>
        </span>
    </HoverTooltip>

const RejectAdrButton = (props: { onClick: (e: any) => Promise<void>, disabled: boolean }) =>
    <HoverTooltip tooltip={
        'Avvisa denna avbokningsförfrågan. Du behöver ange en anledning' +
        'till varför du inte godtar anledningen som medlemmen angivit.'}>
        <span className="d-inline-block">
            <Button variant='danger' onClick={props.onClick} disabled={props.disabled}
                style={{ pointerEvents: props.disabled ? 'none' : 'auto' }}>
                Avvisa
            </Button>
        </span>
    </HoverTooltip>


