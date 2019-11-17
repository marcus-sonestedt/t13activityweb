import os.path
import logging
from django.http.response import HttpResponse, HttpResponseNotFound
from django.shortcuts import redirect
from django.views.decorators.cache import cache_page, cache_control

logger = logging.getLogger(__name__)

@cache_page(60 * 15)
@cache_control(max_age=60*20)
def index(request, *path):
    # redirect to static if found there, otherwise return
    # index.html to serve react page for all frontend urls

    fullpath = ''.join(path)
    logger.info("index => {}".format(fullpath))

    if path != ('',''):
        file = os.path.join(os.path.dirname(__file__), "build", fullpath)
        if os.path.exists(file):
            logger.info("index {} => {} exists!".format(path, file))
            return redirect('/static/{}'.format(fullpath))
        else:
            logger.info("index {} => {} does not exist!".format(path, file))


    if fullpath.endswith('.chunk.js') or fullpath.endswith('chunk.css'):
        return redirect('/static/' + fullpath)
        #raise HttpResponseNotFound("Not found")

    # On better web server (apache, nginx, etc),
    # a rewrite or X-Sendfile can be used instead of having python
    # reading the flie from disc, 
    # see # https://stackoverflow.com/questions/2294507/how-to-return-static-files-passing-through-a-view-in-django

    index_html = os.path.join(os.path.dirname(__file__), "build", "index.html")
    response = HttpResponse(content=open(index_html, 'rb'))
    response['Content-Type'] = 'text/html'
    return response

@cache_page(60 * 60)
@cache_control(max_age=60*60)
def static(request, *path):
    # TODO: figure out how to get react to get things right, or django to serve
    #       static under frontend too.. Probably easier with a proper  web server

    target = '/static/static/' + path[1]
    logger.info("static {} => {}".format(path, target))

    return redirect(target)
