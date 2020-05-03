import pickle
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from treeinterpreter import treeinterpreter as ti


STORAGE_PATH = Path('./model/storage')

cat_var = ['state', 'international_plan', 'voice_mail_plan', 'many_service_call']
cols = ['id','state_name', 'state','account_length', 'phone_number', 'international_plan', 'voice_mail_plan', 'number_vmail_messages',
        'total_day_minutes', 'total_day_calls', 'total_day_charge', 'total_eve_minutes', 'total_eve_calls', 'total_eve_charge',
        'total_night_minutes','total_night_calls', 'total_night_charge', 'total_intl_minutes', 'total_intl_calls', 'total_intl_charge', 
        'customer_service_calls', 'many_service_call']
keep_cols = np.load(STORAGE_PATH/'keep_cols.npy')
model = joblib.load(STORAGE_PATH/'rf.joblib')



class DFProc():
    def __call__(self, df, test=False):
        func = self.apply_test if test else self.apply_train
        return func(df)
    def apply_train(self, df):
        raise NotImplementedError
    def apply_test(self, df):
        self.apply_train(df)


# Encode categorical variables      
class ProcCategory(DFProc):
    def __init__(self, cat_names):
        self.cat_names = cat_names
        self.categories = {}
        
    def apply_train(self, df):
        for i in self.cat_names:
            df.loc[:, i] = df.loc[:, i].astype('category').cat.as_ordered()
            self.categories[i] = df.loc[:, i].cat.categories
            df[i] = df[i].cat.codes
        return df   
    def apply_test(self, df):
        for i in self.cat_names:
            df[i] = pd.Categorical(df[i], categories=self.categories[i])
            df[i] = df[i].cat.codes
        return df


# Normalize numeric variables   
class Normalize(DFProc):
    def __init__(self, cont_vars):
        self.cont_vars = cont_vars
        self.means = {}
        self.stds = {}
    
    def apply_train(self, df):
        for c in self.cont_vars:
            self.means[c] = df.loc[:, c].mean()
            self.stds[c] = df.loc[:, c].std()
            df.loc[:, c] = (df.loc[:, c] - self.means[c]) / (1e-7 + self.stds[c])
        return df
    
    def apply_test(self, df):
        for c in self.cont_vars:
            df.loc[:, c] = (df.loc[:, c] - self.means[c]) / (1e-7 + self.stds[c])
        return df


def preprocess(df):
    cat_proc = ProcCategory(cat_var)
    cat_proc.categories = pickle.load(open(STORAGE_PATH/'categories.pkl', 'rb'))
    df = df.drop('phone_number', axis=1)
    df['many_service_call'] = df['customer_service_calls'] >= 4
    df = cat_proc(df, test=True)
    return df


def get_prediction(df):
    df = preprocess(df)[keep_cols]
    classes = model.predict(df.values)
    proba = model.predict_proba(df)[:, 1]
    df = df.drop('many_service_call', axis=1)
    return classes, proba 

def get_feature_contribution(df):
    prediction, bias, contributions = ti.predict(model, df.values)
    contribution = contributions.squeeze()[:, 1]
    idx = np.argsort(contribution)
    return {o[0]: o[1] for o in zip(df.columns[idx], contribution[idx])}