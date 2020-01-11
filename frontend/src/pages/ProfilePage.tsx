import React, { useContext, useState, useCallback } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import { userContext } from "../components/UserContext";
import DataProvider from "../components/DataProvider";
import { Member, PagedMembers } from "../Models";
import { deserialize } from "class-transformer";
import { MemberComponent } from "./MemberPage";
import NotFound from "../components/NotFound";

export const ProfilePage = () => {
    const user = useContext(userContext);
    const [member, setMember] = useState<Member | undefined>();
    const setMemberCallback = useCallback((data: PagedMembers) => setMember(data.results[0]), []);

    if (!user.isLoggedIn)
        return <NotFound />

    return <Container>
        <Row>
            <Col>
                <h1>Min profil</h1>
                <DataProvider<PagedMembers>
                    url={Member.apiUrlForId(user.memberId)}
                    ctor={json => deserialize(PagedMembers, json)}
                    onLoaded={setMemberCallback}>
                    <MemberComponent member={member} />
                    <h4>Roll: {user.isStaff ? 'Personal' : 'Medlem'}</h4>
                </DataProvider>
            </Col>
            <Col>
                <h2>Inställningar</h2>
                <a href="/app/change_password/">
                    <Button>Ändra lösenord</Button>
                </a>
            </Col>
        </Row>
    </Container>
}

export default ProfilePage;