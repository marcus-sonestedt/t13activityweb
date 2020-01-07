import './App.css';
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Alert } from 'react-bootstrap'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { deserialize } from 'class-transformer';
import CookieConsent from "react-cookie-consent";


import { Navigation } from './components/Navigation'
import { MainPage } from './pages/MainPage'
import { WelcomePage } from './pages/WelcomePage'
import { EventPage } from './pages/EventPage'
import { NotFound } from './components/NotFound'
import { ActivityPage } from './pages/ActivityPage';
import { EventTypePage } from './pages/EventTypePage';
import { ActivityTypePage } from './pages/ActivityTypePage';
import { MemberPage } from './pages/MemberPage';
import { ActivityDelistRequestPage } from './pages/ADRPage';
import { EventTypesPage } from './pages/EventTypesPage';
import { ActivityTypesPage } from './pages/ActivityTypesPage';
import FAQPage from './pages/FAQPage';
import ProfilePage from './pages/ProfilePage';
import { UserContext, UserProvider } from './components/UserContext';
import VerifyPhonePage from './pages/VerifyPhonePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { NotificationsPage } from './pages/NotificationsPage';

export const App = () => {
  const userJson = localStorage.getItem("user");
  const user = userJson !== null ? deserialize(UserContext, userJson) : new UserContext()
  const [state, setState] = useState<UserContext>(user);

  useEffect(() => {
    fetch('/api/isloggedin')
      .then(
        r => {
          if (r.status === 200)
            return r.json()
          else
            throw r.statusText
        },
        err => { throw err }
      )
      .then(json => {
        if (json !== undefined) {
          setState(json as UserContext);
          localStorage.setItem('user', JSON.stringify(json))
        }
      }).catch(e => {
        console.error(e);
        setState(new UserContext());
        localStorage.removeItem('user');
      })
  }, []);

  return (
    <UserProvider value={state}>
      <BrowserRouter>
        <header>
          <T13CookieConsent isLoggedIn={state.isLoggedIn} />
          <Navigation />
        </header>
        <main>
          <ErrorBoundary>
            <MainBody isLoggedIn={state.isLoggedIn} />
          </ErrorBoundary>
        </main>
        <Footer />
      </BrowserRouter >
    </UserProvider>
  );
}

const MainBody = (props: { isLoggedIn: boolean }) =>
  <Switch>
    <Redirect exact from="/" to="/frontend/" />
    <Route path="/frontend/event/:id/:name" component={EventPage} />
    <Route path="/frontend/activity/:id/:name" component={ActivityPage} />
    <Route path="/frontend/event_type/:id/:name" component={EventTypePage} />
    <Route path="/frontend/activity_type/:id/:name" component={ActivityTypePage} />

    <Route path="/frontend/activitytypes" component={ActivityTypesPage} />
    <Route path="/frontend/eventtypes" component={EventTypesPage} />
    <Route path="/frontend/faq/:id?" component={FAQPage} />

    <Route path="/frontend/member/:id" component={MemberPage} />
    <Route path="/frontend/delistrequest/:id?" component={ActivityDelistRequestPage} />

    {!props.isLoggedIn ?
      <>
        <Route path="/frontend/welcome" component={WelcomePage} />
        <Redirect to="/frontend/welcome" />
      </>
      :
      <>
        <Route path="/frontend/home" component={MainPage} />

        <Route path="/frontend/profile" component={ProfilePage} />
        <Route path="/frontend/notifications" component={NotificationsPage} />

        <Route path="/frontend/verify/phone" component={VerifyPhonePage} />
        <Route path="/frontend/verify/email/:initialState?" component={VerifyEmailPage} />

        <Route exact path="/frontend/" render={() => <Redirect to="/frontend/home" />} />
        <Route path="/frontend/welcome" render={() => <Redirect to="/frontend/home" />} />
        <Route path="/static/index.html" render={() => <Redirect to="/frontend/home" />} />
      </>
    }
    <Route component={NotFound} />
  </Switch>

const T13CookieConsent = (props: { isLoggedIn: boolean }) => {
  const { isLoggedIn } = props;

  if (!isLoggedIn)
    return null;

  return <CookieConsent buttonText="Okaj!">
    Den här webbplatsen använder cookies.{' '}
    <span style={{ fontSize: "small" }}>
      Vi behöver hålla koll på att du är inloggad och
      säkra kommandon till webbservern.
      </span>
  </CookieConsent>
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer mt-auto">
      <Container fluid>
        <Row className="my-footer">
          <Col lg={4} md={12}>
            <p>
              Copyright &copy; <a href="http://www.team13.se">Team13 GKRC</a>{' '}
              and <a href="https://mackeblog.blogspot.com">Marcus Sonestedt</a>{' '}
              2019-{currentYear}.
            </p>
          </Col>
          <Col lg={4} md={12}>
            <p>Running at <a href='https://eu.pythonanywhere.com'>eu.pythonanywhere.com</a>.</p>
          </Col>
          <Col lg={4} md={12}>
            <p>
              Developed with <a href="https://reactjs.org">React</a> and
              {' '}<a href="https:///www.djangoproject.com">Django</a> by
              {' '}<a href="https://github.com/marcusl">Marcus Sonestedt</a>.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

// see https://reactjs.org/docs/error-boundaries.html
class ErrorBoundary extends React.Component<{}, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    //console.error(error);
    //console.error(errorInfo);

    // You can also log the error to an error reporting service
    //logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errStr = this.state.error == null ? '' : this.state.error.toString();

      // You can render any custom fallback UI
      return <Container>
        <Row className="justify-content-md-center">
          <Col md='12' lg='5'>
            <h1>Något gick snett! <span role="img" aria-label="sadface">😥</span></h1>
            <Alert variant='danger'>{errStr}</Alert>
          </Col>
          <Col md='12' lg='3'>
            <Image src='/static/brokenpiston.jpg' alt="Broken piston" fluid />
          </Col>
        </Row>
      </Container>
    }

    return this.props.children;
  }
}

export default App;
