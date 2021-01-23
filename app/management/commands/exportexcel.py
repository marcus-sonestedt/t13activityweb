import datetime

from django.core.management.base import BaseCommand, CommandError
from app.excel import exportScheduleToExcel

class Command(BaseCommand):
    help = "Exports a year's schedule to an MS Excel file"

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help="Excel file path")
        parser.add_argument('--year', type=int, help="Year of data")

    def handle(self, *args, **options):
        year = options['year'] or datetime.date.today().year
        outfile = options['file'] or f'Aktivitetslista T13 {year}.xlsx'

        exportScheduleToExcel(outfile, year)
