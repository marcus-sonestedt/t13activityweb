def disable_api_cache_middleware(get_response):

    def middleware(request):
        response = get_response(request)
        if request.path_info.startswith('/api/') and response.get('Cache-Control') is None:
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response

    return middleware