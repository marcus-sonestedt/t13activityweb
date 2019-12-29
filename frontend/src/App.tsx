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
import { ActivityDelistRequestView } from './views/ActivityDelistRequestsView';
import { EventTypesView } from './views/EventTypesView';
import { ActivityTypesView } from './views/ActivityTypesView';
import FAQView from './views/FAQView';
import ProfileView from './views/ProfileView';
import { deserialize } from 'class-transformer';
import CookieConsent from "react-cookie-consent";

export class UserContext {
  isLoggedIn = false;
  isStaff = false;
  memberId = '';
  userId = '';
  fullname = '';
}

export const userContext = React.createContext(new UserContext());
export const UserProvider = userContext.Provider
export const UserConsumer = userContext.Consumer

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
            <Route path="/frontend/event/:id/:name" component={EventView} />
            <Route path="/frontend/activity/:id/:name" component={ActivityView} />
            <Route path="/frontend/event_type/:id/:name" component={EventTypeView} />
            <Route path="/frontend/activity_type/:id/:name" component={ActivityTypeView} />

            <Route path="/frontend/activitytypes" component={ActivityTypesView} />
            <Route path="/frontend/eventtypes" component={EventTypesView} />
            <Route path="/frontend/faq" component={FAQView} />

            <Route path="/frontend/member/:id" component={MemberView} />
            <Route path="/frontend/delistrequests" component={ActivityDelistRequestView} />

            {!state.isLoggedIn ?
              <>
                <Route path="/frontend/welcome" component={Welcome} />
                <Redirect to="/frontend/welcome" />
              </>
              :
              <>
                <Route path="/frontend/profile" component={ProfileView} />
                <Route path="/frontend/home" component={MemberHomeView} />
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

export const Redirect2 =
  (props: { from: string, toFunc: (url: string) => string }) => {
    const location = useLocation();
    const to = props.toFunc(location.pathname);
    return <Redirect from={props.from} to={to} />
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
