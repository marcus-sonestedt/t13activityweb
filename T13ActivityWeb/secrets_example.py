#RECAPTCHA_PUBLIC_KEY = 'client_key'
#RECAPTCHA_PRIVATE_KEY = 'site_key'

#TWILIO_ACCOUNT_SID = 'sid'
#TWILIO_AUTH_TOKEN = 'token'
#TWILIO_VERIFY_SID = 'sid2'

#SMS_FROM_NUMBER = 'TEAM13 LOCAL'

# if using google & 2FA, use an application password, see https://accounts.google.com
#EMAIL_HOST = 'smtp.gmail.com'
#EMAIL_HOST_USER = 'firstname.lastname@gmail.com'
#EMAIL_HOST_PASSWORD = 'verysecret' 
#EMAIL_PORT = 587
#EMAIL_USE_TLS = True

#SENDGRID_API_KEY = 'secret'

# will get emails with site errors
ADMINS = [
#    ('My Name', 'firstname.lastname@gmail.com')
]

# will get content notifications (broken links, new users, etc)
MANAGERS = [
    #('Manager Name', 'firstname.lastname@gmail.com'),
]

SERVER_EMAIL = DEFAULT_FROM_EMAIL = 'noreply@mysite.org'

DEBUG = True

