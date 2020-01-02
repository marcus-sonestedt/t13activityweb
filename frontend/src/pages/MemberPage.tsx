import { useParams } from "react-router"
import React, { useState, useCallback } from "react";
import { Member, PagedMembers } from "../Models";
import { Container, Row, Col, Image } from "react-bootstrap";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import NotFound from "../components/NotFound";

export const MemberPage = () => {
    const { id } = useParams();
    const [member, setMember] = useState<Member | null>(null)
    const setMemberCallback = useCallback((data:PagedMembers) => setMember(data.results[0]), []);

    if (id === undefined)
        return <NotFound/>

    return (
        <Container>
            <Row>
                <Col>
                    <DataProvider<PagedMembers>
                        url={Member.apiUrl(id)}
                        ctor={t => deserialize(PagedMembers, t)}
                        onLoaded={setMemberCallback}>
                        {member === null ? null :
                            <>
                                <h1>{member.fullname}</h1>
                                <h4>Email: <a href={`mailto:${member.email}`}>{member.email ?? '-'}</a></h4>
                                <h4>Telefon: {member.phone ?? '-'}</h4>
                                {member.image_url === undefined ? null :
                                    <Image src={member.image_url} />
                                }
                            </>
                        }
                    </DataProvider>
                </Col>
            </Row>
        </Container>
    )
}