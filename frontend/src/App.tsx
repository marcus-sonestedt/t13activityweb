import './App.css';
import React, { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Navigation } from './components/Navigation'
import { Home } from './components/Home'
import { Welcome } from './components/Welcome'
import { NotFound } from './components/NotFound'

class AppState {
  constructor(token: string | null) {
    this.loginToken = token
  } loginToken: string | null = null;
}

class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);
    this.state = new AppState(localStorage.getItem("login-token"));
  }

  onLogin = (token: string) => {
    this.setState({ loginToken: token });
    localStorage.setItem("login-token", token);
  }

  onLogout = () => {
    this.setState({ loginToken: null });
    localStorage.removeItem("login-token");
  }

  render() {
    const loggedIn = this.state.loginToken !== null;

    return (
      <BrowserRouter>
        <Navigation visible={loggedIn} onLoggedOut={this.onLogout} />
        <Container>
          <Switch>
            <Redirect exact from="/" to="/frontend/" />
            {!loggedIn ?
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
