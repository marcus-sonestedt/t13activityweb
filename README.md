# T13 Activity Web

Website to help organizations &amp; clubs coordinate activities amongst their members, especially my local karting club.

Developed by [Marcus Sonestedt](https://www.github.com/marcusl) under the [Affero GPL license](https://en.wikipedia.org/wiki/Affero_General_Public_License).

## Development QuickStart

* Any OS should work, although it has been devleoped on Windows and will probablu run on Linux in production.
* Visual Studio Code is an free and excellent editor.
* Visual Studio Community/Professional is also usable.

### FrontEnd

Uses [React](https://reactjs.org), TypeScript and Bootstrap.

* Install [Node.js](https://nodejs.org)
* Install packages:

```bash
cd Frontend
npm install
```

* Start development server
```
npm start
```

### Backend

Uses [Django](https://www.djangoproject.com) & [Django REST Framework](https://www.django-rest-framework.org/).

By default, uses the [SQLite](https://www.sqlite.org/) db during development, which runs in-process against a single file.

* Install [Python](https://www.python.org)

* Create and activate a virtual python environment
```bash
cd Backend
python -m venv env
env/scripts/activate
```

* Instlal packages
```bash
python -m pip install -r requirements.txt
```

* Init database and populate tables
```bash
python manage.py createsuperuser
python manage.py loaddata testdata
```

* Start development server
```bash
python manage.py runserver
```
