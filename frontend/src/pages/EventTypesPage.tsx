import React, { useState } from "react"
import { Container, Row, Col, Table, Pagination } from "react-bootstrap"
import { deserialize } from "class-transformer";

import { PagedEventTypes, T13EventType } from "../Models";
import DataProvider from "../components/DataProvider";
import { PageItems, MarkDown } from '../components/Utilities';

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
        return <tr key={model.id}>
            <td><a href={model.url()}>{model.name}</a></td>
            <td style={{ textAlign: 'left' }}><MarkDown source={model.description} /></td>
        </tr>
    }

    const pageSize = 5;

    return <DataProvider<PagedEventTypes>
        ctor={json => deserialize(PagedEventTypes, json)}
        url={T13EventType.apiUrlAll() + `?page=${page}&page_size=${pageSize}`}
        onLoaded={setData}>
        <Row>
            <Col><h1>Aktivitetstyper</h1></Col>
            <h3 className="table-count">{data.results.length}/{data.count} st</h3>
            <Col style={{ textAlign: 'right' }}>
                <Pagination>
                    <PageItems count={data.count} pageSize={pageSize} currentPage={page} setFunc={setPage} />
                </Pagination>
            </Col>
        </Row>
        <Row>
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
        </Row>
    </DataProvider>

}

export default EventTypesPage;