import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  getFirestore,
  deleteField,
  documentId,
  collection,
  query,
  where,
  writeBatch
} from 'firebase/firestore';

export class CmsClient {
  static COLL_ID = 'cms';
  static COLL_EDITOR_ID = 'cms-editor';
  static SECTIONS_DOC_ID = 'sections';

  static async readCms(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    const db = getFirestore();
    const coll = collection(db, CmsClient.COLL_ID);
    const q = await query(coll, where(documentId(), 'in', keys));
    const querySnapshot = await getDocs(q);
    const responseMap = {}
    querySnapshot.forEach((doc) => {
      responseMap[doc.id] = doc.data();
    });

    const dataPerKey = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let data;
      if (key in responseMap) {
        data = responseMap[key];
      } else {
        data = {};
        console.warn(`CMS Data for section ${keys[i]} does not exist.`);
      }
      dataPerKey.push(data);
    }

    return dataPerKey;
  }

  /**
   * Read every section name from the sections document.
   */
  static async readCmsSections() {
    const db = getFirestore();
    const docRef = doc(db, CmsClient.COLL_EDITOR_ID, CmsClient.SECTIONS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const sortedKeys = Object.keys(data).sort();
      return sortedKeys;
    } else {
      console.warn('No Sections Document');
      return [];
    }
  }

  static async updateCms(key, data) {
    for (const dataKey of Object.keys(data)) {
      // replace falsy data with a delete operation.
      if (!data[dataKey]) {
        data[dataKey] = deleteField();
      }
    }

    const db = getFirestore();

    const batch = writeBatch(db);

    const docRef = doc(db, CmsClient.COLL_ID, key);
    batch.set(docRef, data, {merge: true});

    const sectionRef = doc(db, CmsClient.COLL_EDITOR_ID, CmsClient.SECTIONS_DOC_ID);
    batch.set(sectionRef, {[key]: true}, {merge: true}); // Keep a reference to the document id for the section.

    await batch.commit();

    await setDoc(docRef, data, {merge: true});
  }

  static async deleteCmsSection(key) {
    const db = getFirestore();
    const batch = writeBatch(db);

    const docRef = doc(db, CmsClient.COLL_ID, key);
    batch.delete(docRef);

    const sectionRef = doc(db, CmsClient.COLL_EDITOR_ID, CmsClient.SECTIONS_DOC_ID);
    batch.set(sectionRef, {[key]: deleteField()}, {merge: true}); // Remove reference to the document id for the section.

    await batch.commit();
  }
}
