import './App.css';
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { BrowserRouter, Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation'
import { MemberHomeView } from './views/MemberHomeView'
import { Welcome } from './views/WelcomeView'
import { EventView } from './views/EventView'
import { NotFound } from './components/NotFound'
import { ActivityView } from './views/ActivityView';
import { EventTypeView } from './views/EventTypeView';
import { ActivityTypeView } from './views/ActivityTypeView';
import { MemberView } from './views/MemberView';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    fetch('/api/isloggedin')
      .then(
        r => r.status === 200 ? r.json() : undefined,
        r => {
          console.error(r);
          setIsLoggedIn(false);
        })
      .then(json => {
        if (json !== undefined) {
          setIsStaff(json.isStaff as boolean);
          setIsLoggedIn(json.isLoggedIn as boolean);
        }
        else {
          setIsLoggedIn(false);
        }
      });

    return;
  }, []);

  return (
    <BrowserRouter>
      <Navigation loggedIn={isLoggedIn} isStaff={isStaff} />
      <pre>{isLoggedIn}</pre>
      <Switch>
        <Redirect exact from="/" to="/frontend/" />
        <Route path="/frontend/event/:id" component={EventView} />
        <Route path="/frontend/activity/:id" component={ActivityView} />
        <Route path="/frontend/event_type/:id" component={EventTypeView} />
        <Route path="/frontend/activity_type/:id" component={ActivityTypeView} />
        <Redirect2 from="/frontend/member/:id" toFunc={(url:string) => `/app/login?next=${url}`} />

        {!isLoggedIn ?
          <>
            <Route path="/frontend/welcome" component={Welcome} />
            <Redirect to="/frontend/welcome" />
          </>
          :
          <>
            <Redirect exact from="/frontend/" to="/frontend/home" />
            <Redirect exact from="/frontend/welcome" to="/frontend/home" />
            <Route path="/frontend/home" component={MemberHomeView} />
            <Route path="/frontend/member/:id" component={MemberView} />
          </>
        }
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </BrowserRouter >
  );
}

export const Redirect2 = (props:{from:string, toFunc:(url:string) => string}) => {
  const location = useLocation();
  const to = props.toFunc(location.pathname);
  return <Redirect from={props.from} to={to}/>
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Container fluid>
      <Row className="fixed-bottom footer">
        <Col>
          <p>Copyright &copy; Team13 GKRC and Marcus Sonestedt, {currentYear}.</p>
        </Col>
        <Col>
          <p>
            Developed with <a href="https://reactjs.org">React</a> and
          {'\u00A0'}<a href="https:///www.djangoproject.com">Django</a> by
          {'\u00A0'}<a href="https://github.com/marcusl">Marcus Sonestedt</a>.
        </p>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
