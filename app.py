import os
import numpy as np
import pandas as pd
import json
from warnings import simplefilter
from pathlib import Path
from flask import Flask, render_template, request, session, url_for, flash, \
                get_flashed_messages, redirect
from flask_session import Session
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import create_engine, text, bindparam
from sqlalchemy.orm import scoped_session, sessionmaker
from utils import login_required
from model.model import get_prediction, get_feature_contribution, ProcCategory, \
                        preprocess, keep_cols, cols


simplefilter(action='ignore', category=FutureWarning)


DATABASE_URL = "sqlite:///churn.db"
UPLOAD_FOLDER = Path('data')

app = Flask(__name__)

app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = "filesystem"

Session(app)

engine = create_engine(DATABASE_URL) 

# db = engine.connect(check_same_thread=False)

@app.route('/')
@login_required
def index():
    db = scoped_session(sessionmaker(bind=engine)) 
    data = db.execute("SELECT * FROM customer").fetchall()

    calls = [row.customer_service_calls for row in data]
    intl = [row.international_plan for row in data]
    churn = np.array([True if row.status=='TRUE' else False for row in data])

    churn_count = len(churn[churn==True])
    non_churn_count = len(churn[churn==False])
    df = pd.DataFrame({'calls':calls, 'churn':churn , 'intl':intl})
    churn_call = df[df['churn']==True]['calls'].value_counts().to_dict()
    non_churn_call = df[df['churn']==False]['calls'].value_counts().to_dict()

    churn_intl = df[df['churn']==True]['intl'].value_counts().to_dict()
    non_churn_intl = df[df['churn']==False]['intl'].value_counts().to_dict()
    return render_template('index.html', data=data, 
                            call_count=json.dumps([non_churn_call, churn_call]),
                            intl_count=json.dumps([non_churn_intl, churn_intl]),
                            churn_count=json.dumps([non_churn_count, churn_count]))


@app.route('/delete', methods=['POST'])
def delete_entries():
    db = scoped_session(sessionmaker(bind=engine)) 
    if request.form.get('deleteAll'):
        query = "DELETE FROM customer"
        db.execute(query)
        db.commit()
    else:
        data = request.form.getlist('box', type=int)
        query = "DELETE FROM customer WHERE id IN :values"
        query = text(query).bindparams(bindparam('values', expanding=True))
        db.execute(query, {"values":data})
        db.commit()
    flash("Deletion complete")
    return redirect(url_for('index'))


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    db = scoped_session(sessionmaker(bind=engine))
    data_file = request.files.get('dataFile')
    file_name = secure_filename(data_file.filename)
    if os.path.exists(os.path.join(UPLOAD_FOLDER, file_name)):
        file_name = "dup" + os.path.join(UPLOAD_FOLDER, file_name)
        data_file.save(file_name)
    else:
        file_name = os.path.join(UPLOAD_FOLDER, file_name)
        data_file.save(file_name)

    df = pd.read_csv(file_name)
    status, proba = get_prediction(df)
    df['churn_pct'] = np.round(proba, 2)
    df['churn'] = status
    query = """INSERT INTO customer (state_name, state, account_length, phone_number, international_plan,
                                    voice_mail_plan, number_vmail_messages, total_day_minutes, total_day_calls,
                                    total_day_charge, total_eve_minutes, total_eve_calls, total_eve_charge,
                                    total_night_minutes, total_night_calls, total_night_charge, 
                                    total_intl_minutes, total_intl_calls, total_intl_charge, customer_services_calls, 
                                    churn_pct, status)
                values :values"""
    query = text(query).bindparams(bindparam('values', expanding=True))
    for row in df.values:
        db.execute(query, {"values":list(row)})
    
    db.commit()
    flash("Upload complete!")
    return redirect(url_for('index'))


@app.route('/customer/<int:id>')
def customer(id):
    db = scoped_session(sessionmaker(bind=engine))
    info = db.execute("SELECT * FROM customer WHERE id=:id", 
                      {"id":id}).fetchall()[0]
    temp = np.delete(cols, 21)
    row = [info[col] for col in temp]
    df = pd.DataFrame({col:[row[idx]] for idx, col in enumerate(temp)})
    df = preprocess(df)[keep_cols]
    contrib = get_feature_contribution(df)
    return render_template("customer.html", data=info, contrib=contrib)


@app.route('/login', methods=['GET', 'POST'])
def login():
    db = scoped_session(sessionmaker(bind=engine)) 

    session.clear()
    if request.method=="POST":

        rows = db.execute("SELECT * FROM user WHERE username = :username",
                          {"username":request.form.get("username")}).fetchall()

        if len(rows) != 1 :
            flash("Username does not exist")
            return render_template("login.html")

        elif not check_password_hash(rows[0]["hash"], request.form["password"]):
            flash("Invalid password")
            return render_template("login.html")
        session["user_id"] = rows[0]["id"]
        return redirect("/")

    else:
        return render_template("login.html")


@app.route('/logout')
def logout():
    session.clear()
    return redirect("/login")


@app.route('/register', methods=['GET', 'POST'])
def register():
    db = scoped_session(sessionmaker(bind=engine)) 

    if request.method == "POST":
        if request.form["password"]!=request.form["confirm"]:
            flash("Password does not match")
            render_template("register.html")
        username = request.form['username']
        hash_val = generate_password_hash(request.form['password'])

        result = db.execute("SELECT COUNT(*) FROM user WHERE username = :username",
                            {"username":username}).fetchall()
        if result[0][0]:
            flash("User already exist")
            return render_template("register.html")
         
        db.execute("INSERT INTO user (username, hash) VALUES (:username, :hash_val)",
                            {"username":username,
                             "hash_val":hash_val})  
        db.commit()         
        # session["user_id"] = rows[0]["id"]
        return redirect("/login")
       
    else:
        return render_template("register.html")