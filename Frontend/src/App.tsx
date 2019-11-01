import './App.css';
import React, { Component } from "react";
import { Row, Col } from 'react-bootstrap'
import { Navigation } from './components/Navigation'
import { Welcome } from './components/Welcome'
import { Home } from './components/Home'
import { BrowserRouter, Switch, Route, Link, Redirect, useLocation } from 'react-router-dom';

class AppState {
  loginToken: string | null = null;
}

class App extends Component<{}, AppState> {

  state = new AppState();

  componentDidMount = () => {
    document.title = "Team13 Aktivitetswebb"
  }

  onLogin = (token: string) => {
    this.setState({ loginToken: token });
  }

  onLogout = () => {
    this.setState({ loginToken: null });
  }

  render() {
    const loggedIn = this.state.loginToken !== null;

    return (
      <BrowserRouter>
        <Navigation loggedIn={loggedIn} onLoggedOut={this.onLogout} />
        <Switch>
          <Route path="/welcome">
            {loggedIn
              ? <Redirect to="/home" />
              : <Welcome onLoggedIn={this.onLogin} />
            }
          </Route>
          <Route path="/">
            <Redirect to={loggedIn ? "/home" : "/welcome"} />
          </Route>
          <Route path="/home">
            <Home loginToken={this.state.loginToken as string} />
          </Route>
          <Route path="/logout">
            <Redirect to="/" />
          </Route>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
        <Footer />
      </BrowserRouter>
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
          {'\u00A0'}<a href="https:///www.python.org">Python</a> by
          {'\u00A0'}<a href="https://github.com/marcusl">Marcus Sonestedt</a>.
        </p>
      </Col>
    </Row>
  );
}

export default App;
