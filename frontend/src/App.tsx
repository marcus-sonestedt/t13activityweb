import './App.css';
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Navigation } from './components/Navigation'
import { Home } from './components/Home'
import { Welcome } from './components/Welcome'
import { NotFound } from './components/NotFound'

interface LoginState {
  isLoggedIn:boolean;
  isStaff:boolean;
}

const loggedOutState = {isLoggedIn:false,isStaff:false} as LoginState;

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const setState = (state:LoginState) => {
    setIsLoggedIn(state.isLoggedIn);
    setIsStaff(state.isStaff);
  }

  useEffect(() => {
    fetch('/api/isloggedin')
      .then(
        r => r.status === 200 ? r.json() : undefined,
        r => {
          console.log(r);
          setState(loggedOutState);
        })
      .then(json => {
        console.log(json);
        if (json !== undefined)
          setState({isLoggedIn: json.isLoggedIn, isStaff: json.isStaff});
        else
          setState(loggedOutState);
      });
  }, [isLoggedIn, isStaff]);

  return (
      <BrowserRouter>
        <Navigation visible={isLoggedIn} isStaff={isStaff} />
        <Container>
          <p>{isLoggedIn}</p>
          <Switch>
            <Redirect exact from="/" to="/frontend/" />
            {!isLoggedIn ?
              <>
                <Route path="/frontend/welcome">
                  <Welcome/>
                </Route>
                <Redirect to="/frontend/welcome" />
              </>
              :
              <>
                <Redirect exact from="/frontend/" to="/frontend/home" />
                <Redirect exact from="/frontend/welcome" to="/frontend/home" />
                <Route path="/frontend/home">
                  <Home/>
                </Route>
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
