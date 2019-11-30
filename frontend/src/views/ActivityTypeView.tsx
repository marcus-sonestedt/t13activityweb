import React, { useState, useContext } from "react"
import { Container, Row, Col, Image, Button } from "react-bootstrap"
import { ActivityType, PagedActivityTypes } from "../Models"
import { useParams } from "react-router";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import NotFound from "../components/NotFound";
import { userContext } from "../App";

export const ActivityTypeComponent = (model: ActivityType | null) => {
    const user = useContext(userContext);

    if (model === null)
        return null;

    return (<>
        <div className="model-header">
            <a href={"../" + model.url()}><h2>{model.name}</h2></a>
            {user.isStaff ?
                <a href={model.adminUrl()}><Button variant='secondary'>Editera</Button></a>
                : null}
        </div>
        <hr />
        <h4>Beskrivning:</h4>
        <p>{model.description}</p>
    </>)
}

export const ActivityTypeView = () => {
    const { id } = useParams();
    const [model, setModel] = useState<ActivityType | null>(null);

    if (id === undefined)
        return <NotFound />

    return <Container>
        <Row>
            <Col md={12} lg={8}>
                <DataProvider<PagedActivityTypes>
                    ctor={t => deserialize(PagedActivityTypes, t)}
                    endpoint={ActivityType.apiUrl(id)}
                    onLoaded={x => setModel(x.results[0])}>
                    {model === null ? null :
                        <ActivityTypeComponent {...model} />
                    }
                </DataProvider>
            </Col>
            <Col md={12} lg={4}>
                {model !== null ? <Image src={model.image} /> : null}
            </Col>
        </Row>
    </Container>
}

export default [ActivityTypeView, ActivityTypeComponent];
