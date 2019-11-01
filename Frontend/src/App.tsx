import './App.css';
import React, { Component } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { Navigation } from './components/Navigation'
import { Welcome } from './components/Welcome'
import { Home } from './components/Home'
import { BrowserRouter, Switch, Route, Link, Redirect, useLocation } from 'react-router-dom';

class AppState {
  constructor(token: string|null) {
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
    console.log(loggedIn);
    return (
      <BrowserRouter>
        <Navigation visible={loggedIn} onLoggedOut={this.onLogout} />
        {!loggedIn ?
          <Switch>
            <Route path="/welcome">
              <Welcome onLoggedIn={this.onLogin} />
            </Route>
            <Redirect to="/welcome" />
          </Switch>
          :
          <Switch>
            <Redirect from="/welcome" to="/home" />
            <Route exact path="/">
              <Redirect to={loggedIn ? "/home" : "/welcome"} />
            </Route>
            <Route path="/home">
              <Home loginToken={this.state.loginToken as string} />
            </Route>
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
        }
        <Footer />
      </BrowserRouter >
    );
  }
}

const NoMatch = () => {
  const location = useLocation();
  return <div>
    <h3>Oops. Route {location.pathname} has no match</h3>
    <p>Go back or <Link to="/home">home</Link>.</p>
  </div>
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Row className="footer">
      <Col sm={12} lg={6} className="text-center">

        <p>Copyright &copy; Team13 GKRC and Marcus Sonestedt, 2019-{currentYear}.</p>
      </Col>
      <Col sm={12} lg={6}>
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
