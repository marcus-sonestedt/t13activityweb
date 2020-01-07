import React, { useState } from "react"
import { Container, Row, Col, Table, Pagination } from "react-bootstrap"
import { deserialize } from "class-transformer";

import { PagedEventTypes, T13EventType } from "../Models";
import DataProvider from "../components/DataProvider";
import { PageItems } from "../components/Utilities";

import "../components/Table.css"

export const EventTypesPage = () => {
    const [data, setData] = useState<PagedEventTypes>(new PagedEventTypes());
    const [page, setPage] = useState(1);

    const renderRow = (model: T13EventType) => {
        return <tr>
            <td><a href={model.url()}>{model.name}</a></td>
            <td>{model.description}</td>
        </tr>
    }

    return <Container className="table-container">
        <Row>
            <Col md={12}>
                <DataProvider<PagedEventTypes>
                    ctor={json => deserialize(PagedEventTypes, json)}
                    url={T13EventType.apiUrlAll() + `?page=${page}`}
                    onLoaded={setData}>
                    <h1>
                        <span className="table-title">Aktivitetstyper</span>
                        <span className="table-count">
                            {data.results.length}/{data.count} st
                        </span>
                    </h1>
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
                        <PageItems count={data.count} pageSize={10} currentPage={page} setFunc={setPage}/>
                    </Pagination>
                </DataProvider>
            </Col>
        </Row>
    </Container>
}
export default EventTypesPage;