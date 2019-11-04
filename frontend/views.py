import os.path
import logging
from django.http.response import HttpResponse
from django.shortcuts import redirect

logger = logging.getLogger(__name__)

# Create your views here.

def index(request, *path):
    # if on better web server, x-sendfile can be used instead, see
    # https://stackoverflow.com/questions/2294507/how-to-return-static-files-passing-through-a-view-in-django

    if path != ('',):
        file = os.path.join(os.path.dirname(__file__), "build", *path)
        if os.path.exists(file):
            logger.info("{} => {} exixts!".format(path, file))
            return redirect('/static/' + '/'.join(path))

    logger.info("{} => index.html ...".format(path))

    index_html = os.path.join(os.path.dirname(__file__), "build", "index.html")
    react_index = open(index_html, 'rb')
    response = HttpResponse(content=react_index)
    response['Content-Type'] = 'text/html'
    return response

def static(request, path):
    # TODO: figure out how to get react to get things right, or django to serve
    #       static under frontend/
    logger.info("{} static!".format(path))

    return redirect('/static/static/' + path, permanent=True)
