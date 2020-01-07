import React, { useState } from "react"
import { Container, Row, Col, Table, Pagination } from "react-bootstrap"
import { deserialize } from "class-transformer";

import { PagedEventTypes, T13EventType } from "../Models";
import DataProvider from "../components/DataProvider";
import { PageItems } from "../components/Utilities";

import "../components/Table.css"

export const EventTypesPage = () => {

    return <Container className="table-container">
        <Row>
            <Col md={12}>
                <EventTypesComponent />
            </Col>
        </Row>
    </Container>
}

export const EventTypesComponent = () => {
    const [data, setData] = useState<PagedEventTypes>(new PagedEventTypes());
    const [page, setPage] = useState(1);

    const renderRow = (model: T13EventType) => {
        return <tr>
            <td><a href={model.url()}>{model.name}</a></td>
            <td>{model.description}</td>
        </tr>
    }

    return <DataProvider<PagedEventTypes>
        ctor={json => deserialize(PagedEventTypes, json)}
        url={T13EventType.apiUrlAll() + `?page=${page}`}
        onLoaded={setData}>
        <Row>
            <Col><h1>AktivitetsTyper</h1></Col>
            <Col style={{textAlign: 'right'}}><h3>{data.results.length}/{data.count} st</h3></Col>
        </Row>
        <Table >
            <thead>
                <tr>
                    <th>Namn</th>
                    <th>Beskrivning</th>
                </tr>
            </thead>
            <tbody>
                {data.results.map(renderRow)}
            </tbody>
        </Table>
        <Pagination>
            <PageItems count={data.count} pageSize={10} currentPage={page} setFunc={setPage} />
        </Pagination>
    </DataProvider>

}

export default EventTypesPage;