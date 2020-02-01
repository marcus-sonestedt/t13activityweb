
from app.views import url_patterns as views_urls

from app.api.api_core import url_patterns as core_urls
from app.api.api_user import url_patterns as user_urls
from app.api.api_adr import url_patterns as adr_urls
from app.api.api_sms_email import url_patterns as sms_urls
from app.api.api_proxy import url_patterns as proxy_urls
from app.api.api_member import url_patterns as member_urls

urlpatterns = views_urls

api_urlpatterns = core_urls + adr_urls + sms_urls + user_urls + proxy_urls + member_urls
