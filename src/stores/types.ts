import type firebaseAdmin from 'firebase-admin'

export type CollectionReference =
  | firebase.firestore.CollectionReference
  | firebaseAdmin.firestore.CollectionReference

export type DocumentSnapshot =
  | firebase.firestore.DocumentSnapshot
  | firebaseAdmin.firestore.DocumentSnapshot

export type FieldValue =
  | firebase.firestore.FieldValue
  | firebaseAdmin.firestore.FieldValue

export type Firestore =
  | firebase.firestore.Firestore
  | firebaseAdmin.firestore.Firestore

export type Query = firebase.firestore.Query | firebaseAdmin.firestore.Query

export type QueryDocumentSnapshot =
  | firebase.firestore.QueryDocumentSnapshot
  | firebaseAdmin.firestore.QueryDocumentSnapshot

export type QuerySnapshot =
  | firebase.firestore.QuerySnapshot
  | firebaseAdmin.firestore.QuerySnapshot

export type Timestamp =
  | firebase.firestore.Timestamp
  | firebaseAdmin.firestore.Timestamp
