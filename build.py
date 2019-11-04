#!python

from subprocess import run
import os.path
from os.path import join as pj

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def buildFrontend():
    run(('npm','run','build'), check=True, cwd=pj(ROOT_DIR, 'frontend'), shell=True)
    run(('python','manage.py','collectstatic'), check=True, cwd=ROOT_DIR)

if __name__ == '__main__':
    print("Working in " + ROOT_DIR)

    buildFrontend()