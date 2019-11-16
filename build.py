#!/usr/bin/env python3.7

from subprocess import run
import shutil, os, os.path

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def clean():
    static_dir = os.path.join(ROOT_DIR, 'static')
    if os.path.exists(static_dir):
        print ("Deleting " + static_dir)
        shutil.rmtree(static_dir)

def build():
    run(('npm','run','build'), check=True, cwd='frontend',shell=True)
    run(('python','manage.py','collectstatic'), check=True)
    run(('python','manage.py','check'), check=True)

def updatedb():
    run(('python','manage.py','makemigrations'), check=True)
    run(('python','manage.py','migrate'), check=True)

def test():
    testEnv = os.environ.update({'CI':'true'})
    print("\n == NPM TEST")
    run(('npm','run','test'), check=True, env=testEnv, cwd='frontend', shell=True)

    print("\n == PYTHON TEST")
    run(('python','manage.py','test'), check=True, env=testEnv)    

if __name__ == '__main__':
    print("Working in " + ROOT_DIR + " ...")
    os.chdir(ROOT_DIR)

    for f in [clean, build, updatedb, test]:        
        print ("\n === {} ===\n".format(f.__name__))
        f()

    print ("SUCCESS!")
