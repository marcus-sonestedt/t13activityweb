"""
Django rest framework default pagination
"""
from rest_framework.pagination import PageNumberPagination


class DefaultResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 2000