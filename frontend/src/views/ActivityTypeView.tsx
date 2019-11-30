import React, { useState } from "react"
import { Container, Row, Col, Image, Button } from "react-bootstrap"
import { ActivityType, PagedActivityTypes } from "../Models"
import { useParams } from "react-router";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";

export const ActivityTypeComponent = (model: ActivityType | null) => {
    if (model === null)
        return null

    return (<>
        <div className="model-header">
            <a href={"../" + model.url()}><h2>{model.name}</h2></a>
            <a href={model.adminUrl()}><Button>Editera</Button></a>
        </div>
        <hr/>
        <p>{model.description}</p>
    </>)
}

export const ActivityTypeView = () => {
    const { id } = useParams();
    const [model, setModel] = useState<ActivityType | null>(null);

    if (model === null || id === undefined)
        return null

    return <Container>
        <Row>
            <Col md={12} lg={8}>
                <DataProvider<PagedActivityTypes>
                    ctor={t => deserialize(PagedActivityTypes, t)}
                    endpoint={ActivityType.apiUrl(id)}
                    onLoaded={x => setModel(x.results[0])}>
                    <ActivityTypeComponent {...model} />
                </DataProvider>
            </Col>
            <Col md={12} lg={4}>
                {model !== null ? <Image src={model.image} /> : null}
            </Col>
        </Row>
    </Container>
}

export default [ActivityTypeView, ActivityTypeComponent];
