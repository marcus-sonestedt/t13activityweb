from django.core.management.base import BaseCommand, CommandError
from app.excel import importDataFromExcel

class Command(BaseCommand):
    help = 'Imports an excelfile'

    def add_arguments(self, parser):
        parser.add_argument('file', type=str, help="Excel file path")
        parser.add_argument('--year', type=int, default=2019, help="Year of data")

    def handle(self, *args, **options):
        with open(options['file'], 'rb') as file:
            importDataFromExcel(file, options['year'])