import React, { useState } from "react"
import { Container, Row, Col, Table, Pagination } from "react-bootstrap"
import { PagedActivityTypes, ActivityType } from "../Models";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import { pageItems } from "./MemberHomeView";

export const ActivityTypesView = () => {
    const [data, setData] = useState<PagedActivityTypes>(new PagedActivityTypes());
    const [page, setPage] = useState(1);

    const renderRow = (model: ActivityType) => {
        return <tr>
            <td><a href={model.url()}>{model.name}</a></td>
            <td>{model.description}</td>
        </tr>
    }

    return <Container className="table-container">
        <Row>
            <Col md={12}>
                <DataProvider<PagedActivityTypes>
                    ctor={json => deserialize(PagedActivityTypes, json)}
                    url={ActivityType.apiUrlAll() + `?page=${page}`}
                    onLoaded={setData}>
                    <h1>
                        <span className="table-title">Uppgiftstyper</span>
                        <span className="table-count">
                            ({data.results.length}/{data.count})
                        </span>
                    </h1>
                    <Table >
                        <thead>
                            <th>Namn</th>
                            <th>Beskrivning</th>
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
export default ActivityTypesView;