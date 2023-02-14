# collect urls for "master" (T13ActivityWeb) urls.py

from t13reg.views import url_patterns as views_urls
from t13reg.api.api import url_patterns as api_urls

urlpatterns = views_urls
api_urlpatterns = api_urls
