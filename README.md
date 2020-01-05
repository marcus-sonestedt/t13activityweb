# T13 Activity Web

Website to help organizations &amp; clubs coordinate activities amongst their members, especially my local karting club.

[Master: ![Build Status](https://lolworx.visualstudio.com/Team13%20GKRC/_apis/build/status/marcusl.t13activityweb?branchName=master)](https://lolworx.visualstudio.com/Team13%20GKRC/_build/latest?definitionId=1&branchName=master)
[Dev: ![Build Status](https://lolworx.visualstudio.com/Team13%20GKRC/_apis/build/status/marcusl.t13activityweb?branchName=dev)](https://lolworx.visualstudio.com/Team13%20GKRC/_build/latest?definitionId=1&branchName=dev)
Release: ![Release status](https://lolworx.vsrm.visualstudio.com/_apis/public/Release/badge/5ac7801c-5d6e-4ee5-9f5c-e3326d62df94/1/1)

Developed by [Marcus Sonestedt](https://www.github.com/marcusl) under the [Affero GPL license](https://en.wikipedia.org/wiki/Affero_General_Public_License).

## Data model

* EventTypes - race day, training week, track work day or club barbequeue
* Events - a specific race or similar time-bound event of some type
* ActivityType - a role that has to be filled during an event, flag marshal, pre-grid controller or technical scrutineer for races, carpenter or painter for work days or grillmeister and saucemaster for barbequeues.
* Activity - a specific activity of given type for an event, which can be assigned to a user
* Member - person able to perform an Activity, possible linked to a web site User
* ActivityDelistRequest - request by member to be delisted from an activity, must be approved/rejected by staff to have an effect, unless someone else
books that activity

## Development

* Any OS should work, although it has been devleoped on Windows with the goal to support running on Linux in production.
* Visual Studio Code is an free and excellent editor.
* Visual Studio Community/Professional is also usable.

### Architecture Overview

This project was set-up with inspiration from [this blog](https://www.valentinog.com/blog/drf/) but using  Typescript instead of Javascript for the React frontend for type safety.

Currently, the React-based frontend is served via the Django web server but it could be moved to a fast, static website/CDN in the future.

The end-user part of the front-end is written in React to
work as a single-page web application, putting most of the
work on the client and leaving the server with only delivering
data and answering terse api-calls.

For administrators, a classic render-html-on-server approach
via the regular Django framework is used, mostly because we
want to use Django's great autogenerated admin-site to enter
and adjust the backing data

### Backend

Uses [Django](https://www.djangoproject.com) & [Django REST Framework](https://www.django-rest-framework.org/).

By default, uses the [SQLite](https://www.sqlite.org/) db during development, which runs in-process against a single file.

* Install [Python 3.7](https://www.python.org) or later

* Create a virtual python environment

```bash
python -m venv env
```

* Activate it:

  * On Windows:

    ```cmd
    env/scripts/activate
    ```

  * On Linux:

    ```bash
    source env/scripts/activate
    ```

* Install required packages (into the virtual environment)  
  This must be done whenever requirements.txt is updated)

```bash
python -m pip install -r requirements.txt
```

* Init database, apply any new migrations and populate tables

```bash
python manage.py createsuperuser
python manage.py migrate
python manage.py loaddata testdata
```

* Start development server

```bash
python manage.py runserver
```

### FrontEnd

Uses [React](https://reactjs.org), TypeScript and Bootstrap.

* Install [Node.js](https://nodejs.org)

* Go into frontend dir

  ```bash
  cd frontend
  ```

* Install packages:  
  This must be done whenever frontend/packages.json is updated.

  ```bash
  npm install
  ```

* Start development server

  ```bash
  npm run start
  ```

## Setup running in production

* Perform steps for backend & frontend above except starting servers
* In repo root, run the build.py script:  

  ```bash
  python ./build.py
  ```

  This builds the frontend and copies static files to where Django expects them.

* Setup the Django site as a WSGI app on your web host:

    ```python
    import os
    import sys

    # assuming your django settings file is at '/home/macke/t13activityweb/T13ActivityWeb/settings.py'
    # and your manage.py is is at '/home/macke/t13activityweb/manage.py'
    path = '/home/macke/t13activityweb'
    if path not in sys.path:
        sys.path.append(path)

    os.environ['DJANGO_SETTINGS_MODULE'] = 'T13ActivityWeb.settings'

    # then:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    ```

* Start your server!

## Update individual packages

### Frontend/NPM

Check outdated packages

```bash
npm outdated
```

Then update (save/save-dev depending if used during runtime or not)

```bash
npm install <package>@latest --save[-dev]
```

### Backend/PIP

List outdated packages:

```bash
python -m pip list --outdated
```

Update via [pipupgrade](https://github.com/achillesrasquinha/pipupgrade),
or any another method recommended [here](https://stackoverflow.com/questions/2720014/how-to-upgrade-all-python-packages-with-pip).

```bash
python -m pip install pipupgrade
python -m pip upgrade --latest --yes
```

## Third-party services

### ReCaptcha

**NOTE**: Disabled for now as something is not working right... :-|

Purpose:

* Verify that users registering and/or logging in are humans

Setup:

* Get the two keys from [Admin Console](https://www.google.com/recaptcha/admin/).
* Add these to secrets.py

Usage:

* Website uses the django-recaptcha library to integrate into login/register forms.  
  The forms have a ReCaptcha field and the require

### Twilio

Purpose:

* send/receive SMSes.
* verifying phone numbers (via SMS)

Setup:

* Create phone number (for SMS source) and get api keys from their [Admin Console](https://www.twilio.com/console/).

* Create a messaging service and configure webhook to point to our server's 'api/sms' view to receive SMS.

Usage:

* Web site uses Twilio's python library to send SMS and verify phone numbers.

### Sendgrid (by Twilio)

Purpose:

* Send lots of emails.

Setup:

* Get API key from [Admin Console](https://app.sendgrid.com/).

Usage:

* Web site uses Sendgrid's SMTP relay to use Django's existing email code easily.
