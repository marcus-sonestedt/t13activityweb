import os.path
import logging
from django.http.response import HttpResponse, HttpResponseNotFound
from django.shortcuts import redirect
from django.views.decorators.cache import cache_page, cache_control
from T13ActivityWeb.settings import STATIC_ROOT

logger = logging.getLogger(__name__)


@cache_page(60 * 15)
@cache_control(max_age=60*20)
def index(request, *path):
    # redirect to static if found there, otherwise return
    # index.html to serve react page for all frontend urls

    fullpath = ''.join(path)
    logger.debug("index => '{}'".format(fullpath))

    if path != ('', ''):
        file = os.path.join(os.path.dirname(__file__),
                            "build", fullpath.replace('/', os.sep))
        if os.path.exists(file):
            logger.debug("index {} => {} exists!".format(path, file))
            return redirect('/static/{}'.format(fullpath))
        else:
            logger.debug("index {} => {} does not exist!".format(path, file))

    if fullpath.endswith('.chunk.js') or fullpath.endswith('.chunk.css'):
        return redirect('/static/' + fullpath)
        #raise HttpResponseNotFound("Not found")

    # On better web server (apache, nginx, etc),
    # a rewrite or X-Sendfile can be used instead of having python
    # reading the flie from disc,
    # see # https://stackoverflow.com/questions/2294507/how-to-return-static-files-passing-through-a-view-in-django

    index_html = os.path.join(STATIC_ROOT, "index.html")
    response = HttpResponse(content=open(index_html, 'rb'))
    response['Content-Type'] = 'text/html'
    return response
