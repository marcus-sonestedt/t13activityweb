import React, { useState } from "react"
import { Container, Row, Col, Table, Pagination } from "react-bootstrap"
import { PagedEventTypes, T13EventType } from "../Models";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import { pageItems } from "./MemberHomeView";
import "../components/Table.css"

export const EventTypesView = () => {
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
                            ({data.results.length}/{data.count})
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
                        {pageItems(data.count, 10, page, setPage)}
                    </Pagination>
                </DataProvider>
            </Col>
        </Row>
    </Container>
}
export default EventTypesView;