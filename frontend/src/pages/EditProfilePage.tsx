import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { deserialize } from 'class-transformer';

import { Member, PagedMembers } from '../Models';
import DataProvider from '../components/DataProvider';
import { ProfileEditForm } from '../components/ProfileEditForm';



export const EditProfilePage = () => {
    const { id } = useParams();
    const [member, setMember] = useState<Member>();

    return <Container>
        <Row>
            <Col>
                {id
                    ? <DataProvider<PagedMembers>
                        url={Member.apiUrlForId(id)}
                        ctor={json => deserialize(PagedMembers, json)}
                        onLoaded={data => setMember(data.results[0])}>
                        <ProfileEditForm member={member} />
                    </DataProvider>
                    : <CreateProxy />
                }
            </Col>
        </Row>
    </Container>
}

const CreateProxy = () => {
    const [member, setMember] = useState(new Member());
    const history = useHistory();

    return <ProfileEditForm
        member={member}
        onSaved={m => {
            setMember(m);
            history.push(m.url());
        }}
    />
}