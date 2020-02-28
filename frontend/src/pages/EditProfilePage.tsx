import React, { useState, useCallback } from 'react';
import { deserialize } from 'class-transformer';
import { Col, Container, Row, Alert } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';

import DataProvider from '../components/DataProvider';
import { ProfileEditForm } from '../components/ProfileEditForm';
import { Member, PagedMembers } from '../Models';

export const EditProfilePage = () => {
    const { id } = useParams();
    const [member, setMember] = useState<Member>();
    const onLoaded = useCallback(data => setMember(data.results[0]), []);

    return <Container>
        <Row>
            <Col>
                {id
                    ? <DataProvider<PagedMembers>
                        url={Member.apiUrlForId(id)}
                        ctor={json => deserialize(PagedMembers, json)}
                        onLoaded={onLoaded}>
                        <ProfileEditForm member={member} />
                    </DataProvider>
                    : <CreateProxy />
                }
            </Col>
        </Row>
    </Container>
}

const CreateProxy = () => {
    const [error, setError] = useState<string>();
    const history = useHistory();

    return <>
        <ProfileEditForm
            member={new Member()}
            onSaved={m => history.push(`/frontend/myproxies?highlight=${m.id}`)}
            onError={setError}
        />
        {error ?
            <div>
                <br/>
                <h4>Ooops. Något fick fel! :(</h4>
                <Alert variant='danger'>
                    {error.includes("<!DOCTYPE html>")
                        ? <div dangerouslySetInnerHTML={{ __html: error }} />
                        : <pre>{error}</pre>}
                </Alert>
            </div>
            : null}
    </>
}

