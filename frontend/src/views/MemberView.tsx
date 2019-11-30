import { useParams } from "react-router"
import React, { useState } from "react";
import { Member, PagedMembers } from "../Models";
import { Container, Row, Col, Image } from "react-bootstrap";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import NotFound from "../components/NotFound";

export const MemberView = () => {
    const { id } = useParams();
    const [member, setMember] = useState<Member | null>(null)

    if (id === undefined)
        return <NotFound/>

    return (
        <Container>
            <Row>
                <Col>
                    <DataProvider<PagedMembers>
                        endpoint={Member.apiUrl(id)}
                        ctor={t => deserialize(PagedMembers, t)}
                        onLoaded={x => setMember(x.results[0])}>
                        {member === null ? null :
                            <>
                                <h1>{member.fullname}</h1>
                                <h3>{member.email}</h3>
                                <h3>{member.phone}</h3>
                                {member.image_url === null ? null :
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