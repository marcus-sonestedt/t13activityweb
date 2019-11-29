import './App.css';
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Navigation } from './components/Navigation'
import { Home } from './components/Home'
import { Welcome } from './components/Welcome'
import { EventView } from './components/EventView'
import { NotFound } from './components/NotFound'

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
  },  []);

  return (
      <BrowserRouter>
        <Navigation visible={isLoggedIn} isStaff={isStaff} />
        <Container>
          <pre>{isLoggedIn}</pre>
          <Switch>
            <Redirect exact from="/" to="/frontend/" />
            {!isLoggedIn ?
              <>
                <Route path="/frontend/welcome" component={Welcome}/>
                <Redirect to="/frontend/welcome" />
              </>
              :
              <>
                <Redirect exact from="/frontend/" to="/frontend/home" />
                <Redirect exact from="/frontend/welcome" to="/frontend/home" />
                <Route path="/frontend/home" component={Home}/>
                <Route path="/frontend/event/:id" component={EventView}/>
                <Route path="/frontend/activity/:id" component={EventView}/>
                <Route path="/frontend/event_type/:id" component={EventView}/>
                <Route path="/frontend/activity_type/:id" component={EventView}/>
                <Route path="/frontend/member/:id" component={EventView}/>
              </>
            }
            <Route component={NotFound} />
          </Switch>
        </Container>
        <Footer />
      </BrowserRouter >
    );

}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Row className="fixed-bottom footer">
      <Col>
        <p>Copyright &copy; Team13 GKRC and Marcus Sonestedt, 2019-{currentYear}.</p>
      </Col>
      <Col>
        <p>
          Developed with <a href="https://reactjs.org">React</a> and
          {'\u00A0'}<a href="https:///www.djangoproject.com">Django</a> by
          {'\u00A0'}<a href="https://github.com/marcusl">Marcus Sonestedt</a>.
        </p>
      </Col>
    </Row>
  );
}

export default App;
