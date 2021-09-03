## react-cms-firestore


Wrap your component in `withCms` to have `props.cms` injected into your components.

CMS data is downloaded from the Firestore.

the second argument to `withCms` defines the CMS entries injected into the component.

Import looks like:

`import withCms from "react-cms-firestore/withCms";`

Usage often looks like this:

`export default withCms(MyScreen, 'MyScreenData');`

or 

`export default withCms(MyComponent, ['entry1', 'entry2']);`


Then the data can be accessed like:

```
const {cms} = props;
const {footerCms, headerCms} = cms;
const {footerTitle} = footerCms;
const {headerLogoUrl} = headerCms;
...
```


### Initialization

Add a collection called `cms` to your Firestore.
Add a collection called `cms-editor` to your Firestore.
Add a collection called `roles` to your Firestore.

`roles` contains documents where each document id is a uid and
the document data looks like:
```
{
    editor: true
}
```

####Security Rules
```
function isEditor() {
  return request.auth != null && get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.editor == true;
}

match /cms/{id} {
  allow read: if true;
  allow write: if isEditor();
}

match /cms-editor/{id} {
  allow read: if isEditor();
  allow write: if isEditor();
}
```


The Firestore needs to be initialized in the code before `withCms` is used.
