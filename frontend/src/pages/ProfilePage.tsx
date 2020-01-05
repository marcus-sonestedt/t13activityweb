import React, { useContext, useState, useCallback } from "react"
import { Container, Row, Col } from "react-bootstrap"
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
        return <NotFound/>

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
                <p>Arbete pågår</p>
            </Col>
        </Row>
    </Container>
}

export default ProfilePage;