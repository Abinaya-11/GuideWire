# filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\ml\train_model.py
"""
Train a tiny logistic regression on mock data and save model to ml/model.joblib
"""
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from joblib import dump
import os

df = pd.read_csv("mock_data.csv")
X = df[["avg_rainfall_mm", "delivery_density", "elevation_m"]]
y = df["high_risk"]
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

clf = LogisticRegression()
clf.fit(X_train, y_train)
print("Train accuracy:", clf.score(X_train, y_train))
print("Test accuracy:", clf.score(X_test, y_test))

os.makedirs("model", exist_ok=True)
dump(clf, "model/model.joblib")
print("Saved model/model.joblib")
