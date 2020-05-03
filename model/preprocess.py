import pandas as pd
import numpy as np
import pickle

cat_var = ['state_name', 'state', 'international_plan', 'voice_mail_plan', 'many_service_call']
num_var = ['account_length', 'number_vmail_messages', 'total_day_minutes', 'total_day_calls', 'total_day_charge',
           'total_eve_minutes', 'total_eve_calls', 'total_eve_charge', 'total_night_minutes', 'total_night_calls',
           'total_night_charge', 'total_intl_minutes', 'total_intl_calls', 'total_intl_charge', 'customer_service_calls']
