import { useParams } from "react-router"
import React, { useState, useCallback, useContext } from "react";
import { Member, PagedMembers } from "../Models";
import { Container, Row, Col, Image, Button } from "react-bootstrap";
import DataProvider from "../components/DataProvider";
import { deserialize } from "class-transformer";
import NotFound from "../components/NotFound";
import { userContext } from "../components/UserContext";

export const MemberComponent = (props: { member?: Member }) => {
    const { member } = props;
    const user = useContext(userContext);

    if (!member || !user.isLoggedIn)
        return null;

    return <div>
        <h3>Namn: {member.fullname}</h3>
        <h4>Email:{' '}
            <a href={`mailto:${member.email}`}>{member.email}</a>
        </h4>
        <h4>Telefon:{' '}
            <a href={`tel:${member.phone_number}`}>{member.phone_number}</a>
        </h4>
        {member.image_url === undefined ? null :
            <Image src={member.image_url} />
        }
    </div>
}

export const MemberPage = () => {
    const { id } = useParams();
    const user = useContext(userContext);
    const [member, setMember] = useState<Member | undefined>();
    const setMemberCallback = useCallback((data: PagedMembers) => setMember(data.results[0]), []);

    if (id === undefined)
        return <NotFound />

    if (!user.isLoggedIn)
        return <NotFound />

    return (
        <Container>
            <Row>
                <Col>
                    <div className="model-header">
                        <h1>Medlem</h1>
                        {user.isStaff ?
                            <a href={Member.adminUrlForId(id)}><Button variant='outline-secondary'>Editera</Button></a>
                            : null}
                    </div>
                    <hr />
                    <DataProvider<PagedMembers>
                        url={Member.apiUrlForId(id)}
                        ctor={json => deserialize(PagedMembers, json)}
                        onLoaded={setMemberCallback}>
                        <MemberComponent member={member} />
                    </DataProvider>
                </Col>
            </Row>
        </Container>
    )
}