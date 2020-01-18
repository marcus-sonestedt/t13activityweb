import React, { useState, useContext, useCallback } from "react"
import { Container, Row, Col, Image, Button } from "react-bootstrap"
import { useParams } from "react-router";
import { deserialize } from "class-transformer";

import { ActivityType, PagedActivityTypes } from '../Models';
import DataProvider from "../components/DataProvider";
import NotFound from "../components/NotFound";
import { userContext } from "../components/UserContext";
import { MarkDown, HoverTooltip } from '../components/Utilities';
import { Attachments } from "../components/AttachmentComponent";

export const Reimbursements = (props: { model?: ActivityType | null }) => {
    const { model } = props;
    if (!model) return null;

    return <span className='reimbursements'>
        {model.fee_reimbursed ?
            <HoverTooltip tooltip="Funktionärsersättning">
                <span role='img' aria-label='money'>💰</span>
            </HoverTooltip>
            : null}
        {model.food_included ?
            <HoverTooltip tooltip="Mat (frukost/lunch beroende på tid)">
                <span role='img' aria-label='food'>🍔</span>
            </HoverTooltip>
            : null}
        {model.rental_kart ?
            <HoverTooltip tooltip="Hyrkart efteråt">
                <span role='img' aria-label='racecar'>🏎</span>
            </HoverTooltip> : null}
    </span>
}

export const ActivityTypeComponent = (props: { model?: ActivityType | null }) => {
    const user = useContext(userContext);
    const { model } = props;

    if (model === undefined || model === null)
        return null

    return (<>
        <div className="model-header">
            <a href={model.url()}><h2>{model.name}</h2></a>
            {user.isStaff ?
                <a href={model.adminUrl()}><Button variant='outline-secondary'>Editera</Button></a>
                : null}
        </div>
        <hr />
        <div className="div-group">
            <h4>Beskrivning:</h4>
            <MarkDown source={model.description} />
            <h4>Ersättningar:</h4>
            <ul>
                {model.fee_reimbursed ? <li><span role='img' aria-label='money'>💰</span> Funktionärsersättning</li> : null}
                {model.food_included ? <li><span role='img' aria-label='food'>🍔</span> Mat</li> : null}
                {model.rental_kart ? <li><span role='img' aria-label='racecar'>🏎</span> Hyrkart</li> : null}
            </ul>
            {(!model.fee_reimbursed && !model.food_included && !model.rental_kart)
                ? <p>Inga extra ersättningar utöver guldkort ingår.</p> : null}
            <Attachments models={model.attachments} />
        </div>
    </>)
}

export const ActivityTypePage = () => {
    const { id } = useParams();
    const [model, setModel] = useState<ActivityType | null>(null);
    const setModelCallback = useCallback(x => setModel(x.results[0]), []);

    if (id === undefined)
        return <NotFound />


    return <Container>
        <Row>
            <Col md={12} lg={8}>
                <DataProvider<PagedActivityTypes>
                    ctor={json => deserialize(PagedActivityTypes, json)}
                    url={ActivityType.apiUrl(id)}
                    onLoaded={setModelCallback}>
                    <ActivityTypeComponent model={model} />
                </DataProvider>
            </Col>
            <Col md={12} lg={4}>
                {model !== null ? <Image src={model.image} /> : null}
            </Col>
        </Row>
    </Container>
}

export default [ActivityTypePage, ActivityTypeComponent];
