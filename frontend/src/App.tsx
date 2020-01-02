import './App.css';
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from 'react-bootstrap'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { deserialize } from 'class-transformer';
import CookieConsent from "react-cookie-consent";


import { Navigation } from './components/Navigation'
import { MyActiviesPage as MyActivitiesPage } from './pages/MyActivitiesPage'
import { WelcomePage } from './pages/WelcomePage'
import { EventPage } from './pages/EventPage'
import { NotFound } from './components/NotFound'
import { ActivityPage} from './pages/ActivityPage';
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
          <T13CookieConsent isLoggedIn={state.isLoggedIn}/>
          <Navigation />
        </header>
        <main>
          <Switch>
            <Redirect exact from="/" to="/frontend/" />
            <Route path="/frontend/event/:id/:name" component={EventPage} />
            <Route path="/frontend/activity/:id/:name" component={ActivityPage} />
            <Route path="/frontend/event_type/:id/:name" component={EventTypePage} />
            <Route path="/frontend/activity_type/:id/:name" component={ActivityTypePage} />

            <Route path="/frontend/activitytypes" component={ActivityTypesPage} />
            <Route path="/frontend/eventtypes" component={EventTypesPage} />
            <Route path="/frontend/faq/:id" component={FAQPage} />
            <Route path="/frontend/faq" component={FAQPage} />

            <Route path="/frontend/member/:id" component={MemberPage} />
            <Route path="/frontend/delistrequest/:id" component={ActivityDelistRequestPage} />
            <Route path="/frontend/delistrequest" component={ActivityDelistRequestPage} />

            {!state.isLoggedIn ?
              <>
                <Route path="/frontend/welcome" component={WelcomePage} />
                <Redirect to="/frontend/welcome" />
              </>
              :
              <>
                <Route path="/frontend/profile" component={ProfilePage} />
                <Route path="/frontend/home" component={MyActivitiesPage} />

                <Route path="/frontend/verify/phone" component={VerifyPhonePage} />
                <Route path="/frontend/verify/email" component={VerifyEmailPage} />

                <Redirect exact from="/frontend/" to="/frontend/home" />
                <Redirect exact from="/frontend/welcome" to="/frontend/home" />
              </>
            }
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </BrowserRouter >
    </UserProvider>
  );
}

const T13CookieConsent = (props:{isLoggedIn:boolean}) => {
  const {isLoggedIn} = props;

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
    </footer>
  );
}

export default App;
