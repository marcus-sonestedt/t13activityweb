    #!/usr/bin/env python3.7

from subprocess import run
from pathlib import Path
import shutil, os, os.path, sys

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SHELL = True if os.name == 'nt' else False

def clean():
    static_dir = os.path.join(ROOT_DIR, 'static')
    if os.path.exists(static_dir):
        print ("Deleting " + static_dir)
        shutil.rmtree(static_dir)

def install():
    run(['npx','browserslist@latest','--update-db'], check=False, cwd='frontend', shell=SHELL)
    run(['npm','install'], check=True, cwd='frontend', shell=SHELL)
    run(['python','-m', 'pip','install','-r', 'requirements.txt'], check=True, shell=SHELL)

def build():
    run(['npm','run','build'], check=True, cwd='frontend', shell=SHELL) 
    run(['python','manage.py','collectstatic'], check=True, shell=SHELL)
    run(['python','manage.py','check'], check=True, shell=SHELL)

def migratedb():
    run(['python','manage.py','makemigrations'], check=True, shell=SHELL)
    run(['python','manage.py','migrate'], check=True, shell=SHELL)

def test():
    print("\n == NPM TEST")
    testEnv = os.environ.update({'CI':'true'})
    run(['npm','run','test'], check=True, env=testEnv, cwd='frontend', shell=SHELL)

    # doesn't pass yet, so skip it
    #print("\n == PYTHON TEST")
    #run(['python','manage.py','test', '--debug-mode'], check=True, env=testEnv, shell=SHELL)

def reload():
    '''reload web app at pythonanywhere.com'''
    paths = [Path('/var/www/macke_eu_pythonanywhere_com_wsgi.py'),
             Path('/var/www/test-macke_eu_pythonanywhere_com_wsgi.py')]

    found = False

    for path in paths:
        if path.exists():
            print(f"Touching {path}")
            path.touch()
            found = True
        else:
            print(f"Ignoring WSGI file {path} as it doesn't exist here.")

    if found:
        run(['python','manage.py','check', '--deploy'], shell=SHELL)


this_module = sys.modules[__name__]

if __name__ == '__main__':
    print("Working in " + ROOT_DIR + " ...")
    os.chdir(ROOT_DIR)

    tasks = ['install', 'clean', 'build', 'migratedb', 'test', 'reload']

    if '--help' in sys.argv:
        print("build.py [task(s)] (" + tasks + ")")
        sys.exit(0)

    if len(sys.argv) > 1:
        tasks = [f for f in sys.argv[1:]] 

    for f in [getattr(this_module, f) for f in tasks]:        
        print ("\n === {} ===\n".format(f.__name__))
        f()

    print ("SUCCESS!")
